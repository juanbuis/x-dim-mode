const DIM_BASE_ID = "x-dim-base-ext";
const DIM_BTN_ID = "x-dim-option-btn";
const DIM_CLASS = "x-dim-active";

// ── Bird Logo ─────────────────────────────────────────────────────
const BIRD_PATH = "M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z";
let _birdLogo = false;

// ── Theme Definitions ──────────────────────────────────────────────

const THEMES = {
  dim:   { hue: 210, sat: 34 },
  slate: { hue: 210, sat: 8  },
  jade:  { hue: 150, sat: 34 },
  plum:  { hue: 270, sat: 34 },
  dusk:  { hue: 330, sat: 34 },
  ember: { hue: 25,  sat: 34 },
};

let _theme = "dim";
let _customHue = 210;

function paletteFromHue(h, s) {
  const bSat = Math.round(s * 0.47);
  return {
    bg:         `hsl(${h}, ${s}%, 13%)`,
    bgHover:    `hsl(${h}, ${Math.round(s * 0.74)}%, 16%)`,
    bgElevated: `hsl(${h}, ${Math.round(s * 0.71)}%, 20%)`,
    backdrop:   `hsla(${h}, ${s}%, 13%, 0.85)`,
    text:       `hsl(${h}, ${Math.round(s * 0.32)}%, 60%)`,
    border:     `hsl(${h}, ${bSat}%, 26%)`,
    // Raw HSL components for X's CSS variable format (space-separated, no wrapper)
    bgRaw:      `${h} ${s}% 13%`,
    borderRaw:  `${h} ${bSat}% 26%`,
    mutedRaw:   `${h} ${bSat}% 55%`,
    grayRaw60:  `${h} ${bSat}% 60%`,
    grayRaw50:  `${h} ${bSat}% 50%`,
  };
}

function getActiveHueSat() {
  if (_theme === "custom") return { hue: _customHue, sat: 34 };
  return THEMES[_theme] || THEMES.dim;
}

// ── Dim Theme CSS ──────────────────────────────────────────────────

function buildThemeCSS() {
  const { hue: h, sat: s } = getActiveHueSat();
  const p = paletteFromHue(h, s);
  return `
  html.${DIM_CLASS} {
    --xdm-bg: ${p.bg};
    --xdm-bg-hover: ${p.bgHover};
    --xdm-bg-elevated: ${p.bgElevated};
    --xdm-backdrop: ${p.backdrop};
    --xdm-text: ${p.text};
    --xdm-border: ${p.border};
  }

  /* Override X's own Lights Out theme variables */
  html.${DIM_CLASS} body.LightsOut {
    --color: var(--xdm-text);
    --border: ${p.borderRaw};
    --input: ${p.borderRaw};
    --border-color: var(--xdm-border);
  }

  /* Chat / DM interface (Tailwind + shadcn/Radix) */
  html.${DIM_CLASS}[data-theme="dark"],
  html.${DIM_CLASS} [data-theme="dark"] {
    --background: ${p.bgRaw};
    --border: ${p.borderRaw};
    --input: ${p.borderRaw};
    --muted-foreground: ${p.mutedRaw};
    --color-background: ${p.bgRaw};
    --color-gray-0: ${p.bgRaw};
    --color-gray-50: ${p.borderRaw};
    --color-gray-100: ${p.borderRaw};
    --color-gray-700: ${p.grayRaw60};
    --color-gray-800: ${p.grayRaw50};
  }`;
}

// Static CSS rules — reference CSS variables, theme-independent
const STATIC_CSS = `
  /* ── Black background overrides ── */

  /* HTML + Body — catches class-based black bg (e.g. Creator Studio) */
  html.${DIM_CLASS},
  html.${DIM_CLASS} body {
    background-color: var(--xdm-bg) !important;
  }

  /* Inline styles (covers body, divs, modals, dropdowns, etc.) */
  html.${DIM_CLASS} [style*="background-color: rgb(0, 0, 0)"],
  html.${DIM_CLASS} [style*="background-color: rgba(0, 0, 0, 1)"] {
    background-color: var(--xdm-bg) !important;
  }
  /* Elevated section cards (rgb(24,24,27) in dark mode → slightly lighter in dim) */
  html.${DIM_CLASS} [style*="background-color: rgb(24, 24, 27)"] {
    background-color: var(--xdm-bg-hover) !important;
  }
  /* Icon containers in menu rows (Premium, etc.) */
  html.${DIM_CLASS} [role="link"] > div > div:first-child div:has(> svg:only-child) {
    background-color: var(--xdm-bg-elevated) !important;
  }

  /* X utility classes for black backgrounds */
  html.${DIM_CLASS} .r-kemksi,
  html.${DIM_CLASS} .r-1niwhzg,
  html.${DIM_CLASS} .r-yfoy6g,
  html.${DIM_CLASS} .r-14lw9ot {
    background-color: var(--xdm-bg) !important;
  }
  /* Search bar — the input's opaque bg covers the pill's right border curve.
     Make it transparent so the pill's border and bg show through. */
  html.${DIM_CLASS} form[role="search"] input {
    background-color: transparent !important;
  }
  /* Action-button hover circles — make transparent so they match any parent bg */
  html.${DIM_CLASS} .r-1niwhzg.r-sdzlij {
    background-color: transparent !important;
  }
  /* Timeline top bar */
  html.${DIM_CLASS} .r-5zmot {
    background-color: var(--xdm-backdrop) !important;
  }
  /* Tweet character counter separator */
  html.${DIM_CLASS} .r-1shrkeu {
    background-color: var(--xdm-border) !important;
  }
  /* Sidebar button hover */
  html.${DIM_CLASS} .r-1hdo0pc {
    background-color: var(--xdm-bg-hover) !important;
  }
  /* Secondary background (section cards on Premium, etc.) */
  html.${DIM_CLASS} .r-g2wdr4 {
    background-color: var(--xdm-bg-hover) !important;
  }
  html.${DIM_CLASS} .r-g2wdr4 [role="link"]:hover {
    background-color: var(--xdm-bg-elevated) !important;
  }

  /* Borders */
  html.${DIM_CLASS} .r-1kqtdi0,
  html.${DIM_CLASS} .r-1roi411 {
    border-color: var(--xdm-border) !important;
  }
  html.${DIM_CLASS} .r-2sztyj {
    border-top-color: var(--xdm-border) !important;
  }
  html.${DIM_CLASS} .r-1igl3o0,
  html.${DIM_CLASS} .r-rull8r {
    border-bottom-color: var(--xdm-border) !important;
  }
  /* Separators / dividers */
  html.${DIM_CLASS} .r-gu4em3,
  html.${DIM_CLASS} .r-1bnu78o {
    background-color: var(--xdm-border) !important;
  }

  /* Search bar icon, tweet character counter */
  html.${DIM_CLASS} .r-1bwzh9t {
    color: var(--xdm-text) !important;
  }
  /* "What's happening" text */
  html.${DIM_CLASS} .draftjs-styles_0 .public-DraftEditorPlaceholder-root,
  html.${DIM_CLASS} .public-DraftEditorPlaceholder-inner {
    color: var(--xdm-text) !important;
  }
  /* Secondary text */
  html.${DIM_CLASS} [style*="color: rgb(113, 118, 123)"],
  html.${DIM_CLASS} [style*="-webkit-line-clamp: 3; color: rgb(113, 118, 123)"],
  html.${DIM_CLASS} [style*="-webkit-line-clamp: 2; color: rgb(113, 118, 123)"] {
    color: var(--xdm-text) !important;
  }
  /* Placeholders */
  html.${DIM_CLASS} ::placeholder {
    color: var(--xdm-text) !important;
  }

  /* Tailwind classes used in chat/DM interface */
  html.${DIM_CLASS} .bg-gray-0 {
    background-color: var(--xdm-bg) !important;
  }
  html.${DIM_CLASS} .border-gray-50,
  html.${DIM_CLASS} .border-gray-100 {
    border-color: var(--xdm-border) !important;
  }

  /* Grok buttons (active) */
  html.${DIM_CLASS} [style*="border-color: rgb(47, 51, 54)"].r-1che71a {
    background-color: var(--xdm-bg-hover) !important;
  }

  /* Scanner-discovered black backgrounds */
  html.${DIM_CLASS} .xdm-dimmed {
    background-color: var(--xdm-bg) !important;
  }
  /* Scanner-discovered elevated backgrounds (e.g. section cards) */
  html.${DIM_CLASS} .xdm-dimmed-elevated {
    background-color: var(--xdm-bg-hover) !important;
  }
  /* Creator Studio icon containers (jf-element framework) */
  html.${DIM_CLASS} .jf-element:has(> span:only-child > svg:only-child) {
    background-color: var(--xdm-bg-elevated) !important;
  }
  /* Creator Studio dividers inside elevated section cards */
  html.${DIM_CLASS} .xdm-dimmed-elevated .jf-element:empty {
    background-color: var(--xdm-border) !important;
    border-color: var(--xdm-border) !important;
  }

  /* Media editor crop selection — the crop rectangle has .r-1niwhzg (black bg)
     but other classes override it to transparent. Our !important rule defeats
     that override, causing a solid blue block over the image. */
  html.${DIM_CLASS} .r-1niwhzg.r-633pao {
    background-color: transparent !important;
  }

`;

function buildFullCSS() {
  return buildThemeCSS() + STATIC_CSS;
}

// Always update the style element — prevents stale CSS after extension reload
function ensureBaseCSS() {
  const css = buildFullCSS();
  let style = document.getElementById(DIM_BASE_ID);
  if (!style) {
    style = document.createElement("style");
    style.id = DIM_BASE_ID;
    (document.head || document.documentElement).appendChild(style);
  }
  if (style.textContent !== css) style.textContent = css;
}

// Inject CSS immediately at document_start — don't wait for async storage read.
// Rules are gated by html.x-dim-active so they're inert until the class is added.
ensureBaseCSS();

// Optimistically apply dim before async storage read using localStorage as sync cache.
// First install: cache is null → default to dim. Disabled users: cache is "0" → skip.
// Gate on system dark to match preload.css — avoids dim CSS leaking onto a light-mode page.
if (localStorage.getItem("__xdm_enabled") !== "0" &&
    (!window.matchMedia || window.matchMedia("(prefers-color-scheme: dark)").matches)) {
  document.documentElement.classList.add(DIM_CLASS);
}

// ── PWA theme-color sync ──────────────────────────────────────────
// Updates <meta name="theme-color"> so the PWA title bar matches the dim bg.

let _originalThemeColor = null;
let _themeColorObserver = null;

function syncThemeColor() {
  let meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    if (!document.head) return;
    meta = document.createElement("meta");
    meta.name = "theme-color";
    document.head.appendChild(meta);
  }
  if (_originalThemeColor === null) _originalThemeColor = meta.getAttribute("content");
  const { hue, sat } = getActiveHueSat();
  const desired = `hsl(${hue}, ${sat}%, 13%)`;
  if (meta.getAttribute("content") !== desired) {
    meta.setAttribute("content", desired);
  }
}

// Watch <head> for the theme-color meta being added or changed by X
function startThemeColorObserver() {
  if (_themeColorObserver) return;
  const head = document.head;
  if (!head) return;
  _themeColorObserver = new MutationObserver(() => {
    if (_enabled && document.documentElement.classList.contains(DIM_CLASS)) {
      syncThemeColor();
    }
  });
  _themeColorObserver.observe(head, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["content"],
  });
}

function stopThemeColorObserver() {
  if (_themeColorObserver) {
    _themeColorObserver.disconnect();
    _themeColorObserver = null;
  }
}

function restoreThemeColor() {
  if (_originalThemeColor === null) return;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", _originalThemeColor);
  _originalThemeColor = null;
}

// ── Bird Logo Swap ────────────────────────────────────────────────

function isXLogoPath(d) {
  return d && d.startsWith("M18.244");
}

function swapBirdLogos(root) {
  if (!_birdLogo) return;
  const paths = (root || document).querySelectorAll("svg path");
  for (const p of paths) {
    const d = p.getAttribute("d");
    if (isXLogoPath(d)) {
      p.setAttribute("data-xdm-original-d", d);
      p.setAttribute("d", BIRD_PATH);
      const svg = p.closest("svg");
      if (svg) svg.style.fill = "#1D9BF0";
    }
  }
}

function restoreBirdLogos() {
  for (const p of document.querySelectorAll("svg path[data-xdm-original-d]")) {
    p.setAttribute("d", p.getAttribute("data-xdm-original-d"));
    p.removeAttribute("data-xdm-original-d");
    const svg = p.closest("svg");
    if (svg) svg.style.fill = "";
  }
}

function applyDim() {
  ensureBaseCSS();
  document.documentElement.classList.add(DIM_CLASS);
  syncThemeColor();
  startThemeColorObserver();
  if (document.body) queueScan([document.body]);
}

function removeDim() {
  document.documentElement.classList.remove(DIM_CLASS);
  stopThemeColorObserver();
  restoreThemeColor();
  // Cancel any pending scan
  if (_scanFrame) {
    cancelAnimationFrame(_scanFrame);
    _scanFrame = 0;
    _pending.clear();
  }
  // Remove scanner-applied classes (non-destructive — doesn't touch original styles)
  for (const el of document.querySelectorAll(".xdm-dimmed, .xdm-dimmed-elevated")) {
    el.classList.remove("xdm-dimmed", "xdm-dimmed-elevated");
  }
}

// ── System Theme Sync ─────────────────────────────────────────────
// Follows OS preference: dark → Dim, light → Default.
// Watches body.LightsOut (X's dark mode class) to detect theme state.

let _bodyObserver;
let _suspendedForLight = false;

function syncDimWithTheme() {
  if (!_enabled || !document.body) return;
  const hasLightsOut = document.body.classList.contains("LightsOut");
  const dimActive = document.documentElement.classList.contains(DIM_CLASS);
  if (hasLightsOut) {
    // X is in dark mode → activate dim
    _suspendedForLight = false;
    // Always call applyDim — the class may be present from optimistic add
    // without proper init (scan, theme-color). applyDim is idempotent.
    applyDim();
    if (!dimActive) {
      for (const ms of [500, 1500, 3000, 5000]) setTimeout(fullRescan, ms);
    }
  } else if (dimActive && _seenLightsOut) {
    // X switched to light mode (LightsOut was present, now removed) → suspend dim
    _suspendedForLight = true;
    removeDim();
  }
}

// Track whether X has ever been in dark mode this session.
// Prevents removing dim before X has finished initializing.
let _seenLightsOut = false;

function startBodyObserver() {
  if (_bodyObserver || !document.body) return;
  if (document.body.classList.contains("LightsOut")) _seenLightsOut = true;
  _bodyObserver = new MutationObserver(() => {
    if (document.body.classList.contains("LightsOut")) _seenLightsOut = true;
    syncDimWithTheme();
  });
  _bodyObserver.observe(document.body, {
    attributes: true,
    attributeFilter: ["class"],
  });
}

function stopBodyObserver() {
  if (_bodyObserver) {
    _bodyObserver.disconnect();
    _bodyObserver = null;
  }
}

// ── Black Background Scanner ─────────────────────────────────────
// Catches inline black backgrounds not covered by known CSS selectors.
// Uses a CSS class (not inline styles) so toggling is instant and non-destructive.

let _scanFrame = 0;
const _pending = new Set();

function queueScan(nodes) {
  for (const n of nodes) {
    if (n && n.nodeType === 1) _pending.add(n);
  }
  if (_pending.size && !_scanFrame) {
    _scanFrame = requestAnimationFrame(flushScan);
  }
}

function flushScan() {
  _scanFrame = 0;
  if (!document.documentElement.classList.contains(DIM_CLASS)) {
    _pending.clear();
    return;
  }
  const batch = [..._pending];
  _pending.clear();
  for (const node of batch) dimSubtree(node);
}

function dimSubtree(root) {
  dimElement(root);
  for (const el of root.querySelectorAll("div,main,aside,header,nav,section,article,footer,button")) {
    dimElement(el);
  }
}

function dimElement(el) {
  if (!el || el.nodeType !== 1 || el.classList.contains("xdm-dimmed") || el.classList.contains("xdm-dimmed-elevated")) return;
  const bg = el.classList.contains("jf-element")
    ? (() => { try { return getComputedStyle(el).backgroundColor; } catch { return ""; } })()
    : el.style.backgroundColor;
  if (bg === "rgb(0, 0, 0)" || bg === "rgba(0, 0, 0, 1)") {
    el.classList.add("xdm-dimmed");
  } else if (bg === "rgb(24, 24, 27)") {
    el.classList.add("xdm-dimmed-elevated");
  }
}

// ── Display Settings Injection ─────────────────────────────────────

const CHECKMARK_SVG = `<svg viewBox="0 0 24 24" aria-hidden="true" class="r-4qtqp9 r-yyyyoo r-dnmrzs r-bnwqim r-lrvibr r-m6rgpd r-jwli3a r-1hjwoze r-12ym1je"><g><path d="M9.64 18.952l-5.55-4.861 1.317-1.504 3.951 3.459 8.459-10.948L19.4 6.32 9.64 18.952z"></path></g></svg>`;

function setSelected(btnEl) {
  btnEl.style.borderColor = "rgb(29, 155, 240)";
  btnEl.style.borderWidth = "2px";
  const circle = btnEl.querySelector('[role="radio"] > div');
  if (circle) {
    circle.style.backgroundColor = "rgb(29, 155, 240)";
    circle.style.borderColor = "rgb(29, 155, 240)";
    circle.innerHTML = CHECKMARK_SVG;
  }
  const input = btnEl.querySelector('input[type="radio"]');
  if (input) input.checked = true;
}

function setUnselected(btnEl) {
  btnEl.style.borderColor = "rgb(51, 54, 57)";
  btnEl.style.borderWidth = "1px";
  const circle = btnEl.querySelector('[role="radio"] > div');
  if (circle) {
    circle.style.backgroundColor = "rgba(0, 0, 0, 0)";
    circle.style.borderColor = "rgb(185, 202, 211)";
    circle.innerHTML = "";
  }
  const input = btnEl.querySelector('input[type="radio"]');
  if (input) input.checked = false;
}

function tryInjectDimOption() {
  if (document.getElementById(DIM_BTN_ID)) return;

  // Find the background picker by its radio inputs (language-independent)
  const bgRadio = document.querySelector('input[name="background-picker"]');
  if (!bgRadio) return;
  const radiogroup = bgRadio.closest('[role="radiogroup"]');
  if (!radiogroup) return;

  const buttons = radiogroup.querySelectorAll(':scope > div');
  if (buttons.length < 2) return;

  const defaultBtn = buttons[0];
  const lightsOutBtn = buttons[1];

  // Clone the Lights Out button as our base
  const dimBtn = lightsOutBtn.cloneNode(true);
  dimBtn.id = DIM_BTN_ID;

  // Set dim background color to current theme
  const { hue, sat } = getActiveHueSat();
  dimBtn.style.backgroundColor = `hsl(${hue}, ${sat}%, 13%)`;

  // Change label to localized "Dim"
  const label = dimBtn.querySelector("span");
  if (label) label.textContent = chrome.i18n.getMessage("dimLabel");

  // Update radio input
  const input = dimBtn.querySelector('input[type="radio"]');
  if (input) {
    input.setAttribute("aria-label", chrome.i18n.getMessage("dimLabel"));
    input.checked = false;
  }

  // Insert between Default and Lights Out
  radiogroup.insertBefore(dimBtn, lightsOutBtn);

  // Set initial visual state based on whether dim is enabled
  chrome.storage.local.get("enabled", ({ enabled }) => {
    syncSettingsButtons(!!enabled);
  });

  // ── Click handlers ──

  dimBtn.addEventListener("click", () => {
    chrome.storage.local.set({ enabled: true });
    syncSettingsButtons(true);
    activateLightsOut();
  });

  // When Default or Lights Out is clicked directly, disable Dim
  for (const nativeBtn of [defaultBtn, lightsOutBtn]) {
    nativeBtn.addEventListener("click", () => {
      if (_switchingToDim) return; // Ignore clicks triggered by dim switch
      chrome.storage.local.set({ enabled: false });
      setUnselected(dimBtn);
    });
  }
}

// ── Lights Out Helper ──────────────────────────────────────────────
// Clicks X's Lights Out radio (if the Display settings page is open) to ensure
// the correct base theme. Used by both the Dim button and the popup toggle.

let _switchingToDim = false;

function activateLightsOut() {
  const dimBtn = document.getElementById(DIM_BTN_ID);
  if (!dimBtn) return; // Settings page not open
  const radiogroup = dimBtn.closest('[role="radiogroup"]');
  if (!radiogroup) return;
  const allBtns = radiogroup.querySelectorAll(":scope > div");
  const lightsOutBtn = allBtns[allBtns.length - 1];
  if (!lightsOutBtn) return;
  const loInput = lightsOutBtn.querySelector('input[type="radio"]');
  if (loInput && !loInput.checked) {
    _switchingToDim = true;
    loInput.click();
    loInput.dispatchEvent(new Event("input", { bubbles: true }));
    loInput.dispatchEvent(new Event("change", { bubbles: true }));
    setTimeout(() => { _switchingToDim = false; }, 300);
  }
}

// ── Observer & Init ────────────────────────────────────────────────

let _enabled = false;
let observer;

function startObserver() {
  if (observer) return;
  observer = new MutationObserver((mutations) => {
    try {
      // Re-apply dim if class was removed by X (unless suspended for light mode)
      if (_enabled && !_suspendedForLight && !document.documentElement.classList.contains(DIM_CLASS)) {
        applyDim();
      }
      // Scan newly added nodes for black backgrounds
      if (_enabled && document.documentElement.classList.contains(DIM_CLASS)) {
        for (const m of mutations) {
          if (m.addedNodes.length) queueScan(m.addedNodes);
        }
      }
      // Swap bird logos on newly added nodes
      if (_birdLogo) {
        for (const m of mutations) {
          for (const n of m.addedNodes) {
            if (n.nodeType === 1) swapBirdLogos(n);
          }
        }
      }
      // Try to inject the Dim button on the display settings page
      tryInjectDimOption();
      // Start body observer once body is available
      if (_enabled && document.body && !_bodyObserver) {
        startBodyObserver();
      }
    } catch {
      // Extension context invalidated after reload — clean up
      observer.disconnect();
    }
  });
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
}

// Re-scan the entire body to catch elements the initial scan or observer missed
function fullRescan() {
  if (_enabled && document.body) queueScan([document.body]);
}

// Init — single storage read, then use cached state
chrome.storage.local.get(["enabled", "theme", "customHue", "birdLogo"], ({ enabled, theme, customHue, birdLogo }) => {
  _theme = theme ?? "dim";
  _customHue = customHue ?? 210;
  _birdLogo = !!birdLogo;

  if (enabled === undefined) {
    _enabled = true;
    chrome.storage.local.set({ enabled: true });
  } else {
    _enabled = !!enabled;
  }
  // Sync localStorage cache for instant access at next document_start
  try { localStorage.setItem("__xdm_enabled", _enabled ? "1" : "0"); } catch (e) {}

  // Re-build CSS with actual theme (may differ from default injected at document_start)
  ensureBaseCSS();

  if (_enabled) {
    // Apply dim immediately if system is dark (avoids flash of black).
    // If system is light, body observer will handle it once X sets its theme.
    const systemDark = !window.matchMedia || window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (systemDark) {
      applyDim();
      for (const ms of [500, 1500, 3000, 5000]) setTimeout(fullRescan, ms);
    }
  } else {
    // User has dim disabled — remove the optimistic early class
    removeDim();
  }

  startObserver();
  tryInjectDimOption();

  // Start body observer if body is already available
  if (_enabled && document.body) {
    startBodyObserver();
  }

  // Apply bird logo swap if enabled
  if (_birdLogo) {
    swapBirdLogos();
    // Re-run after page settles (logo may load later)
    for (const ms of [500, 1500, 3000]) setTimeout(() => swapBirdLogos(), ms);
  }
});

// Sync the radio buttons on the Display settings page with the current state
function syncSettingsButtons(enabled) {
  const dimBtn = document.getElementById(DIM_BTN_ID);
  if (!dimBtn) return;
  const radiogroup = dimBtn.closest('[role="radiogroup"]');
  if (!radiogroup) return;
  const allBtns = radiogroup.querySelectorAll(":scope > div");
  const lightsOutBtn = allBtns[allBtns.length - 1];

  if (enabled) {
    setSelected(dimBtn);
    for (const btn of allBtns) {
      if (btn !== dimBtn) setUnselected(btn);
    }
  } else {
    setUnselected(dimBtn);
    if (lightsOutBtn) setSelected(lightsOutBtn);
  }
}

// Update the settings page Dim button preview color
function updateSettingsButtonColor() {
  const dimBtn = document.getElementById(DIM_BTN_ID);
  if (!dimBtn) return;
  const { hue, sat } = getActiveHueSat();
  dimBtn.style.backgroundColor = `hsl(${hue}, ${sat}%, 13%)`;
}

// Listen for toggle — updates cached state synchronously
chrome.storage.onChanged.addListener((changes) => {
  if (changes.enabled) {
    _enabled = !!changes.enabled.newValue;
    try { localStorage.setItem("__xdm_enabled", _enabled ? "1" : "0"); } catch (e) {}
    if (_enabled) {
      _suspendedForLight = false;
      startBodyObserver();
      applyDim();
      activateLightsOut();
    } else {
      stopBodyObserver();
      removeDim();
    }
    syncSettingsButtons(_enabled);
  }
  if (changes.theme || changes.customHue) {
    if (changes.theme) _theme = changes.theme.newValue ?? "dim";
    if (changes.customHue) _customHue = changes.customHue.newValue ?? 210;
    ensureBaseCSS();
    syncThemeColor();
    updateSettingsButtonColor();
  }
  if (changes.birdLogo) {
    _birdLogo = !!changes.birdLogo.newValue;
    if (_birdLogo) {
      swapBirdLogos();
    } else {
      restoreBirdLogos();
    }
  }
});
