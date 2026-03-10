const toggle = document.getElementById("toggle");
const birdToggle = document.getElementById("birdToggle");
const dot = document.getElementById("dot");
const hueSlider = document.getElementById("hueSlider");
const hueWrap = document.getElementById("hueWrap");
const themeDots = document.querySelectorAll(".theme-dot");
const customDot = document.querySelector(".custom-dot");
const moreToggleBtn = document.getElementById("moreToggle");
const moreBody = document.getElementById("moreBody");

const RAINBOW = `conic-gradient(
  hsl(0, 45%, 32%), hsl(45, 45%, 32%), hsl(90, 45%, 32%),
  hsl(135, 45%, 32%), hsl(180, 45%, 32%), hsl(225, 45%, 32%),
  hsl(270, 45%, 32%), hsl(315, 45%, 32%), hsl(360, 45%, 32%)
)`;

const SHARE_URL = (() => {
  const text = encodeURIComponent("If you miss X's dark blue theme, X Dim Mode brings it back \u2014 free extension:");
  const url = encodeURIComponent("https://xdim.app");
  return `https://x.com/intent/tweet?text=${text}&url=${url}`;
})();

const RATE_URL = "https://chromewebstore.google.com/detail/x-dim-mode/cplloghlcgkjkogmbehmkhlleopnfogc/reviews";

// i18n
document.getElementById("title").textContent = chrome.i18n.getMessage("extName");
document.getElementById("enableLabel").textContent = chrome.i18n.getMessage("enableDim");
document.getElementById("moreLabel").textContent = chrome.i18n.getMessage("moreOptions");
document.getElementById("birdLabel").textContent = chrome.i18n.getMessage("birdLogo");
document.getElementById("hint").textContent = chrome.i18n.getMessage("settingsHint");
document.getElementById("credit").textContent = chrome.i18n.getMessage("credit");

// Share link in footer
const shareLink = document.getElementById("shareLink");
shareLink.textContent = chrome.i18n.getMessage("popupShareLink");
shareLink.href = SHARE_URL;

// ── Theme selection ────────────────────────────────────────────────

function setActiveTheme(themeName) {
  themeDots.forEach(d => d.classList.toggle("active", d.dataset.theme === themeName));

  // Custom dot: show chosen color when active, rainbow when not
  if (themeName === "custom") {
    const hue = +hueSlider.value;
    customDot.style.background = `hsl(${hue}, 34%, 28%)`;
  } else {
    customDot.style.background = RAINBOW;
  }

  // Show/hide hue slider
  hueWrap.classList.toggle("open", themeName === "custom");
}

// Load initial state
chrome.storage.local.get(["enabled", "theme", "customHue", "birdLogo"], ({ enabled, theme, customHue, birdLogo }) => {
  toggle.checked = !!enabled;
  dot.classList.toggle("active", !!enabled);
  birdToggle.checked = !!birdLogo;

  if (customHue !== undefined) {
    hueSlider.value = customHue;
  }

  setActiveTheme(theme || "dim");
});

// Toggle handlers
toggle.addEventListener("change", () => {
  const enabled = toggle.checked;
  chrome.storage.local.set({ enabled });
  dot.classList.toggle("active", enabled);
});

birdToggle.addEventListener("change", () => {
  chrome.storage.local.set({ birdLogo: birdToggle.checked });
});

// More section toggle
moreToggleBtn.addEventListener("click", () => {
  const open = moreBody.classList.toggle("open");
  moreToggleBtn.classList.toggle("open", open);
});

// Preset theme clicks
themeDots.forEach(d => {
  if (d.dataset.theme === "custom") return;
  d.addEventListener("click", () => {
    chrome.storage.local.set({ theme: d.dataset.theme });
    setActiveTheme(d.dataset.theme);
  });
});

// Custom dot click — activate custom mode
customDot.addEventListener("click", () => {
  chrome.storage.local.set({ theme: "custom", customHue: +hueSlider.value });
  setActiveTheme("custom");
});

// Hue slider — dragging auto-switches to custom mode
hueSlider.addEventListener("input", () => {
  const hue = +hueSlider.value;
  chrome.storage.local.set({ theme: "custom", customHue: hue });
  setActiveTheme("custom");
});

// ── Email prompt (one-time, after ~7 days) ──────────────────────────

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
const FOURTEEN_DAYS = 14 * 24 * 60 * 60 * 1000;

const MAILERLITE_URL = "https://assets.mailerlite.com/jsonp/1436119/forms/179598724460184835/subscribe";

function showEmailPrompt() {
  const prompt = document.getElementById("emailPrompt");
  prompt.style.display = "block";

  document.getElementById("emailPromptText").textContent = chrome.i18n.getMessage("emailPromptHeading");
  document.getElementById("emailPromptBtn").textContent = chrome.i18n.getMessage("subscribe");
  document.getElementById("emailPromptSpam").textContent = chrome.i18n.getMessage("emailNoSpam");
  document.getElementById("emailPromptSuccess").textContent = chrome.i18n.getMessage("emailSuccess");

  document.getElementById("emailPromptClose").addEventListener("click", () => {
    chrome.storage.local.set({ emailPromptDismissed: true });
    prompt.style.display = "none";
  });

  document.getElementById("emailPromptForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = document.getElementById("emailPromptBtn");
    const input = document.getElementById("emailPromptInput");
    btn.disabled = true;
    btn.textContent = "...";

    const body = new FormData();
    body.append("fields[email]", input.value);
    body.append("ml-submit", "1");
    body.append("anticsrf", "true");

    try {
      await fetch(MAILERLITE_URL, { method: "POST", body, mode: "no-cors" });
      document.getElementById("emailPromptForm").style.display = "none";
      document.getElementById("emailPromptSpam").style.display = "none";
      document.getElementById("emailPromptSuccess").style.display = "block";
      chrome.storage.local.set({ emailPromptDismissed: true });
    } catch {
      btn.disabled = false;
      btn.textContent = chrome.i18n.getMessage("subscribe");
    }
  });
}

// ── Engagement prompt (one-time, after ~14 days) ────────────────────

function showEngagePrompt() {
  const prompt = document.getElementById("engagePrompt");
  prompt.style.display = "block";

  document.getElementById("engageText").textContent = chrome.i18n.getMessage("engageQuestion");

  const engageShare = document.getElementById("engageShare");
  engageShare.textContent = chrome.i18n.getMessage("shareOnX");
  engageShare.href = SHARE_URL;

  const engageRate = document.getElementById("engageRate");
  engageRate.textContent = chrome.i18n.getMessage("engageRate");
  engageRate.href = RATE_URL;

  function dismiss() {
    chrome.storage.local.set({ engageDismissed: true });
    prompt.style.display = "none";
  }

  document.getElementById("engageClose").addEventListener("click", dismiss);
  engageShare.addEventListener("click", dismiss);
  engageRate.addEventListener("click", dismiss);
}

// ── Prompt logic: email at 7 days, engagement at 14 days ────────────

chrome.storage.local.get(
  ["installTimestamp", "emailPromptDismissed", "engageDismissed"],
  ({ installTimestamp, emailPromptDismissed, engageDismissed }) => {
    if (!installTimestamp) return;
    const elapsed = Date.now() - installTimestamp;

    // Email prompt first (7+ days)
    if (!emailPromptDismissed && elapsed >= SEVEN_DAYS) {
      showEmailPrompt();
      return;
    }

    // Engagement prompt second (14+ days, only if email was already dismissed)
    if (emailPromptDismissed && !engageDismissed && elapsed >= FOURTEEN_DAYS) {
      showEngagePrompt();
    }
  }
);

// ── Dev buttons ───────────────────────────────────────────────────
document.getElementById("devEmail").addEventListener("click", () => {
  document.getElementById("emailPrompt").style.display = "none";
  document.getElementById("engagePrompt").style.display = "none";
  showEmailPrompt();
});
document.getElementById("devEngage").addEventListener("click", () => {
  document.getElementById("emailPrompt").style.display = "none";
  document.getElementById("engagePrompt").style.display = "none";
  showEngagePrompt();
});
