const pages = {
  Introduction: {
    breadcrumb: "Docs / Introduction",
    title: "Introduction",
    lead: `Welcome to Toaster.
A fast, minimal, and realistic internet speed testing tool built for clarity and performance.`,
    sections: [
      {
        h2: "What is Toaster?",
        p: [
          "Toaster is a browser-based speed testing utility that measures real-world download throughput using modern web APIs and globally distributed infrastructure.",
          "Unlike synthetic benchmarks, Toaster focuses on sustained transfer rates to give you results that reflect actual day-to-day internet usage."
        ]
      },
      {
        h2: "How it works",
        p: [
          "When you open Toaster, the test begins automatically. Data is fetched over a fixed time window to calculate an accurate Mbps value.",
          "All tests are performed client-side and do not store personal data."
        ]
      }
    ],
    next: "Installation"
  },

  Installation: {
    breadcrumb: "Docs / Installation",
    title: "Installation",
    lead: `Getting started with Toaster takes only a few minutes.`,
    sections: [
      {
        h2: "Requirements",
        p: [
          "A modern browser with JavaScript enabled.",
          "A stable internet connection for accurate testing."
        ]
      },
      {
        h2: "Setup",
        p: [
          "Clone the repository from GitHub and host it on any static server.",
          "Toaster works perfectly with GitHub Pages, Cloudflare Pages, or Vercel."
        ]
      }
    ],
    next: "Usage"
  },

  Usage: {
    breadcrumb: "Docs / Usage",
    title: "Usage",
    lead: `Running a test with Toaster is fully automatic.`,
    sections: [
      {
        h2: "Running a test",
        p: [
          "Open the website and the speed test will begin immediately.",
          "Results are calculated based on sustained throughput rather than short bursts."
        ]
      }
    ],
    next: "Accuracy"
  },

  Accuracy: {
    breadcrumb: "Docs / Accuracy",
    title: "Accuracy",
    lead: `Toaster prioritizes realism over inflated numbers.`,
    sections: [
      {
        h2: "Real-world measurements",
        p: [
          "Tests run over a fixed duration to avoid misleading peak speeds.",
          "Results better represent actual download performance."
        ]
      }
    ],
    next: "Privacy"
  },

  Privacy: {
    breadcrumb: "Docs / Privacy",
    title: "Privacy",
    lead: `Your privacy is respected by design.`,
    sections: [
      {
        h2: "Data handling",
        p: [
          "No personal information is collected or stored.",
          "All measurements are performed locally in your browser."
        ]
      }
    ],
    next: "Credits"
  },

  Credits: {
    breadcrumb: "Docs / Credits",
    title: "Credits",
    lead: `Toaster would not be possible without open infrastructure.`,
    sections: [
      {
        h2: "Cloudflare",
        p: [
          "Network requests are powered by Cloudflare’s global edge infrastructure.",
          "Cloudflare enables fast, reliable, and geographically distributed testing."
        ]
      }
    ],
    next: null
  }
};

// -----------------------------
// DOM references
// -----------------------------
const navItems = document.querySelectorAll(".nav");
const doc = document.querySelector(".doc");

// -----------------------------
// Render function
// -----------------------------
function renderPage(name) {
  const page = pages[name];
  if (!page) return;

  // Clear doc
  doc.innerHTML = "";

  // Breadcrumb
  const breadcrumb = document.createElement("p");
  breadcrumb.className = "breadcrumb";
  breadcrumb.textContent = page.breadcrumb;
  doc.appendChild(breadcrumb);

  // Title
  const h1 = document.createElement("h1");
  h1.textContent = page.title;
  doc.appendChild(h1);

  // Lead
  const lead = document.createElement("p");
  lead.className = "lead";
  lead.textContent = page.lead;
  doc.appendChild(lead);

  doc.appendChild(document.createElement("hr"));

  // Sections
  page.sections.forEach(section => {
    const h2 = document.createElement("h2");
    h2.textContent = section.h2;
    doc.appendChild(h2);

    section.p.forEach(text => {
      const p = document.createElement("p");
      p.textContent = text;
      doc.appendChild(p);
    });

    doc.appendChild(document.createElement("hr"));
  });

  // Next button
  if (page.next) {
    const next = document.createElement("div");
    next.className = "next";

    next.innerHTML = `
      <span>Next</span>
      <a href="#">${page.next} →</a>
    `;

    next.querySelector("a").addEventListener("click", e => {
      e.preventDefault();
      setActive(page.next);
    });

    doc.appendChild(next);
  }

  // Updated
  const updated = document.createElement("p");
  updated.className = "updated";
  updated.textContent = "Last updated on February 1, 2026";
  doc.appendChild(updated);

  // Scroll reset
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// -----------------------------
// Nav click handling
// -----------------------------
function setActive(name) {
  navItems.forEach(n => {
    n.classList.toggle("active", n.textContent.trim() === name);
  });
  renderPage(name);
}

navItems.forEach(item => {
  item.addEventListener("click", () => {
    setActive(item.textContent.trim());
  });
});

// Initial render
renderPage("Introduction");
