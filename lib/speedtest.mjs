// Toaster speed test: measurement only, no DOM. Ported from legacy/script.js.

const ENDPOINTS = {
  down: "https://speed.cloudflare.com/__down",
  up: "https://speed.cloudflare.com/__up",
  meta: "https://speed.cloudflare.com/meta",
};

const DOWNLOAD_DURATION = 8000; // ms
const DOWNLOAD_BYTES = 25_000_000;
const LATENCY_SAMPLES = 12;
const UPLOAD_DURATION = 6000;
const UPLOAD_CHUNK = 4_000_000;
const LIVE_INTERVAL = 100; // ms between live readings sent to the UI

export const SLOW_MBPS = 50;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const mbps = (bytes, seconds) => (bytes * 8) / seconds / 1_000_000;

export function median(arr) {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

// Average of the top 60% of samples: resists slow first-chunk warmup.
export function topAverage(samples) {
  if (!samples.length) return 0;
  const s = [...samples].sort((a, b) => b - a);
  const top = s.slice(0, Math.max(1, Math.ceil(s.length * 0.6)));
  return top.reduce((a, b) => a + b, 0) / top.length;
}

async function runDownload(signal, onLive) {
  const samples = [];
  const start = performance.now();
  const url = `${ENDPOINTS.down}?bytes=${DOWNLOAD_BYTES}`;
  let lastLive = 0;
  let received = 0; // across requests, so the live reading does not reset on each new request

  while (performance.now() - start < DOWNLOAD_DURATION) {
    const t0 = performance.now();
    let bytes = 0;
    let cutShort = false;
    try {
      const res = await fetch(url, { cache: "no-store", signal });
      // A rate-limited (429) reply has a tiny body that would count as a near-zero sample.
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const reader = res.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        bytes += value.length;
        received += value.length;
        const now = performance.now();
        if (now - lastLive > LIVE_INTERVAL) {
          lastLive = now;
          onLive(mbps(received, (now - start) / 1000), Math.min(1, (now - start) / DOWNLOAD_DURATION));
        }
        // Stop mid-request at the deadline so a slow link does not run for minutes.
        if (now - start >= DOWNLOAD_DURATION) {
          reader.cancel().catch(() => {});
          cutShort = true;
          break;
        }
      }
    } catch (e) {
      if (signal.aborted) throw e;
      await sleep(200);
    }
    const seconds = (performance.now() - t0) / 1000;
    // A request cut short at the deadline is mostly connection setup; keep it only if it is all we have.
    if (seconds > 0 && bytes > 0 && !(cutShort && samples.length)) samples.push(mbps(bytes, seconds));
  }

  if (!samples.length) throw new Error("No download samples");
  return topAverage(samples);
}

async function singleLatency(signal) {
  const t0 = performance.now();
  try {
    const r = await fetch(`${ENDPOINTS.down}?bytes=0`, { cache: "no-store", signal });
    await r.arrayBuffer();
  } catch (e) {
    if (signal.aborted) throw e;
    return null;
  }
  return performance.now() - t0;
}

async function sampleLatency(signal) {
  const results = [];
  for (let i = 0; i < LATENCY_SAMPLES; i++) {
    const ms = await singleLatency(signal);
    if (ms !== null) results.push(ms);
  }
  return median(results);
}

async function measureLatency(signal) {
  await singleLatency(signal); // warmup
  return sampleLatency(signal);
}

// Saturate the connection while measuring latency in parallel.
async function measureLoadedLatency(signal) {
  const load = new AbortController();
  const loadSignal = AbortSignal.any([signal, load.signal]);
  const saturate = async () => {
    while (!loadSignal.aborted) {
      try {
        const r = await fetch(`${ENDPOINTS.down}?bytes=${DOWNLOAD_BYTES}`, {
          cache: "no-store",
          signal: loadSignal,
        });
        const reader = r.body.getReader();
        while (!(await reader.read()).done);
      } catch {
        if (!loadSignal.aborted) await sleep(200);
      }
    }
  };
  const loaders = [saturate(), saturate()];
  try {
    await sleep(400); // let it ramp
    return await sampleLatency(signal);
  } finally {
    load.abort();
    await Promise.allSettled(loaders);
  }
}

// shortcut: one 4 MB POST cannot be cut short, so a very slow uplink overruns
// UPLOAD_DURATION. Upgrade to a streamed upload body when browsers support it widely.
async function runUpload(signal) {
  const samples = [];
  const payload = new Uint8Array(UPLOAD_CHUNK); // endpoint only measures size
  const start = performance.now();

  while (performance.now() - start < UPLOAD_DURATION) {
    const t0 = performance.now();
    try {
      await fetch(ENDPOINTS.up, { method: "POST", body: payload, cache: "no-store", signal });
    } catch (e) {
      if (signal.aborted) throw e;
      await sleep(200);
      continue;
    }
    const seconds = (performance.now() - t0) / 1000;
    if (seconds > 0) samples.push(mbps(UPLOAD_CHUNK, seconds));
  }
  return topAverage(samples);
}

async function fetchJson(url, signal) {
  try {
    const r = await fetch(url, { cache: "no-store", signal });
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  }
}

// ipwho.is first, ipapi.co as fallback.
async function lookupGeo(ip, signal) {
  const a = await fetchJson(`https://ipwho.is/${ip}`, signal);
  if (a && a.success !== false) {
    return {
      org: a.connection?.isp || a.connection?.org || null,
      asn: a.connection?.asn ? `AS${a.connection.asn}` : null,
      city: a.city,
      region: a.region,
      country: a.country,
    };
  }
  const b = await fetchJson(`https://ipapi.co/${ip}/json/`, signal);
  if (b && !b.error) {
    return {
      org: b.org || null,
      asn: b.asn || null,
      city: b.city,
      region: b.region,
      country: b.country_name || b.country,
    };
  }
  return null;
}

// Public IP from ipify, edge location from Cloudflare (the only source for it).
async function fetchConnection(signal) {
  const [ipData, cf] = await Promise.all([
    fetchJson("https://api.ipify.org?format=json", signal),
    fetchJson(ENDPOINTS.meta, signal),
  ]);
  const ip = ipData?.ip || cf?.clientIp || null;
  const geo = ip ? await lookupGeo(ip, signal) : null;
  return describeConnection(ip, geo, cf);
}

export function describeConnection(ip, geo, cf) {
  const join = (parts, sep) => parts.filter(Boolean).join(sep);
  const isp =
    join([geo?.org, geo?.asn], ", ") ||
    join([cf?.asOrganization, cf?.asn && `AS${cf.asn}`], ", ");
  // Cloudflare's colo is an object ({ iata, city, cca2 }); older responses sent a bare code.
  const colo = cf?.colo;
  const edge = typeof colo === "string" ? colo : join([colo?.iata, colo?.city, colo?.cca2], ", ");
  const place = geo ? [geo.city, geo.region, geo.country] : [cf?.city, cf?.region, cf?.country];
  return {
    ip: ip || "Unavailable",
    isp: isp || "Unavailable",
    edge: edge || "Unavailable",
    location: join(place, ", ") || "Unavailable",
  };
}

// Runs the whole test. onPhase(name), onLive(mbps, progress 0..1), onResult(partial results).
export async function runTest({ signal, onPhase, onLive, onResult }) {
  onPhase("download");
  onResult({ download: await runDownload(signal, onLive) });

  const connection = fetchConnection(signal).then(onResult);

  onPhase("latency");
  onResult({ latencyIdle: await measureLatency(signal) });

  onPhase("loaded");
  onResult({ latencyLoaded: await measureLoadedLatency(signal) });

  onPhase("upload");
  onResult({ upload: await runUpload(signal) });

  await connection;
  onPhase("done");
}
