// -----------------------------
// Sidebar navigation logic
// -----------------------------
const navItems = document.querySelectorAll(".nav");
const breadcrumb = document.querySelector(".breadcrumb");
const title = document.querySelector("h1");

const pages = {
  Introduction: {
    title: "Introduction",
    breadcrumb: "Docs / Introduction"
  },
  Installation: {
    title: "Installation",
    breadcrumb: "Docs / Installation"
  },
  Usage: {
    title: "Usage",
    breadcrumb: "Docs / Usage"
  },
  Accuracy: {
    title: "Accuracy",
    breadcrumb: "Docs / Accuracy"
  },
  Privacy: {
    title: "Privacy",
    breadcrumb: "Docs / Privacy"
  },
  Credits: {
    title: "Credits",
    breadcrumb: "Docs / Credits"
  }
};

navItems.forEach(item => {
  item.addEventListener("click", () => {
    navItems.forEach(n => n.classList.remove("active"));
    item.classList.add("active");

    const page = pages[item.textContent.trim()];
    if (!page) return;

    title.textContent = page.title;
    breadcrumb.textContent = page.breadcrumb;

    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});

// -----------------------------
// Next button logic
// -----------------------------
const nextBtn = document.querySelector(".next a");

if (nextBtn) {
  nextBtn.addEventListener("click", (e) => {
    e.preventDefault();
    document.querySelector(".nav:nth-child(2)").click();
  });
}

// -----------------------------
// Table of contents scroll
// -----------------------------
document.querySelectorAll(".toc a").forEach(link => {
  link.addEventListener("click", () => {
    const text = link.textContent.trim();
    const target = [...document.querySelectorAll("h2")]
      .find(h => h.textContent === text);

    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  });
});

// -----------------------------
// Theme switcher
// -----------------------------
const themeButtons = document.querySelectorAll(".theme-switcher button");

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem("theme", theme);
}

themeButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    applyTheme(btn.dataset.theme);
  });
});

// Load saved theme
const savedTheme = localStorage.getItem("theme") || "dark";
applyTheme(savedTheme);
