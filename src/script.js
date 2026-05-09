// ─── Toaster speed test ──────────────────────────────────────────

const speedEl  = document.getElementById("speed");
const labelEl  = document.getElementById("label");
const toastEl  = document.getElementById("toast");
const showMore = document.getElementById("show-more");
const details  = document.getElementById("details");

const ENDPOINTS = {
  down: "https://speed.cloudflare.com/__down",
  up:   "https://speed.cloudflare.com/__up",
  meta: "https://speed.cloudflare.com/meta"
};

const DOWNLOAD_DURATION = 8000;   // ms
const DOWNLOAD_BYTES    = 25_000_000;
const LATENCY_SAMPLES   = 12;
const UPLOAD_DURATION   = 6000;
const UPLOAD_CHUNK      = 4_000_000;

// ─── Show more / details toggle ─────────────────────────────────
showMore.addEventListener("click", () => {
  const isOpen = !details.hidden;
  details.hidden = isOpen;
  showMore.classList.toggle("open", !isOpen);
  showMore.querySelector("span").textContent = isOpen ? "Show more info" : "Hide info";
});

// ─── Toast ──────────────────────────────────────────────────────
function notify(text) {
  toastEl.textContent = text;
  toastEl.classList.add("show");
  setTimeout(() => toastEl.classList.remove("show"), 6000);
}

// ─── Helpers ────────────────────────────────────────────────────
function setMetric(id, value, ready = true) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = value;
  if (ready) {
    const card = el.closest(".metric");
    if (card) card.classList.add("ready");
  }
}

function median(arr) {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

// ─── Download throughput (live Mbps) ────────────────────────────
async function runDownload() {
  const samples = [];
  const start = performance.now();
  const url = `${ENDPOINTS.down}?bytes=${DOWNLOAD_BYTES}`;

  while (performance.now() - start < DOWNLOAD_DURATION) {
    const t0 = performance.now();
    let bytes = 0;

    try {
      const res = await fetch(url, { cache: "no-store" });
      const reader = res.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        bytes += value.length;
        const elapsed = (performance.now() - t0) / 1000;
        if (elapsed > 0) {
          const live = (bytes * 8) / elapsed / 1_000_000;
          speedEl.textContent = live.toFixed(2);
        }
      }
    } catch (e) {
      console.warn("Download chunk failed", e);
    }

    const total = (performance.now() - t0) / 1000;
    if (total > 0 && bytes > 0) {
      samples.push((bytes * 8) / total / 1_000_000);
    }
  }

  if (!samples.length) return 0;
  // Average of top 60% of samples → resists slow first-chunk warmup
  samples.sort((a, b) => b - a);
  const top = samples.slice(0, Math.max(1, Math.ceil(samples.length * 0.6)));
  return top.reduce((a, b) => a + b, 0) / top.length;
}

// ─── Latency probes ─────────────────────────────────────────────
async function singleLatency() {
  const t0 = performance.now();
  try {
    const r = await fetch(`${ENDPOINTS.down}?bytes=0`, { cache: "no-store" });
    await r.arrayBuffer();
  } catch {
    return null;
  }
  return performance.now() - t0;
}

async function measureLatency(samples = LATENCY_SAMPLES) {
  const results = [];
  // warmup
  await singleLatency();
  for (let i = 0; i < samples; i++) {
    const ms = await singleLatency();
    if (ms !== null) results.push(ms);
  }
  return median(results);
}

async function measureLoadedLatency() {
  // Saturate the connection while measuring latency in parallel.
  let stop = false;
  const saturate = async () => {
    while (!stop) {
      try {
        const r = await fetch(`${ENDPOINTS.down}?bytes=${DOWNLOAD_BYTES}`, { cache: "no-store" });
        const reader = r.body.getReader();
        while (!stop) {
          const { done } = await reader.read();
          if (done) break;
        }
      } catch {
        await new Promise(r => setTimeout(r, 200));
      }
    }
  };

  const loaders = [saturate(), saturate()];
  await new Promise(r => setTimeout(r, 400)); // let it ramp

  const results = [];
  for (let i = 0; i < LATENCY_SAMPLES; i++) {
    const ms = await singleLatency();
    if (ms !== null) results.push(ms);
  }

  stop = true;
  await Promise.allSettled(loaders);
  return median(results);
}

// ─── Upload throughput ──────────────────────────────────────────
async function runUpload() {
  const samples = [];
  const payload = new Uint8Array(UPLOAD_CHUNK);
  // Fill with random-ish bytes (zero-filled is fine — endpoint just measures size)
  const start = performance.now();

  while (performance.now() - start < UPLOAD_DURATION) {
    const t0 = performance.now();
    try {
      await fetch(ENDPOINTS.up, {
        method: "POST",
        body: payload,
        cache: "no-store"
      });
    } catch (e) {
      console.warn("Upload chunk failed", e);
      continue;
    }
    const total = (performance.now() - t0) / 1000;
    if (total > 0) samples.push((UPLOAD_CHUNK * 8) / total / 1_000_000);
  }

  if (!samples.length) return 0;
  samples.sort((a, b) => b - a);
  const top = samples.slice(0, Math.max(1, Math.ceil(samples.length * 0.6)));
  return top.reduce((a, b) => a + b, 0) / top.length;
}

// ─── Connection metadata ────────────────────────────────────────
// Sources used (in parallel where possible):
//   • api.ipify.org              → public IP
//   • ipwho.is/{ip}              → ISP, ASN, org, city/region/country  (primary)
//   • ipapi.co/{ip}/json         → same fields                          (fallback)
//   • speed.cloudflare.com/meta  → Cloudflare edge colo (only source for this)
async function fetchJson(url) {
  try {
    const r = await fetch(url, { cache: "no-store" });
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  }
}

async function lookupGeo(ip) {
  // Try ipwho.is first
  const a = await fetchJson(`https://ipwho.is/${ip}`);
  if (a && a.success !== false) {
    return {
      ip:      a.ip,
      org:     (a.connection && (a.connection.isp || a.connection.org)) || null,
      asn:     (a.connection && a.connection.asn) ? `AS${a.connection.asn}` : null,
      city:    a.city,
      region:  a.region,
      country: a.country
    };
  }
  // Fallback to ipapi.co
  const b = await fetchJson(`https://ipapi.co/${ip}/json/`);
  if (b && !b.error) {
    return {
      ip:      b.ip,
      org:     b.org || null,
      asn:     b.asn || null,
      city:    b.city,
      region:  b.region,
      country: b.country_name || b.country
    };
  }
  return null;
}

async function fetchMeta() {
  // Kick ipify and Cloudflare /meta off in parallel
  const [ipRes, cfRes] = await Promise.allSettled([
    fetchJson("https://api.ipify.org?format=json"),
    fetchJson(ENDPOINTS.meta)
  ]);

  const ipData = ipRes.status === "fulfilled" ? ipRes.value : null;
  const cfData = cfRes.status === "fulfilled" ? cfRes.value : null;
  const ip = (ipData && ipData.ip) || (cfData && cfData.clientIp) || null;

  // Geo/ISP lookup (chained — needs the IP first)
  const geo = ip ? await lookupGeo(ip) : null;

  return { ip, geo, cf: cfData };
}

// ─── Orchestration ──────────────────────────────────────────────
async function run() {
  // 1. Download (the visible big number)
  labelEl.textContent = "Testing download speed…";
  const downloadMbps = await runDownload();
  speedEl.textContent = downloadMbps.toFixed(2);

  // Reveal the "Show more" button and start showing intermediate state
  showMore.hidden = false;

  if (downloadMbps > 0 && downloadMbps <= 50) {
    notify("Your internet speed looks slow. Try moving closer to your router or switching to a wired connection.");
  }

  // 2. Connection metadata (kicked off in parallel)
  const metaPromise = fetchMeta().then(({ ip, geo, cf }) => {
    setMetric("m-ip", ip || "Unavailable");

    // ISP from geo lookup (ipwho.is / ipapi.co), falls back to Cloudflare's asOrganization
    let isp = "Unavailable";
    if (geo && (geo.org || geo.asn)) {
      isp = [geo.org, geo.asn].filter(Boolean).join(" · ");
    } else if (cf && cf.asOrganization) {
      isp = `${cf.asOrganization}${cf.asn ? ` · AS${cf.asn}` : ""}`;
    }
    setMetric("m-isp", isp);

    // Cloudflare colo + city (only Cloudflare provides this)
    if (cf && cf.colo) {
      const coloName = cf.city
        ? `${cf.colo} — ${cf.city}${cf.country ? `, ${cf.country}` : ""}`
        : cf.colo;
      setMetric("m-colo", coloName);
    } else {
      setMetric("m-colo", "Unavailable");
    }

    // Location: prefer geo lookup (more accurate to the user's actual location)
    const locParts = geo
      ? [geo.city, geo.region, geo.country]
      : cf
        ? [cf.city, cf.region, cf.country]
        : [];
    setMetric("m-loc", locParts.filter(Boolean).join(", ") || "—");
  });

  // 3. Unloaded latency
  labelEl.textContent = "Measuring latency…";
  const unloaded = await measureLatency();
  setMetric("m-latency-unloaded", unloaded ? unloaded.toFixed(1) : "—");

  // 4. Loaded latency (bufferbloat indicator)
  labelEl.textContent = "Measuring latency under load…";
  const loaded = await measureLoadedLatency();
  setMetric("m-latency-loaded", loaded ? loaded.toFixed(1) : "—");

  // 5. Upload
  labelEl.textContent = "Testing upload speed…";
  const uploadMbps = await runUpload();
  setMetric("m-upload", uploadMbps.toFixed(2));

  await metaPromise;
  labelEl.textContent = "Test complete";
}

run().catch(err => {
  console.error(err);
  labelEl.textContent = "Test failed";
  notify("Speed test failed. Check your connection and refresh.");
});
