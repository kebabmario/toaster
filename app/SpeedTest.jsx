"use client";

import { useEffect, useState } from "react";
import { runTest, SLOW_MBPS } from "../lib/speedtest.mjs";

const STATUS = {
  download: "Testing download speed",
  latency: "Measuring latency",
  loaded: "Measuring latency under load",
  upload: "Testing upload speed",
  done: "Test complete",
  failed: "Test failed",
};

export default function SpeedTest() {
  const [runId, setRunId] = useState(0);
  // The key remounts Run, which resets its state and aborts the previous test.
  return <Run key={runId} onRestart={() => setRunId((n) => n + 1)} />;
}

function Run({ onRestart }) {
  const [phase, setPhase] = useState("download");
  const [live, setLive] = useState(0);
  const [trace, setTrace] = useState([]);
  const [results, setResults] = useState({});

  useEffect(() => {
    const controller = new AbortController();
    runTest({
      signal: controller.signal,
      onPhase: setPhase,
      onLive: (value, progress) => {
        setLive(value);
        setTrace((points) => [...points, [progress, value]]);
      },
      onResult: (partial) => setResults((r) => ({ ...r, ...partial })),
    }).catch((err) => {
      if (controller.signal.aborted) return;
      console.error(err);
      setPhase("failed");
    });
    return () => controller.abort();
  }, []);

  const speed = results.download ?? live;
  const slow = results.download > 0 && results.download <= SLOW_MBPS;

  return (
    <div className="shell">
      <header className="top">
        <span className="mark">
          toaster
          <Logo />
        </span>
        <span className="status" role="status">
          {STATUS[phase]}
        </span>
      </header>

      <main className="readout">
        <p className="speed">
          <span className="number">{speed.toFixed(2)}</span>
          <span className="unit">Mbps download</span>
        </p>

        <Coil points={trace} />

        {phase === "failed" && (
          <p className="note">The test could not reach Cloudflare. Check your connection, then run it again.</p>
        )}
        {slow && phase !== "failed" && (
          <p className="note">
            That is on the slow side. Move closer to your router or switch to a wired connection.
          </p>
        )}

        <dl className="figures">
          <Figure label="Latency" value={results.latencyIdle} digits={1} unit="ms" />
          <Figure label="Latency under load" value={results.latencyLoaded} digits={1} unit="ms" />
          <Figure label="Upload" value={results.upload} digits={2} unit="Mbps" />
        </dl>

        <dl className="connection">
          <Fact label="IP address" value={results.ip} />
          <Fact label="Provider" value={results.isp} />
          <Fact label="Cloudflare edge" value={results.edge} />
          <Fact label="Location" value={results.location} />
        </dl>
      </main>

      <footer className="bottom">
        <button type="button" className="restart" onClick={onRestart}>
          Run again
        </button>
        <nav className="links">
          <a href="https://github.com/kebabmario/toaster" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          <a href="https://docs.usetoaster.app" target="_blank" rel="noopener noreferrer">
            Documentation
          </a>
          <a className="credit" href="https://www.cloudflare.com/" target="_blank" rel="noopener noreferrer">
            <img src="/cloudflare.webp" alt="" height="14" />
            Powered by Cloudflare
          </a>
        </nav>
      </footer>
    </div>
  );
}

// Toaster with a slice popping up. Same drawing as app/icon.svg, minus the background.
function Logo() {
  return (
    <svg className="logo" viewBox="4 3 24 25" aria-hidden="true">
      <path
        d="M11 17V9C9 8.5 8.5 7 8.5 6C8.5 4 10 3 12 3H20C22 3 23.5 4 23.5 6C23.5 7 23 8.5 21 9V17Z"
        fill="var(--hot)"
      />
      <rect x="4" y="13" width="24" height="15" rx="4.5" fill="currentColor" />
      <circle cx="22" cy="21" r="2" fill="var(--page)" />
    </svg>
  );
}

// The heating element: a line across the page that rises with live download speed.
function Coil({ points }) {
  const peak = Math.max(1, ...points.map(([, v]) => v));
  const line = [[0, 0], ...points].map(([x, v]) => `${(x * 100).toFixed(2)},${(96 - (v / peak) * 88).toFixed(2)}`);
  return (
    <svg className="coil" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <line className="coil-rest" x1="0" y1="96" x2="100" y2="96" />
      <polyline className="coil-hot" points={line.join(" ")} />
    </svg>
  );
}

function Figure({ label, value, digits, unit }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd className={value == null ? "pending" : undefined}>
        {value == null ? "–" : value > 0 ? value.toFixed(digits) : "n/a"}
        {value > 0 && <small>{unit}</small>}
      </dd>
    </div>
  );
}

function Fact({ label, value }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd className={value == null ? "pending" : undefined} title={value}>
        {value ?? "–"}
      </dd>
    </div>
  );
}
