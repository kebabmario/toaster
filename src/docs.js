const pages = {
  introduction: {
    title: "Introduction",
    breadcrumb: "Docs / Introduction",
    toc: ["What is Toaster?", "How it works"],
    content: `
      <p class="lead">
        Welcome to Toaster — a fast, minimal, and realistic internet speed testing tool
        built for clarity, accuracy, and performance.
      </p>

      <hr />

      <h2>What is Toaster?</h2>
      <p>
        Toaster is a browser-based speed testing utility designed to measure real-world
        download throughput using sustained transfers rather than short synthetic bursts.
      </p>
      <p>
        This approach provides results that better reflect everyday usage such as streaming,
        gaming, and large downloads.
      </p>

      <hr />

      <h2>How it works</h2>
      <p>
        Toaster downloads data from globally distributed edge endpoints over a fixed time window.
        The total transferred data is converted into an average Mbps value.
      </p>
      <p>
        All tests are executed client-side. No personal data is collected or stored.
      </p>
    `,
    next: "installation"
  },

  installation: {
    title: "Installation",
    breadcrumb: "Docs / Installation",
    toc: ["Requirements", "Setup"],
    content: `
      <p class="lead">
        Setting up Toaster is straightforward and requires no build tools or dependencies.
      </p>

      <hr />

      <h2>Requirements</h2>
      <p>
        Any modern browser with support for Fetch and Streams APIs is sufficient.
      </p>

      <hr />

      <h2>Setup</h2>
      <p>
        Clone the GitHub repository and open index.html in your browser,
        or deploy directly using GitHub Pages.
      </p>
    `,
    next: "usage"
  },

  usage: {
    title: "Usage",
    breadcrumb: "Docs / Usage",
    toc: ["Running a test", "Results"],
    content: `
      <p class="lead">
        Toaster starts automatically — no configuration required.
      </p>

      <hr />

      <h2>Running a test</h2>
      <p>
        Once loaded, the test begins immediately and runs for a fixed duration.
      </p>

      <hr />

      <h2>Results</h2>
      <p>
        Speeds are displayed in Mbps and represent sustained throughput rather than peak values.
      </p>
    `,
    next: "accuracy"
  },

  accuracy: {
    title: "Accuracy",
    breadcrumb: "Docs / Accuracy",
    toc: ["Methodology", "Limitations"],
    content: `
      <p class="lead">
        Toaster prioritizes consistency and realism over inflated benchmark numbers.
      </p>

      <hr />

      <h2>Methodology</h2>
      <p>
        Measurements are averaged over time to smooth out network spikes and buffering.
      </p>

      <hr />

      <h2>Limitations</h2>
      <p>
        VPNs, background traffic, and device performance can still affect results.
      </p>
    `,
    next: "privacy"
  },

  privacy: {
    title: "Privacy",
    breadcrumb: "Docs / Privacy",
    toc: ["Data handling", "Tracking"],
    content: `
      <p class="lead">
        Toaster is built with privacy as a first-class concern.
      </p>

      <hr />

      <h2>Data handling</h2>
      <p>
        No IP addresses, cookies, or identifiers are stored.
      </p>

      <hr />

      <h2>Tracking</h2>
      <p>
        Toaster does not use analytics, tracking pixels, or fingerprinting.
      </p>
    `,
    next: "credits"
  },

  credits: {
    title: "Credits",
    breadcrumb: "Docs / Credits",
    toc: ["Cloudflare", "Open source"],
    content: `
      <p class="lead">
        Toaster relies on modern, trusted infrastructure.
      </p>

      <hr />

      <h2>Cloudflare</h2>
      <p>
        Speed test endpoints are powered by Cloudflare’s global edge network,
        providing low latency and consistent performance worldwide.
      </p>

      <hr />

      <h2>Open source</h2>
      <p>
        Toaster is open source and maintained on GitHub.
      </p>
    `,
    next: null
  }
};

const navItems = document.querySelectorAll(".nav");
const doc = document.querySelector(".doc");
const toc = document.querySelector(".toc");

function loadPage(key) {
  const page = pages[key];
  if (!page) return;

  navItems.forEach(n => n.classList.remove("active"));
  document.querySelector(`.nav[data-page="${key}"]`).classList.add("active");

  doc.innerHTML = `
    <p class="breadcrumb">${page.breadcrumb}</p>
    <h1>${page.title}</h1>
    ${page.content}
    ${
      page.next
        ? `<div class="next">
            <span>Next</span>
            <a href="#" id="next-btn">${pages[page.next].title} →</a>
          </div>`
        : ""
    }
    <p class="updated">Last updated on February 1, 2026</p>
  `;

  toc.innerHTML = `<p class="toc-title">On this page</p>`;
  page.toc.forEach(t => {
    const a = document.createElement("a");
    a.textContent = t;
    toc.appendChild(a);
  });

  const nextBtn = document.getElementById("next-btn");
  if (nextBtn) {
    nextBtn.onclick = e => {
      e.preventDefault();
      loadPage(page.next);
    };
  }
}

navItems.forEach(nav => {
  nav.onclick = () => loadPage(nav.dataset.page);
});

loadPage("introduction");
