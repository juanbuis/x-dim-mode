const DIM_BASE_ID = "x-dim-base-ext";
const DIM_BTN_ID = "x-dim-option-btn";
const DIM_CLASS = "x-dim-active";

// ── Bird Logo ─────────────────────────────────────────────────────
const BIRD_PATH = "M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z";
let _birdLogo = false;
let _oldFont = false;
let _classicFavicon = false;
let _tweetWording = false;

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

// ── Settings Storage ───────────────────────────────────────────────
// User settings live in chrome.storage.sync so they roam across devices,
// mirrored to local as a warm fallback (sync can be empty on first run after
// migration, and hue-slider drags write local-only to stay inside sync's
// write quota). Reads prefer sync; local fills any missing keys.

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

function paletteFromHue(h, s) {
  const bSat = Math.round(s * 0.47);
  return {
    bg:         `hsl(${h}, ${s}%, 13%)`,
    bgHover:    `hsl(${h}, ${Math.round(s * 0.74)}%, 16%)`,
    bgElevated: `hsl(${h}, ${Math.round(s * 0.71)}%, 20%)`,
    backdrop:   `hsla(${h}, ${s}%, 13%, 0.85)`,
    text:       `hsl(${h}, ${Math.round(s * 0.32)}%, 60%)`,
    border:     `hsl(${h}, ${bSat}%, 26%)`,
    // Modal scrim — classic Twitter's #5B7083 at 40% for hue 210, hue-adaptive
    scrim:      `hsla(${h}, 18%, 44%, 0.4)`,
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
    --xdm-scrim: ${p.scrim};
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
    /* Avatar loading placeholder circles (bg-gray-300, rgb(61,64,67)) — neutral
       grey flash on navy while images load; borderRaw matches its lightness. */
    --color-gray-300: ${p.borderRaw};
    /* Share-via-Chat modal & friends: X paints these surfaces near-black
       (hsl 0 0% 8% / #141414) via dedicated variables, so remap them to the
       dim bg like every other modal surface (r-cl2sl0, rgb(20,20,20)). */
    --color-modal-background: ${p.bgRaw};
    --x-bg-modal: ${p.bg};
    /* shadcn popover surfaces (dropdown/context menus in the chat UI) are
       pure black natively — map to dim bg for consistency. */
    --popover: ${p.bgRaw};
    /* Chat UI's modal scrim is already classic blue-grey rgba(91,112,131,0.4);
       re-derive it from the active hue so non-blue themes stay cohesive. */
    --color-modal-overlay: ${p.scrim};
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
  html.${DIM_CLASS} [style*="background-color: rgba(0, 0, 0, 1)"],
  html.${DIM_CLASS} [style*="background-color: rgb(20, 20, 20)"] {
    background-color: var(--xdm-bg) !important;
  }
  /* Elevated section cards (rgb(24,24,27) in dark mode → slightly lighter in dim) */
  html.${DIM_CLASS} [style*="background-color: rgb(24, 24, 27)"] {
    background-color: var(--xdm-bg-hover) !important;
  }
  /* Modal scrim — X's legacy UI paints it black (inline rgba(0,0,0,0.5));
     classic Twitter used blue-grey #5B7083 at 40%, which X's own chat UI
     still uses. Scoped to the mask testid so no other overlay is touched. */
  html.${DIM_CLASS} [data-testid="mask"] {
    background-color: var(--xdm-scrim) !important;
  }
  /* Avatar loading placeholders (legacy UI): inline rgb(62,65,68) behind every
     avatar, visible as a neutral-grey flash until the image loads. --xdm-border
     is the closest tone in the palette (same lightness, navy-tinted). */
  html.${DIM_CLASS} [style*="background-color: rgb(62, 65, 68)"] {
    background-color: var(--xdm-border) !important;
  }
  /* Icon containers in menu rows (Premium, etc.) */
  html.${DIM_CLASS} [role="link"] > div > div:first-child div:has(> svg:only-child) {
    background-color: var(--xdm-bg-elevated) !important;
  }

  /* X utility classes for black backgrounds.
     r-cl2sl0 = modal/compose surface (rgb(20,20,20), class-based not inline). */
  html.${DIM_CLASS} .r-kemksi,
  html.${DIM_CLASS} .r-1niwhzg,
  html.${DIM_CLASS} .r-yfoy6g,
  html.${DIM_CLASS} .r-14lw9ot,
  html.${DIM_CLASS} .r-cl2sl0 {
    background-color: var(--xdm-bg) !important;
  }
  /* Premium/promo media cards: a black card topped by a full-bleed hero image
     whose dark background is baked into the PNG (designed to sit on X's black
     card). Recoloring the body to navy leaves a two-tone seam where the black
     image meets the navy body, so keep these cards dark to blend.
     r-16cnnyw is the distinguishing class on these hero cards — it is NOT on the
     sidebar content cards (Today's News, Who to follow) which also happen to be
     .r-kemksi.r-rs99b7 and contain small images (thumbnails, avatars) but must
     stay navy. Without r-16cnnyw the selector wrongly blacks out those modules. */
  html.${DIM_CLASS} .r-kemksi.r-16cnnyw.r-rs99b7:has(img) {
    background-color: #000 !important;
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
  /* Trailing hairline at the bottom of dropdown menus / modals (.r-cl2sl0 surface):
     X renders a divider as the last element with nothing below it. Natively its
     neutral grey blends into the near-black menu, but --xdm-border reads as a
     light line against navy. Only the trailing (:last-child) one is hidden, so
     dividers between menu items are untouched. */
  html.${DIM_CLASS} .r-cl2sl0 .r-gu4em3:last-child {
    background-color: transparent !important;
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
  /* Creator Studio icon containers (jf-element framework) are now transparent
     natively — X no longer gives them a dark bg, so we must not force one
     (doing so paints stray gray squares behind each icon). Genuinely-dark
     jf containers are still handled by the scanner (dimElement). */
  /* Creator Studio dividers inside elevated section cards */
  html.${DIM_CLASS} .xdm-dimmed-elevated .jf-element:empty {
    background-color: var(--xdm-border) !important;
    border-color: var(--xdm-border) !important;
  }

  /* "Today's News" sidebar module (jetfuel framework). X hard-codes a black bg
     on the card via [data-theme="dark"] .jetfuel-style-root .<hash>, and the
     scanner misses it because that class is applied after insertion (the
     childList observer doesn't watch attribute changes). Scope to the sidebar
     column (data-testid is stable and not localized) so Creator Studio's
     jetfuel UI in the primary column is untouched. --xdm-bg matches the page,
     so if this ever catches a natively-transparent sidebar card it stays
     invisible rather than painting a visible block. */
  html.${DIM_CLASS} [data-testid="sidebarColumn"] .jetfuel-style-root > .jf-element {
    background-color: var(--xdm-bg) !important;
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

// Optimistically apply dim before the async storage read, using localStorage as a
// sync cache. First install: cache is null → default to dim. Disabled users: "0" → skip.
// X usually hasn't set data-theme this early, so the system preference is the best
// available guess; syncDimWithTheme corrects it the moment X commits a theme. If X
// *has* already declared light, honour that instead of guessing.
if (localStorage.getItem("__xdm_enabled") !== "0" &&
    document.documentElement.getAttribute("data-theme") !== "light" &&
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

const BIRD_CSS_ID = "x-dim-bird-css";

function isXLogoPath(d) {
  return d && (d.startsWith("M18.244") || d.startsWith("M21.742"));
}

function swapSinglePath(p) {
  const d = p.getAttribute("d");
  if (!isXLogoPath(d)) return false;
  if (!p.getAttribute("data-xdm-original-d")) {
    p.setAttribute("data-xdm-original-d", d);
  }
  p.setAttribute("d", BIRD_PATH);
  p.setAttribute("data-xdm-bird", "1");
  return true;
}

function swapBirdLogos(root) {
  if (!_birdLogo) return;
  const el = root || document;
  // querySelectorAll("svg path") misses paths when root IS the svg.
  // Query all paths, plus check root itself if it's a path element.
  const paths = el.querySelectorAll ? el.querySelectorAll("path") : [];
  for (const p of paths) swapSinglePath(p);
  if (el instanceof SVGPathElement) swapSinglePath(el);
}

function ensureBirdCSS() {
  if (document.getElementById(BIRD_CSS_ID)) return;
  const style = document.createElement("style");
  style.id = BIRD_CSS_ID;
  // Dark/dim mode: inherit UI color (white). Light mode: classic Twitter blue.
  style.textContent = `
    path[data-xdm-bird] { fill: currentColor !important; }
    @media (prefers-color-scheme: light) {
      path[data-xdm-bird] { fill: #1D9BF0 !important; }
    }
  `;
  (document.head || document.documentElement).appendChild(style);
}

function removeBirdCSS() {
  document.getElementById(BIRD_CSS_ID)?.remove();
}

function restoreBirdLogos() {
  for (const p of document.querySelectorAll("path[data-xdm-original-d]")) {
    p.setAttribute("d", p.getAttribute("data-xdm-original-d"));
    p.removeAttribute("data-xdm-original-d");
    p.removeAttribute("data-xdm-bird");
  }
  removeBirdCSS();
}

// Periodic re-check: catches React re-renders that update the d attribute
// in-place (not caught by childList mutation observer).
let _birdInterval = 0;

function startBirdInterval() {
  if (_birdInterval) return;
  _birdInterval = setInterval(() => {
    if (!_birdLogo) { stopBirdInterval(); return; }
    swapBirdLogos();
  }, 2000);
}

function stopBirdInterval() {
  if (_birdInterval) { clearInterval(_birdInterval); _birdInterval = 0; }
}

// ── Classic Font ──────────────────────────────────────────────────
// Swaps X's Chirp typeface back to the Helvetica Neue stack Twitter used for
// years. A single !important rule on the root and its descendants; gated by a
// class so toggling is instant. Icons are SVG and emoji are images, so nothing
// but the text typeface is affected.

const FONT_CSS_ID = "x-dim-font-css";
const OLDFONT_CLASS = "x-dim-oldfont";

function ensureFontCSS() {
  if (document.getElementById(FONT_CSS_ID)) return;
  const style = document.createElement("style");
  style.id = FONT_CSS_ID;
  style.textContent = `
    html.${OLDFONT_CLASS},
    html.${OLDFONT_CLASS} * {
      font-family: "Helvetica Neue", Helvetica, Arial, sans-serif !important;
    }
  `;
  (document.head || document.documentElement).appendChild(style);
}

function applyOldFont() {
  ensureFontCSS();
  document.documentElement.classList.add(OLDFONT_CLASS);
}

function removeOldFont() {
  document.documentElement.classList.remove(OLDFONT_CLASS);
}

// ── Classic Favicon & Tab Title ───────────────────────────────────
// Restores the blue bird favicon and renames the tab from "X" to "Twitter".
// X rewrites both (favicon for unread counts, title on every navigation), so a
// head observer re-applies whenever they change back.

const BIRD_FAVICON = "data:image/svg+xml," + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#1DA1F2" d="${BIRD_PATH}"/></svg>`
);

let _classicObserver = null;

function setBirdFavicon() {
  const links = document.querySelectorAll('link[rel~="icon"]');
  let found = false;
  for (const l of links) {
    found = true;
    if (l.getAttribute("href") === BIRD_FAVICON) continue;
    if (!l.hasAttribute("data-xdm-fav-orig")) {
      l.setAttribute("data-xdm-fav-orig", l.getAttribute("href") || "");
    }
    l.setAttribute("href", BIRD_FAVICON);
  }
  if (!found) {
    const link = document.createElement("link");
    link.rel = "icon";
    link.type = "image/svg+xml";
    link.href = BIRD_FAVICON;
    link.setAttribute("data-xdm-fav-added", "1");
    (document.head || document.documentElement).appendChild(link);
  }
}

function restoreFavicon() {
  for (const l of document.querySelectorAll("link[data-xdm-fav-orig]")) {
    l.setAttribute("href", l.getAttribute("data-xdm-fav-orig"));
    l.removeAttribute("data-xdm-fav-orig");
  }
  for (const l of document.querySelectorAll("link[data-xdm-fav-added]")) l.remove();
}

function applyClassicTitle() {
  const t = document.title;
  // Titles are "<page> / X", or just "X" on some routes.
  const nt = t === "X" ? "Twitter" : t.replace(/ \/ X$/, " / Twitter");
  if (nt !== t) document.title = nt;
}

function restoreClassicTitle() {
  // Reverse the current title rather than a stored one, so it's correct even
  // if the user navigated to another page while the feature was on.
  const t = document.title;
  const nt = t === "Twitter" ? "X" : t.replace(/ \/ Twitter$/, " / X");
  if (nt !== t) document.title = nt;
}

function applyClassic() {
  setBirdFavicon();
  applyClassicTitle();
}

function startClassicObserver() {
  if (_classicObserver || !document.head) return;
  _classicObserver = new MutationObserver(() => {
    if (_classicFavicon) applyClassic();
  });
  // childList/characterData catch <title> text swaps; href catches favicon changes.
  _classicObserver.observe(document.head, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ["href"],
  });
}

function stopClassicObserver() {
  if (_classicObserver) {
    _classicObserver.disconnect();
    _classicObserver = null;
  }
}

function removeClassic() {
  stopClassicObserver();
  restoreFavicon();
  restoreClassicTitle();
}

// ── "Tweet", not "Post" wording ───────────────────────────────────
// Renames X's rebranded verbs (Post→Tweet, Repost→Retweet) back to Twitter's.
// Scoped to known UI chrome only — compose buttons, tabs, the retweet menu, and
// the retweet button's aria-label — so it never touches user-written content.
// Repost rules run before Post rules; word boundaries keep "Repost" out of the
// Post rules and leave names like "Postman" untouched.

const WORDING_FORWARD = [
  [/\bReposts\b/g, "Retweets"],
  [/\bRepost\b/g, "Retweet"],
  [/\breposts\b/g, "retweets"],
  [/\brepost\b/g, "retweet"],
  [/\bReposted\b/g, "Retweeted"],
  [/\breposted\b/g, "retweeted"],
  [/\bPosts\b/g, "Tweets"],
  [/\bPost\b/g, "Tweet"],
  [/\bposts\b/g, "tweets"],
  [/\bpost\b/g, "tweet"],
];

const WORDING_REVERSE = [
  [/\bRetweets\b/g, "Reposts"],
  [/\bRetweet\b/g, "Repost"],
  [/\bretweets\b/g, "reposts"],
  [/\bretweet\b/g, "repost"],
  [/\bRetweeted\b/g, "Reposted"],
  [/\bretweeted\b/g, "reposted"],
  [/\bTweets\b/g, "Posts"],
  [/\bTweet\b/g, "Post"],
  [/\btweets\b/g, "posts"],
  [/\btweet\b/g, "post"],
];

// Visible text lives in these UI containers; all are chrome, never user content.
const WORDING_TEXT_SELECTOR = [
  '[data-testid="tweetButton"]',
  '[data-testid="tweetButtonInline"]',
  '[role="tab"]',
  '[data-testid="Dropdown"] [role="menuitem"]',
].join(",");

// aria-labels safe to rewrite (interactive controls, never tweet bodies).
const WORDING_ARIA_SELECTOR = [
  '[data-testid="retweet"]',
  '[data-testid="unretweet"]',
  '[data-testid="tweetButton"]',
  '[data-testid="tweetButtonInline"]',
].join(",");

function xdmWordSwap(s, reverse) {
  const map = reverse ? WORDING_REVERSE : WORDING_FORWARD;
  let out = s;
  for (const [re, rep] of map) out = out.replace(re, rep);
  return out;
}

function swapWordingText(el, reverse) {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = walker.nextNode())) {
    const v = n.nodeValue;
    if (!v || !v.trim()) continue;
    const nv = xdmWordSwap(v, reverse);
    if (nv !== v) n.nodeValue = nv;
  }
}

function swapWordingAria(el, reverse) {
  const label = el.getAttribute("aria-label");
  if (!label) return;
  const nv = xdmWordSwap(label, reverse);
  if (nv !== label) el.setAttribute("aria-label", nv);
}

function applyTweetWording(root, reverse) {
  const scope = root && root.querySelectorAll ? root : document;
  const textEls = scope.querySelectorAll(WORDING_TEXT_SELECTOR);
  for (const el of textEls) swapWordingText(el, reverse);
  const ariaEls = scope.querySelectorAll(WORDING_ARIA_SELECTOR);
  for (const el of ariaEls) swapWordingAria(el, reverse);
  // A freshly-added node may itself be a target rather than a container.
  if (scope !== document && scope.matches) {
    if (scope.matches(WORDING_TEXT_SELECTOR)) swapWordingText(scope, reverse);
    if (scope.matches(WORDING_ARIA_SELECTOR)) swapWordingAria(scope, reverse);
  }
}

// React can rewrite a button's text in place (no node insertion), so re-run
// periodically the way the bird swap does.
let _wordingInterval = 0;

function startWordingInterval() {
  if (_wordingInterval) return;
  _wordingInterval = setInterval(() => {
    if (!_tweetWording) { stopWordingInterval(); return; }
    applyTweetWording(document, false);
  }, 2000);
}

function stopWordingInterval() {
  if (_wordingInterval) { clearInterval(_wordingInterval); _wordingInterval = 0; }
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
    _pendingShallow.clear();
  }
  // Remove scanner-applied classes (non-destructive — doesn't touch original styles)
  for (const el of document.querySelectorAll(".xdm-dimmed, .xdm-dimmed-elevated")) {
    el.classList.remove("xdm-dimmed", "xdm-dimmed-elevated");
  }
}

// ── X Theme Sync ──────────────────────────────────────────────────
// Dim must only paint over X's own dark theme. If X is in light mode, our
// backgrounds land under X's dark text and the page becomes unreadable.
//
// X signals its active theme with data-theme="light|dark" on <html>. It used to
// use a LightsOut class on <body>; that class is gone from current X, but it is
// still honoured below so older/cached builds keep working.

let _bodyObserver;
let _suspendedForLight = false;

// true = X is dark, false = X is light, null = X hasn't committed a theme yet.
// The null case matters: at document_start we must not tear down the optimistic
// dim (that would flash black), and we must not force it on either.
function isXDark() {
  const dataTheme = document.documentElement.getAttribute("data-theme");
  if (dataTheme === "dark") return true;
  if (dataTheme === "light") return false;
  if (document.body && document.body.classList.contains("LightsOut")) return true;
  // color-scheme on the root is X's other tell, set alongside data-theme.
  const scheme = document.documentElement.style.colorScheme;
  if (scheme === "dark") return true;
  if (scheme === "light") return false;
  return null;
}

function syncDimWithTheme() {
  if (!_enabled) return;
  const xDark = isXDark();
  if (xDark === null) return; // X still initialising — leave current state alone
  const dimActive = document.documentElement.classList.contains(DIM_CLASS);
  if (xDark) {
    _suspendedForLight = false;
    // Always call applyDim — the class may be present from the optimistic add
    // without proper init (scan, theme-color). applyDim is idempotent.
    applyDim();
    if (!dimActive) {
      for (const ms of [500, 1500, 3000, 5000]) setTimeout(fullRescan, ms);
    }
  } else if (dimActive) {
    // X is in light mode → suspend dim so we never tint a light page
    _suspendedForLight = true;
    removeDim();
  }
}

function startBodyObserver() {
  if (_bodyObserver) return;
  _bodyObserver = new MutationObserver(syncDimWithTheme);
  // data-theme/style live on <html>; the legacy LightsOut class lives on <body>.
  _bodyObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme", "style"],
  });
  if (document.body) {
    _bodyObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });
  }
  syncDimWithTheme();
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
const _pending = new Set();        // deep: scan element + descendants (newly added nodes)
const _pendingShallow = new Set(); // shallow: re-check one element (late class/style change)

function kickScan() {
  if ((_pending.size || _pendingShallow.size) && !_scanFrame) {
    _scanFrame = requestAnimationFrame(flushScan);
  }
}

function queueScan(nodes) {
  for (const n of nodes) {
    if (n && n.nodeType === 1) _pending.add(n);
  }
  kickScan();
}

// For class/style attribute mutations: X sometimes applies a dark background
// AFTER inserting the element (e.g. the jetfuel "Today's News" card), which a
// childList-only observer never sees. Re-check just the mutated element —
// dimElement is cheap (inline-style read; computed style only for jf-elements).
function queueShallow(node) {
  if (node && node.nodeType === 1) _pendingShallow.add(node);
  kickScan();
}

function flushScan() {
  _scanFrame = 0;
  if (!document.documentElement.classList.contains(DIM_CLASS)) {
    _pending.clear();
    _pendingShallow.clear();
    return;
  }
  const batch = [..._pending];
  _pending.clear();
  const shallow = [..._pendingShallow];
  _pendingShallow.clear();
  for (const node of batch) dimSubtree(node);
  for (const node of shallow) dimElement(node);
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
  if (bg === "rgb(0, 0, 0)" || bg === "rgba(0, 0, 0, 1)" || bg === "rgb(20, 20, 20)") {
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
  getSettings(({ enabled }) => {
    syncSettingsButtons(!!enabled);
  });

  // ── Click handlers ──

  dimBtn.addEventListener("click", () => {
    setSettings({ enabled: true });
    syncSettingsButtons(true);
    activateLightsOut();
  });

  // When Default or Lights Out is clicked directly, disable Dim
  for (const nativeBtn of [defaultBtn, lightsOutBtn]) {
    nativeBtn.addEventListener("click", () => {
      if (_switchingToDim) return; // Ignore clicks triggered by dim switch
      setSettings({ enabled: false });
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
      // Re-apply dim if X stripped our class — but only when X is actually in
      // dark mode. Re-applying unconditionally is what used to paint dim over
      // a light-mode page and leave X's dark text unreadable on navy.
      if (_enabled && !_suspendedForLight &&
          !document.documentElement.classList.contains(DIM_CLASS) &&
          isXDark() !== false) {
        applyDim();
      }
      // Scan newly added nodes for black backgrounds; re-check elements whose
      // class/style changed after insertion (late-applied dark backgrounds)
      if (_enabled && document.documentElement.classList.contains(DIM_CLASS)) {
        for (const m of mutations) {
          if (m.type === "attributes") {
            queueShallow(m.target);
          } else if (m.addedNodes.length) {
            queueScan(m.addedNodes);
          }
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
      // Rename Post→Tweet on newly added nodes
      if (_tweetWording) {
        for (const m of mutations) {
          for (const n of m.addedNodes) {
            if (n.nodeType === 1) applyTweetWording(n, false);
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
    attributes: true,
    attributeFilter: ["class", "style"],
  });
}

// Re-scan the entire body to catch elements the initial scan or observer missed
function fullRescan() {
  if (_enabled && document.body) queueScan([document.body]);
}

// Init — single merged storage read (sync preferred, local fallback)
getSettings(({ enabled, theme, customHue, birdLogo, oldFont, classicFavicon, tweetWording }) => {
  _theme = theme ?? "dim";
  _customHue = customHue ?? 210;
  _birdLogo = !!birdLogo;
  _oldFont = !!oldFont;
  _classicFavicon = !!classicFavicon;
  _tweetWording = !!tweetWording;

  if (enabled === undefined) {
    _enabled = true;
    setSettings({ enabled: true });
  } else {
    _enabled = !!enabled;
  }
  // Sync localStorage cache for instant access at next document_start
  try { localStorage.setItem("__xdm_enabled", _enabled ? "1" : "0"); } catch (e) {}

  // Re-build CSS with actual theme (may differ from default injected at document_start)
  ensureBaseCSS();

  if (_enabled) {
    // If X has already declared its theme, obey it. Otherwise fall back to the
    // system preference to avoid a flash of black, and let the theme observer
    // correct us as soon as X commits one.
    const xDark = isXDark();
    const systemDark = !window.matchMedia || window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (xDark === true || (xDark === null && systemDark)) {
      applyDim();
      for (const ms of [500, 1500, 3000, 5000]) setTimeout(fullRescan, ms);
    } else if (xDark === false) {
      _suspendedForLight = true;
      removeDim();
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
    ensureBirdCSS();
    swapBirdLogos();
    // Re-run after page settles (logo may load later)
    for (const ms of [500, 1500, 3000]) setTimeout(() => swapBirdLogos(), ms);
    startBirdInterval();
  }

  // Apply classic font if enabled
  if (_oldFont) applyOldFont();

  // Apply classic favicon + tab title if enabled
  if (_classicFavicon) {
    applyClassic();
    startClassicObserver();
    // Favicon/title may not exist yet at document_start; re-run as head fills in
    // (and start the observer if head wasn't ready above).
    for (const ms of [500, 1500, 3000]) setTimeout(() => {
      if (_classicFavicon) { applyClassic(); startClassicObserver(); }
    }, ms);
  }

  // Apply Post→Tweet wording if enabled
  if (_tweetWording) {
    applyTweetWording(document, false);
    for (const ms of [500, 1500, 3000]) setTimeout(() => { if (_tweetWording) applyTweetWording(document, false); }, ms);
    startWordingInterval();
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

// Listen for toggle — updates cached state synchronously.
// Settings are written to both areas (and arrive from other devices via sync),
// so handle changes from either. Chrome only fires onChanged when a value
// actually differs, and all handlers below are idempotent, so the mirrored
// double-event per write is harmless.
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "sync" && area !== "local") return;
  if (changes.enabled) {
    _enabled = !!changes.enabled.newValue;
    try { localStorage.setItem("__xdm_enabled", _enabled ? "1" : "0"); } catch (e) {}
    if (_enabled) {
      _suspendedForLight = false;
      startBodyObserver();
      // Switch X to its dark base first (only possible with Settings open), then
      // let the theme check decide. On a light-mode X we stay off rather than
      // tinting a light page — Dim is a dark theme.
      activateLightsOut();
      syncDimWithTheme();
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
      ensureBirdCSS();
      swapBirdLogos();
      startBirdInterval();
    } else {
      stopBirdInterval();
      restoreBirdLogos();
    }
  }
  if (changes.oldFont) {
    _oldFont = !!changes.oldFont.newValue;
    if (_oldFont) applyOldFont();
    else removeOldFont();
  }
  if (changes.classicFavicon) {
    _classicFavicon = !!changes.classicFavicon.newValue;
    if (_classicFavicon) {
      applyClassic();
      startClassicObserver();
    } else {
      removeClassic();
    }
  }
  if (changes.tweetWording) {
    _tweetWording = !!changes.tweetWording.newValue;
    if (_tweetWording) {
      applyTweetWording(document, false);
      startWordingInterval();
    } else {
      stopWordingInterval();
      applyTweetWording(document, true);
    }
  }
});
