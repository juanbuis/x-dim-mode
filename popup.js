const toggle = document.getElementById("toggle");
const dot = document.getElementById("dot");
const hueSlider = document.getElementById("hueSlider");
const hueWrap = document.getElementById("hueWrap");
const themeDots = document.querySelectorAll(".theme-dot");
const customDot = document.querySelector(".custom-dot");

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

// Prefilled problem report — turns broken-theming moments into reports
// instead of uninstalls. mailto works for everyone (no GitHub account needed).
const REPORT_URL = (() => {
  const v = chrome.runtime.getManifest().version;
  const subject = encodeURIComponent(`X Dim Mode ${v} — problem report`);
  const body = encodeURIComponent(
    `What looks wrong?\n\n\nWhere on X (page or section):\n\n\n---\nVersion: ${v}\nBrowser: ${navigator.userAgent}`
  );
  return `mailto:yo@juanbuis.com?subject=${subject}&body=${body}`;
})();

// ── Settings storage (sync across devices, local as fallback/mirror) ─
// Keep in sync with the identical helpers in content.js.

const SETTING_KEYS = ["enabled", "theme", "customHue", "birdLogo", "oldFont", "classicFavicon", "tweetWording"];

function getSettings(cb) {
  chrome.storage.sync.get(SETTING_KEYS, (syncVals) => {
    chrome.storage.local.get(SETTING_KEYS, (localVals) => {
      const merged = {};
      for (const k of SETTING_KEYS) {
        merged[k] = syncVals[k] !== undefined ? syncVals[k] : localVals[k];
      }
      cb(merged);
    });
  });
}

function setSettings(obj) {
  chrome.storage.sync.set(obj, () => void chrome.runtime.lastError);
  chrome.storage.local.set(obj);
}

// Arabic is the one RTL locale we ship; Chrome does not set direction on
// extension pages automatically, so do it from the locale.
document.documentElement.dir = chrome.i18n.getMessage("@@bidi_dir");

// i18n
document.getElementById("title").textContent = chrome.i18n.getMessage("extName");
document.getElementById("enableLabel").textContent = chrome.i18n.getMessage("enableDim");
document.getElementById("credit").textContent = chrome.i18n.getMessage("credit");

// Share link in footer
const shareLink = document.getElementById("shareLink");
shareLink.textContent = chrome.i18n.getMessage("popupShareLink");
shareLink.href = SHARE_URL;

// Report-a-problem link in footer
const reportLink = document.getElementById("reportLink");
reportLink.textContent = chrome.i18n.getMessage("reportProblem");
reportLink.href = REPORT_URL;

// ── Extras row ──────────────────────────────────────────────────────
// Bump EXTRAS_REVISION whenever an extra is added. Anyone whose stored
// revision is behind gets a "New" badge on the row until they open Extras,
// which is the only signal they'd otherwise have that something was added.
const EXTRAS_REVISION = 4; // 1 = bird/font/favicon/wording, 2 = Start on Following, 3 = Classic image grid, 4 = Copy link first

document.getElementById("extrasRowLabel").textContent = chrome.i18n.getMessage("extras");
const extrasNew = document.getElementById("extrasNew");
extrasNew.textContent = chrome.i18n.getMessage("newBadge");

chrome.storage.sync.get(["extrasSeenRevision"], (syncVals) => {
  chrome.storage.local.get(["extrasSeenRevision"], (localVals) => {
    const seen = syncVals.extrasSeenRevision !== undefined
      ? syncVals.extrasSeenRevision
      : localVals.extrasSeenRevision;
    if ((seen ?? 0) < EXTRAS_REVISION) extrasNew.style.display = "inline-block";
  });
});

document.getElementById("extrasRow").addEventListener("click", () => {
  const v = { extrasSeenRevision: EXTRAS_REVISION };
  // Clear the toolbar dot immediately; the storage listener in background.js
  // would also catch this, but the popup is closing and this is instant.
  chrome.action?.setBadgeText?.({ text: "" });
  chrome.storage.local.set(v);
  chrome.storage.sync.set(v, () => void chrome.runtime.lastError);
});

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
getSettings(({ enabled, theme, customHue }) => {
  toggle.checked = !!enabled;
  dot.classList.toggle("active", !!enabled);

  if (customHue !== undefined) {
    hueSlider.value = customHue;
  }

  setActiveTheme(theme || "dim");
});

// Toggle handler
toggle.addEventListener("change", () => {
  const enabled = toggle.checked;
  setSettings({ enabled });
  dot.classList.toggle("active", enabled);
});

// Preset theme clicks
themeDots.forEach(d => {
  if (d.dataset.theme === "custom") return;
  d.addEventListener("click", () => {
    setSettings({ theme: d.dataset.theme });
    setActiveTheme(d.dataset.theme);
  });
});

// Custom dot click — activate custom mode
customDot.addEventListener("click", () => {
  setSettings({ theme: "custom", customHue: +hueSlider.value });
  setActiveTheme("custom");
});

// Hue slider — dragging auto-switches to custom mode.
// "input" fires continuously while dragging; writing every tick to sync would
// blow through its write quota (~120/min), so live ticks go to local only
// (the content script listens to both areas, so preview stays instant) and
// sync gets a debounced write plus a final commit on release ("change").
let _hueSyncTimer = 0;
hueSlider.addEventListener("input", () => {
  const hue = +hueSlider.value;
  chrome.storage.local.set({ theme: "custom", customHue: hue });
  clearTimeout(_hueSyncTimer);
  _hueSyncTimer = setTimeout(() => setSettings({ theme: "custom", customHue: +hueSlider.value }), 400);
  setActiveTheme("custom");
});
hueSlider.addEventListener("change", () => {
  clearTimeout(_hueSyncTimer);
  setSettings({ theme: "custom", customHue: +hueSlider.value });
});

// ── Email CTA (permanent button → expandable capture form) ──────────
// The list is the product's most valuable owned channel, so it gets the
// popup's permanent slot (donate is gone — it never converted). The button is
// visible to every non-subscriber from day one; it auto-expands once after two
// days, and again 60 days after a dismissal. Gone for good once subscribed.
//
// Two days rather than seven: the welcome screen already asks on install, so
// day 0 is covered and expanding immediately would be a second ask minutes
// after the first. Waiting a week, though, missed most people entirely —
// churn on a daily-use extension happens well before day seven.

const TWO_DAYS = 2 * 24 * 60 * 60 * 1000;
const FOURTEEN_DAYS = 14 * 24 * 60 * 60 * 1000;
const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
const SIXTY_DAYS = 60 * 24 * 60 * 60 * 1000;

const MAILERLITE_URL = "https://assets.mailerlite.com/jsonp/1436119/forms/179598724460184835/subscribe";

const emailCtaBtn = document.getElementById("emailCtaBtn");
const emailPrompt = document.getElementById("emailPrompt");
let _autoExpanded = false;

emailCtaBtn.textContent = chrome.i18n.getMessage("emailCtaButton");
document.getElementById("emailPromptText").textContent = chrome.i18n.getMessage("emailPromptHeading");
document.getElementById("emailPromptBtn").textContent = chrome.i18n.getMessage("subscribe");
document.getElementById("emailPromptSpam").textContent = chrome.i18n.getMessage("emailNoSpam");
document.getElementById("emailPromptSuccess").textContent = chrome.i18n.getMessage("emailSuccess");

function expandEmailPanel() {
  emailCtaBtn.style.display = "none";
  emailPrompt.style.display = "block";
}

function collapseEmailPanel() {
  emailPrompt.style.display = "none";
  emailCtaBtn.style.display = "block";
}

emailCtaBtn.addEventListener("click", expandEmailPanel);

document.getElementById("emailPromptClose").addEventListener("click", () => {
  // Only an auto-expanded panel counts as a dismissal (starts the 60-day
  // snooze); closing a panel the user opened themselves just collapses it.
  if (_autoExpanded) {
    chrome.storage.local.set({ emailPromptDismissedAt: Date.now() });
    _autoExpanded = false;
  }
  collapseEmailPanel();
});

document.getElementById("emailPromptForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = document.getElementById("emailPromptBtn");
  const input = document.getElementById("emailPromptInput");
  btn.disabled = true;
  btn.textContent = "...";

  const errorEl = document.getElementById("emailPromptError");
  errorEl.style.display = "none";

  const succeed = () => {
    document.getElementById("emailPromptForm").style.display = "none";
    document.getElementById("emailPromptSpam").style.display = "none";
    document.getElementById("emailPromptSuccess").style.display = "block";
    const follow = document.getElementById("emailPromptFollow");
    follow.textContent = chrome.i18n.getMessage("followCta");
    follow.style.display = "block";
    // Subscribed state syncs so other devices don't re-ask
    chrome.storage.local.set({ emailSubscribed: true });
    chrome.storage.sync.set({ emailSubscribed: true }, () => void chrome.runtime.lastError);
  };
  const fail = (key) => {
    errorEl.textContent = chrome.i18n.getMessage(key);
    errorEl.style.display = "block";
    btn.disabled = false;
    btn.textContent = chrome.i18n.getMessage("subscribe");
  };

  try {
    // xdim.app proxy returns MailerLite's real verdict; the form endpoint has
    // no CORS headers so a direct call is unreadable (see welcome.js).
    const res = await fetch("https://xdim.app/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: input.value.trim(), source: "extension-popup" }),
    });
    const data = await res.json();
    if (data.success) succeed();
    else fail("emailInvalid");
  } catch {
    // Proxy unreachable — fall back to the old opaque direct post rather than
    // dropping the signup.
    try {
      const body = new FormData();
      body.append("fields[email]", input.value);
      body.append("fields[signup_source]", "extension-popup");
      body.append("ml-submit", "1");
      body.append("anticsrf", "true");
      await fetch(MAILERLITE_URL, { method: "POST", body, mode: "no-cors" });
      succeed();
    } catch {
      fail("emailNetworkError");
    }
  }
});

// ── Engagement prompt (one-time, after ~14 days) ────────────────────

function showFollowPrompt() {
  const prompt = document.getElementById("followPrompt");
  prompt.style.display = "block";
  document.getElementById("followText").textContent = chrome.i18n.getMessage("followQuestion");
  const btn = document.getElementById("followBtn");
  btn.textContent = chrome.i18n.getMessage("credit");   // "Follow @juanbuis"

  function dismiss() {
    chrome.storage.local.set({ followDismissed: true });
    prompt.style.display = "none";
  }
  document.getElementById("followClose").addEventListener("click", dismiss);
  btn.addEventListener("click", dismiss);
}

function showEngagePrompt() {
  const prompt = document.getElementById("engagePrompt");
  prompt.style.display = "block";

  document.getElementById("engageText").textContent = chrome.i18n.getMessage("engageQuestion");

  const engageRate = document.getElementById("engageRate");
  engageRate.textContent = chrome.i18n.getMessage("engageRate");
  engageRate.href = RATE_URL;

  function dismiss() {
    chrome.storage.local.set({ engageDismissed: true });
    prompt.style.display = "none";
  }

  document.getElementById("engageClose").addEventListener("click", dismiss);
  engageRate.addEventListener("click", dismiss);
}

// ── CTA & prompt logic ───────────────────────────────────────────────
// Email CTA: always visible (collapsed) until subscribed; auto-expands at
// 2 days, re-expands 60 days after a dismissal. Engagement prompt: at 14
// days once the email ask is settled — never alongside an expanded panel.

chrome.storage.sync.get(["emailSubscribed"], (syncVals) => {
  chrome.storage.local.get(
    ["emailSubscribed", "installTimestamp", "emailPromptDismissed", "emailPromptDismissedAt", "engageDismissed", "followDismissed"],
    (d) => {
      const now = Date.now();
      const subscribed = syncVals.emailSubscribed !== undefined ? syncVals.emailSubscribed : d.emailSubscribed;
      // Legacy boolean (pre-1.5.0) without a timestamp → treat as freshly
      // dismissed so nobody gets an instant re-prompt on update.
      const dismissedAt = d.emailPromptDismissedAt ?? (d.emailPromptDismissed ? now : undefined);
      const installedFor = d.installTimestamp ? now - d.installTimestamp : 0;

      if (!subscribed) {
        emailCtaBtn.style.display = "block";
        const snoozed = dismissedAt !== undefined && now - dismissedAt < SIXTY_DAYS;
        if (installedFor >= TWO_DAYS && !snoozed) {
          _autoExpanded = true;
          expandEmailPanel();
        }
      }

      // One ask at a time, in order: email (day 2), review (day 14), follow
      // (day 30). Each waits for the previous to be settled, so the popup
      // never shows two at once.
      const emailSettled = !!subscribed || dismissedAt !== undefined;
      const engageSettled = !!d.engageDismissed;
      if (!_autoExpanded && emailSettled && !engageSettled && installedFor >= FOURTEEN_DAYS) {
        showEngagePrompt();
      } else if (!_autoExpanded && emailSettled && engageSettled &&
                 !d.followDismissed && installedFor >= THIRTY_DAYS) {
        showFollowPrompt();
      }
    }
  );
});

// ── Dev buttons (only visible for unpacked/local installs) ────────
if (!chrome.runtime.getManifest().update_url) {
  document.getElementById("devButtons").style.display = "flex";
}
document.getElementById("devEmail").addEventListener("click", () => {
  document.getElementById("engagePrompt").style.display = "none";
  expandEmailPanel();
});
document.getElementById("devEngage").addEventListener("click", () => {
  collapseEmailPanel();
  showEngagePrompt();
});
document.getElementById("devWelcome").addEventListener("click", () => {
  const v = chrome.runtime.getManifest().version;
  window.open(chrome.runtime.getURL(`welcome.html?v=${v}&reason=install`));
});
document.getElementById("devUpdate").addEventListener("click", () => {
  const v = chrome.runtime.getManifest().version;
  window.open(chrome.runtime.getURL(`welcome.html?v=${v}&reason=update`));
});
