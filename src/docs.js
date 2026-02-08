const pages = {
  introduction: {
    title: "Introduction",
    breadcrumb: "Docs / Introduction",
    toc: ["What is Toaster?", "How it works"],
    content: `
      <p class="lead">
        Welcome to Toaster.
        A fast, minimal, and realistic internet speed testing tool built for clarity and performance.
      </p>

      <hr />

      <h2 id="what">What is Toaster?</h2>
      <p>
        Toaster is a browser-based internet speed testing utility designed to measure
        real-world download throughput using modern web APIs and globally distributed infrastructure.
      </p>
      <p>
        Instead of relying on short synthetic bursts, Toaster performs sustained transfers
        to give results that better represent everyday browsing, streaming, and downloads.
      </p>

      <hr />

      <h2 id="how">How it works</h2>
      <p>
        When Toaster starts, it fetches data from nearby network endpoints over a fixed time window.
        The total transferred data is then converted into a stable Mbps value.
      </p>
      <p>
        All calculations happen locally in your browser. No personal data is collected or stored.
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
        Getting started with Toaster takes only a few minutes.
        There are no dependencies or complex build steps required.
      </p>

      <hr />

      <h2 id="req">Requirements</h2>
      <p>
        Toaster runs entirely in the browser and requires a modern web environment.
        Any up-to-date version of Chrome, Edge, Firefox, or Safari is supported.
      </p>

      <hr />

      <h2 id="setup">Setup</h2>
      <p>
        Clone the repository from GitHub and open the index.html file in your browser.
        For deployment, GitHub Pages is fully supported.
      </p>
    `,
    next: "usage"
  },

  usage: {
    title: "Usage",
    breadcrumb: "Docs / Usage",
    toc: ["Running a test", "Understanding results"],
    content: `
      <p class="lead">
        Using Toaster is intentionally simple.
        The test begins automatically when the page loads.
      </p>

      <hr />

      <h2 id="run">Running a test</h2>
      <p>
        Once loaded, Toaster immediately starts downloading data.
        No buttons or configuration are required.
      </p>

      <hr />

      <h2 id="results">Understanding results</h2>
      <p>
        Results are shown in Mbps and reflect sustained throughput rather than peak speed.
        This makes them more useful for real-world scenarios.
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
        Accuracy is a core design goal of Toaster.
      </p>

      <hr />

      <h2 id="method">Methodology</h2>
      <p>
        Toaster measures average throughput over time rather than instantaneous speed.
        This reduces the impact of network spikes and buffering.
      </p>

      <hr />

      <h2 id="limits">Limitations</h2>
      <p>
        Results can still be influenced by background traffic, VPNs,
        and device performance.
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
        Privacy is taken seriously in Toaster.
      </p>

      <hr />

      <h2 id="data">Data handling</h2>
      <p>
        No personal data, IP addresses, or identifiers are stored.
        All tests are performed locally in your browser.
      </p>

      <hr />

      <h2 id="tracking">Tracking</h2>
      <p>
        Toaster does not use cookies, analytics, or fingerprinting techniques.
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
        Toaster is built on top of reliable, modern infrastructure.
      </p>

      <hr />

      <h2 id="cf">Cloudflare</h2>
      <p>
        Network requests and test endpoints are powered by Cloudflare’s global edge network,
        ensuring low latency and consistent results worldwide.
      </p>

      <hr />

      <h2 id="oss">Open source</h2>
      <p>
        Toaster is fully open source and hosted on GitHub.
        Contributions and improvements are welcome.
      </p>
    `,
    next: null
  }
};

/* ====== DOM ELEMENTS ====== */
const navItems = document.querySelectorAll(".nav");
const titleEl = document.querySelector("h1");
const breadcrumbEl = document.querySelector(".breadcrumb");
const docEl = document.querySelector(".doc");
const tocEl = document.querySelector(".toc");
const nextEl = document.querySelector(".next");

/* ====== LOAD PAGE ====== */
function loadPage(key) {
  const page = pages[key];
  if (!page) return;

  // Update active nav
  navItems.forEach(n => n.classList.remove("active"));
  document.querySelector(`.nav[data-page="${key}"]`).classList.add("active");

  // Update header content
  titleEl.textContent = page.title;
  breadcrumbEl.textContent = page.breadcrumb;

  // Update main content (preserve breadcrumb + h1)
  docEl.innerHTML = `
    <p class="breadcrumb">${page.breadcrumb}</p>
    <h1>${page.title}</h1>
    ${page.content}
    ${
      page.next
        ? `<div class="next">
             <span>Next</span>
             <a href="#" data-next="${page.next}">
               ${pages[page.next].title} →
             </a>
           </div>`
        : ""
    }
    <p class="updated">Last updated on February 1, 2026</p>
  `;

  // Update TOC
  tocEl.innerHTML = `<p class="toc-title">On this page</p>`;
  page.toc.forEach(item => {
    const a = document.createElement("a");
    a.textContent = item;
    tocEl.appendChild(a);
  });

  // Hook next button
  const nextBtn = document.querySelector("[data-next]");
  if (nextBtn) {
    nextBtn.onclick = e => {
      e.preventDefault();
      loadPage(nextBtn.dataset.next);
    };
  }
}

/* ====== NAV CLICKS ====== */
navItems.forEach(nav => {
  const key = nav.textContent.toLowerCase();
  nav.datas
