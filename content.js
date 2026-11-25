const DIM_BASE_ID = "x-dim-base-ext";
const DIM_BTN_ID = "x-dim-option-btn";
const DIM_CLASS = "x-dim-active";

// ── Bird Logo ─────────────────────────────────────────────────────
const BIRD_PATH = "M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z";
let _birdLogo = false;
let _oldFont = false;
let _classicFavicon = false;
let _tweetWording = false;
let _imageGrid = false;
let _copyLinkFirst = false;
let _buttonColor = "white";
let _buttonHex = "";
let _hideGrok = false;

// ── Theme Definitions ──────────────────────────────────────────────

const THEMES = {
  dim:   { hue: 210, sat: 34, button: "#1d9bf0" },
  slate: { hue: 210, sat: 8,  button: null },
  jade:  { hue: 150, sat: 34, button: "#00ba7c" },
  plum:  { hue: 270, sat: 34, button: "#7856ff" },
  dusk:  { hue: 330, sat: 34, button: "#f91880" },
  ember: { hue: 25,  sat: 34, button: "#ff7a00" },
};

let _theme = "dim";
let _customHue = 210;

// ── Settings Storage ───────────────────────────────────────────────
// User settings are written to both areas: sync so they roam across devices,
// local as this device's record of what the user last chose. Reads prefer
// local and fall back to sync — see getSettings for why that order matters.
// Remote changes arrive via onChanged and are mirrored back into local.

const SETTING_KEYS = ["enabled", "theme", "customHue", "birdLogo", "oldFont", "classicFavicon", "tweetWording", "followingTab", "imageGrid", "copyLinkFirst", "buttonColor", "buttonHex", "hideGrok", "hiddenNav"];

function getSettings(cb) {
  chrome.storage.sync.get(SETTING_KEYS, (syncVals) => {
    chrome.storage.local.get(SETTING_KEYS, (localVals) => {
      const merged = {};
      for (const k of SETTING_KEYS) {
        // Local wins when both are set: it records this device's most recent
        // explicit action. Sync can hold a stale value (its writes are
        // throttled and can fail silently), and letting it win meant a toggle
        // could be resurrected on the next read — turn Dim off, reload, and
        // it was back on. Sync still seeds a fresh device, and remote changes
        // arrive through onChanged, which mirrors them into local below.
        merged[k] = localVals[k] !== undefined ? localVals[k] : syncVals[k];
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
    // X's dark neutral scale (#0d0d0d … #999), re-derived from the active hue.
    // The light half (000–300) is left alone: those are near-white text tones.
    n1100:      `hsl(${h}, ${s}%, 10%)`,
    n700:       `hsl(${h}, ${bSat}%, 34%)`,
    n600:       `hsl(${h}, ${Math.round(s * 0.32)}%, 44%)`,
    n500:       `hsl(${h}, ${Math.round(s * 0.32)}%, 52%)`,
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

  /* X's Tailwind tokens: Chat since 2025, the whole app since the Nov 2026
     redesign. X declares its dark tokens on [data-theme=dark] and .dark-theme. */
  html.${DIM_CLASS}[data-theme="dark"],
  html.${DIM_CLASS} [data-theme="dark"],
  html.${DIM_CLASS} .dark-theme {${chatTokens(p)}
  }`;
}

// Chat's color tokens, shared by the page and by X's chat shadow roots (see
// buildShadowCSS), so the two can never drift apart.
function chatTokens(p) {
  return `
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
    /* The newer chat dialogs (conversation info, etc.) use --x-overlay-normal,
       plain black at 40%; same scrim treatment. --x-overlay-strong (80%
       black) is left alone: it backs full-screen media, which wants dark. */
    --x-overlay-normal: ${p.scrim};
    /* X's newer --x-* tokens (chat composer, sheets). Every neutral surface is
       black or white-over-black, so re-derive each from the dim bg: the
       composer pill (--x-btn-tertiary-opaque) is color-mix(#fff 10%, #000000)
       natively, which reads as a black strip on navy. */
    --x-bg-primary: var(--xdm-bg);
    /* Not the page colour: X uses bg-secondary as the one step up from the
       page (#141414 on black), and received chat bubbles are drawn with
       nothing else, so mapping it to the page bg made them invisible. */
    --x-bg-secondary: var(--xdm-bg-elevated);
    --x-bg-sheets: var(--xdm-bg);
    --x-bg-tertiary: color-mix(in srgb, #fff 15%, var(--xdm-bg));
    --x-btn-secondary: color-mix(in srgb, #fff 15%, var(--xdm-bg));
    --x-btn-secondary-hover: color-mix(in srgb, #fff 20%, var(--xdm-bg));
    --x-btn-secondary-pressed: color-mix(in srgb, #fff 30%, var(--xdm-bg));
    --x-btn-tertiary-opaque: color-mix(in srgb, #fff 10%, var(--xdm-bg));
    --x-btn-tertiary-opaque-hover: color-mix(in srgb, #fff 15%, var(--xdm-bg));
    --x-btn-tertiary-opaque-pressed: color-mix(in srgb, #fff 20%, var(--xdm-bg));
    /* Nov 2026 redesign: the whole app (not just chat) is now Tailwind on
       these --x-* tokens, and every semantic token X doesn't set from black or
       white comes from its neutral scale: --x-fg-secondary is neutral-400
       (#999), the grey of every handle and timestamp; --x-fg-tertiary is
       neutral-700. Re-deriving the dark half of the scale catches those, plus
       the utilities that use a neutral directly (radio rings, Grok chips). */
    --x-neutral-400: ${p.text};
    --x-neutral-500: ${p.n500};
    --x-neutral-600: ${p.n600};
    --x-neutral-700: ${p.n700};
    --x-neutral-800: ${p.border};
    --x-neutral-900: ${p.bgElevated};
    --x-neutral-1000: ${p.bg};
    --x-neutral-1100: ${p.n1100};
    --x-fg-secondary: var(--x-neutral-400);
    --x-fg-tertiary: var(--x-neutral-700);
    /* Toasts: X's is translucent neutral grey (#2229). */
    --x-toast-bg: color-mix(in srgb, ${p.bgElevated} 92%, transparent);
    /* --x-bg-alpha-NN is the page colour at NN% (white on light, black on
       dark): frosted sticky headers like Chat settings use 85%. On dark it
       read as a black bar over navy. (--x-black-NN stays black for media.) */${BG_ALPHA_STEPS.map((n) =>
      `\n    --x-bg-alpha-${n}: color-mix(in srgb, var(--xdm-bg) ${+n}%, transparent);`).join("")}
`;
}

const BG_ALPHA_STEPS = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10",
  "15", "20", "30", "40", "50", "60", "70", "80", "85", "90", "95", "100"];

// CSS adopted into every shadow root by shadow.js. X now renders Chat inside
// open shadow roots whose own Tailwind sheet redefines the dark tokens on an
// inner [data-theme="dark"] div, which the page stylesheet can't reach.
// html.x-dim-active isn't visible from inside a shadow tree, so shadow.js
// mirrors that gate by disabling the sheet; !important beats X's adopted
// sheets regardless of the order X adopts them in.
function buildShadowCSS() {
  const { hue: h, sat: s } = getActiveHueSat();
  const important = (decls) => decls.replace(/\/\*[\s\S]*?\*\//g, "").replace(/;/g, " !important;");
  return `
  :host([data-theme="dark"]), [data-theme="dark"], .dark-theme {${important(chatTokens(paletteFromHue(h, s)))}
  }
  .bg-gray-0 { background-color: var(--xdm-bg) !important; }
  .border-gray-50, .border-gray-100 { border-color: var(--xdm-border) !important; }
  ${buttonTokenCSS(':host([data-theme="dark"]), [data-theme="dark"], .dark-theme', true)}`;
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
  /* Icon containers in menu rows (Premium, etc.), legacy UI only. This rule is
     structural, and the Nov 2026 redesign's notification rows match the same
     shape, so it painted a slab behind every notification icon. react-native-
     web's class list always starts "css-"; the redesign's never does. */
  html.${DIM_CLASS} [role="link"] > div > div:first-child div[class^="css-"]:has(> svg:only-child) {
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
  /* Scanner-discovered neutral dividers (jetfuel modals, #262626) */
  html.${DIM_CLASS} .xdm-dimmed-divider {
    background-color: var(--xdm-border) !important;
  }
  /* Scanner-discovered jetfuel badges and grey text (Creator Studio) */
  html.${DIM_CLASS} .xdm-dimmed-badge {
    background-color: var(--xdm-bg-elevated) !important;
  }
  html.${DIM_CLASS} .xdm-dimmed-text {
    color: var(--xdm-text) !important;
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
  sendShadowCSS();
}

// Hand the chat CSS to shadow.js (page world). Either script can load first,
// so shadow.js announces itself and gets a resend.
let _shadowCSS = "";
function sendShadowCSS(force) {
  const css = buildShadowCSS();
  if (css === _shadowCSS && !force) return;
  _shadowCSS = css;
  document.dispatchEvent(new CustomEvent("xdm:shadow-css", { detail: css }));
}
document.addEventListener("xdm:shadow-ready", () => sendShadowCSS(true));

// Inject CSS immediately at document_start — don't wait for async storage read.
// Rules are gated by html.x-dim-active so they're inert until the class is added.
ensureBaseCSS();

// Optimistically apply dim before the async storage read, using localStorage as a
// sync cache. First install: cache is null → default to dim. Disabled users: "0" → skip.
// X usually hasn't set data-theme this early, so predict it the way X will decide
// it (its night_mode cookie, else the system preference; see xWouldBeLight);
// syncDimWithTheme corrects it the moment X commits a theme. If X *has* already
// declared light, honour that instead of guessing.
if (localStorage.getItem("__xdm_enabled") !== "0" &&
    document.documentElement.getAttribute("data-theme") !== "light" &&
    !xWouldBeLight()) {
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

// One prefix per X logo generation; the Nov 2026 redesign drew a new one.
const X_LOGO_PREFIXES = ["M18.244", "M21.742", "m21.62 21.5-7.47-10.9"];

function isXLogoPath(d) {
  return !!d && X_LOGO_PREFIXES.some((pre) => d.startsWith(pre));
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
  // Keyed off X's own theme: keying it off the OS painted a blue bird on a
  // dark X for anyone whose OS is light. The media query only covers a page
  // that hasn't declared a theme yet.
  style.textContent = `
    path[data-xdm-bird] { fill: currentColor !important; }
    html[data-theme="light"] path[data-xdm-bird] { fill: #1D9BF0 !important; }
    @media (prefers-color-scheme: light) {
      html:not([data-theme]) path[data-xdm-bird] { fill: #1D9BF0 !important; }
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

// ── Classic image grid ────────────────────────────────────────────
// X replaced the multi-image grid with a horizontal carousel, which hides
// images: a 3-image post scrolls to ~1011px inside a 598px column, so the
// third is off-screen behind a next arrow. This lays them back out as a grid,
// with an odd final image spanning the full width — the old Twitter layout.
//
// Not gated on the dim class: it's a layout preference, independent of theme.

const IMAGEGRID_CSS_ID = "x-dim-imagegrid-css";
const IMAGEGRID_CLASS = "x-dim-imagegrid";
// The redesign's still-image carousel track with 2–4 slides.
const GRID_TRACK = 'article [class~="group/carousel"] [class~="snap-x"]' +
  ":not(:has(video)):has(> :nth-child(2)):not(:has(> :nth-child(5)))";

function ensureImageGridCSS() {
  if (document.getElementById(IMAGEGRID_CSS_ID)) return;
  const style = document.createElement("style");
  style.id = IMAGEGRID_CSS_ID;
  // :not(:has(video)) leaves video/GIF carousels alone — forcing grid onto a
  // player would break it, and only still images should be re-laid-out.
  style.textContent = `
    html.${IMAGEGRID_CLASS} [role="article"] [data-testid="ScrollSnap-List"]:not(:has(video)) {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 2px;
      overflow: visible;
    }
    html.${IMAGEGRID_CLASS} [role="article"] [data-testid="ScrollSnap-List"]:not(:has(video)) > *:last-child:nth-child(odd) {
      grid-column: 1 / -1;
    }
    /* X sets object-fit: fill, which stretches an image into whatever cell it
       lands in (a portrait photo in the full-width slot distorts ~240%).
       Crop instead, which is what the original grid did. */
    html.${IMAGEGRID_CLASS} [role="article"] [data-testid="ScrollSnap-List"]:not(:has(video)) img {
      object-fit: cover !important;
      width: 100% !important;
      height: 100% !important;
    }
    /* Nothing is hidden any more, so the carousel arrows have nothing to do. */
    html.${IMAGEGRID_CLASS} [role="article"] [data-testid="ScrollSnap-prevButtonWrapper"],
    html.${IMAGEGRID_CLASS} [role="article"] [data-testid="ScrollSnap-nextButtonWrapper"] {
      display: none !important;
    }

    /* Nov 2026 redesign: no testids; the carousel is the snap-x track inside a
       group/carousel, its slides fixed squares in a fixed-height box. The grid
       fills that same box (rows share its height), so nothing below moves.
       Capped at four, as the old grid was: past that the cells get too small,
       and those posts keep X's carousel. X drops the arrows by itself once the
       track no longer scrolls. */
    html.${IMAGEGRID_CLASS} ${GRID_TRACK} {
      display: grid !important;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      grid-auto-rows: minmax(0, 1fr);
      gap: 2px !important;
      height: 100% !important;
      padding: 0 !important;
      overflow: hidden !important;
    }
    html.${IMAGEGRID_CLASS} ${GRID_TRACK} > * {
      width: auto !important;
      height: auto !important;
      min-width: 0 !important;
      min-height: 0 !important;
      aspect-ratio: auto !important;
    }
    html.${IMAGEGRID_CLASS} ${GRID_TRACK} > *:last-child:nth-child(odd) {
      grid-column: 1 / -1;
    }
    html.${IMAGEGRID_CLASS} ${GRID_TRACK} img {
      object-fit: cover !important;
      width: 100% !important;
      height: 100% !important;
    }
  `;
  (document.head || document.documentElement).appendChild(style);
}

function applyImageGrid() {
  ensureImageGridCSS();
  document.documentElement.classList.add(IMAGEGRID_CLASS);
}

function removeImageGrid() {
  document.documentElement.classList.remove(IMAGEGRID_CLASS);
}

// ── Copy link first (share menu) ──────────────────────────────────
//
// X pushed "Copy link" below "Send via Chat" in the share menu; this puts it
// back on top. Done purely in CSS: the menu is React-managed and short-lived,
// so physically moving the node risks breaking reconciliation when it closes.
// Instead the menu becomes a flex column and the item gets order:-1.
//
// The item is matched by its icon path rather than its label, so this works in
// every language X ships without us maintaining a translation table. The
// prefix is the start of X's link glyph, verified against the live markup.

// One per icon generation: the Nov 2026 redesign drew a new link glyph.
const COPYLINK_ICONS = ["M18.36 5.64c-1.95-1.96-5.11-1.96-7.07 0", "M1 12a7 7 0 0 1 7-7h"];

// Structure-agnostic. 1.8.0 used pure CSS that assumed menu items were direct
// children of [role="menu"] — true logged out, where it was verified, but
// logged-in X wraps its dropdown items in extra containers, so the selector
// never matched and nothing moved. Now: find the Copy link item, climb to the
// level where it sits beside its sibling items (whatever wraps them), make that
// container a flex column and give the item order:-1. Inline styles only, no
// node moves, so React's reconciliation is untouched.

// Fallback labels for the rare case X swaps the icon: X's own wording in the
// languages we ship.
const COPYLINK_LABELS = new Set([
  "copy link", "link kopieren", "copiar enlace", "copier le lien", "copiar link",
  "リンクをコピー", "링크 복사", "копировать ссылку", "复制链接", "نسخ الرابط",
]);

function isCopyLinkItem(item) {
  for (const p of item.querySelectorAll("svg path")) {
    const d = p.getAttribute("d") || "";
    if (COPYLINK_ICONS.some((pre) => d.startsWith(pre))) return true;
  }
  return COPYLINK_LABELS.has((item.textContent || "").trim().toLowerCase());
}

function hoistCopyLink(root) {
  if (!root || !root.querySelectorAll) return;
  // The added node may be the menu, something containing it, or (if X fills
  // the menu after mounting it) an item inside an already-open menu.
  const inside = root.closest?.('[role="menu"]');
  const menus = inside ? [inside] : root.querySelectorAll('[role="menu"]');
  for (const menu of menus) {
    const items = [...menu.querySelectorAll('[role="menuitem"]')];
    if (items.length < 2) continue;
    const copy = items.find(isCopyLinkItem);
    if (!copy) continue;
    // Climb until the next level up also contains another menu item: that
    // level is the list, and `node` is Copy link's row within it.
    let node = copy;
    while (node.parentElement && node.parentElement !== menu.parentElement) {
      const parent = node.parentElement;
      if (items.some((it) => it !== copy && parent.contains(it) && !node.contains(it))) break;
      node = parent;
    }
    const list = node.parentElement;
    if (!list) continue;
    list.style.setProperty("display", "flex", "important");
    list.style.setProperty("flex-direction", "column", "important");
    node.style.setProperty("order", "-1", "important");
  }
}

function applyCopyLinkFirst() {
  hoistCopyLink(document.body);
}

function removeCopyLinkFirst() {
  // Menus are rebuilt on every open, so there is nothing to undo on the page.
}

// ── Hide Grok ─────────────────────────────────────────────────────
// The Nov 2026 redesign puts Grok in the nav, in a floating dock launcher,
// on a button in every post's header ("Explain this post"), on profiles, and
// in the composer ("Generate image"). Every one of them draws the same Grok
// glyph, so the icon is the signal: language-independent, and it catches new
// placements without a selector each. :not(:has()) keeps it to the innermost
// control. Not gated on the dim class: it's a layout preference.

const HIDEGROK_CSS_ID = "x-dim-hidegrok-css";
const HIDEGROK_CLASS = "x-dim-hidegrok";
const GROK_ICON = 'path[d^="m9.27 15.28 7.98-5.92"]';

function ensureHideGrokCSS() {
  if (document.getElementById(HIDEGROK_CSS_ID)) return;
  const style = document.createElement("style");
  style.id = HIDEGROK_CSS_ID;
  style.textContent = `
    html.${HIDEGROK_CLASS} a[href="/i/grok"],
    html.${HIDEGROK_CLASS} :is(a, button):has(${GROK_ICON}):not(:has(:is(a, button) ${GROK_ICON})),
    html.${HIDEGROK_CLASS} [data-slot="xds-dock-window"]:has([data-slot="xds-dock-launcher"] ${GROK_ICON}),
    html.${HIDEGROK_CLASS} [data-testid="GrokDrawer"] {
      display: none !important;
    }
  `;
  (document.head || document.documentElement).appendChild(style);
}

function applyHideGrok() {
  ensureHideGrokCSS();
  document.documentElement.classList.add(HIDEGROK_CLASS);
}

function removeHideGrok() {
  document.documentElement.classList.remove(HIDEGROK_CLASS);
}

// ── Sidebar items ─────────────────────────────────────────────────
// The redesign's sidebar grew to eleven items. People pick which ones to hide
// (extras.html / welcome.html, ids in nav-items.js). Matched by href and icon,
// never by label, and scoped to the nav so links in posts are never touched.
// Everything hidden stays reachable by URL. Not gated on the dim class: it's
// a layout preference.

const SIDEBAR_CSS_ID = "x-dim-sidebar-css";
const NAV_HREFS = {
  explore: ["/explore"],
  notifications: ["/notifications"],
  chat: ["/i/chat", "/messages"],
  calls: ["/i/calls"],
  grok: ["/i/grok"],
  premium: ["/i/premium", "/i/premium_sign_up", "/i/verified-choose"],
  bookmarks: ["/i/history", "/i/bookmarks"],   // History is the redesign's name
  studio: ["/i/jf/creators/studio"],
  articles: ["/compose/articles"],
};
const CHAT_ICON = 'path[d^="M20.61 11.6c0-4.43-3.8"]';

function applyHiddenNav(ids) {
  const list = Array.isArray(ids) ? ids : [];
  const rules = [];
  for (const id of list) {
    for (const h of NAV_HREFS[id] || []) rules.push(`:is(nav, header) a[href="${h}"]`);
    if (id === "chatBubble") {
      rules.push(`[data-slot="xds-dock-window"]:has([data-slot="xds-dock-launcher"] ${CHAT_ICON})`);
      // The pre-redesign layout's floating Messages drawer. X rolls redesigns
      // out gradually, so both stay matched until the old one is gone.
      rules.push('[data-testid="DMDrawer"]', '[data-testid="chat-drawer-root"]');
    }
  }
  let style = document.getElementById(SIDEBAR_CSS_ID);
  if (!rules.length) { style?.remove(); return; }
  if (!style) {
    style = document.createElement("style");
    style.id = SIDEBAR_CSS_ID;
    (document.head || document.documentElement).appendChild(style);
  }
  style.textContent = `${rules.join(",\n")} { display: none !important; }`;
}

// ── Button color ───────────────────────────────────────────────
// X paints its primary buttons (Post, Follow) near-white in dark mode, with no
// setting to change it. The dark label inside is the stable signal: the button's
// own inline background vanishes on hover, but the label's color stays, and
// nothing else on a dark page uses it. :not(:has()) keeps it to the innermost
// control, since a "Who to follow" row is itself a button around a Follow button.

const BUTTONS_CSS_ID = "x-dim-buttons-css";
const CLICKABLE = ':is(button, a, [role="button"], [role="link"])';
const PRIMARY_BUTTON = `html.${DIM_CLASS} ${CLICKABLE}:has([style*="color: rgb(15, 20, 25)"]):not(:has(${CLICKABLE}))`;

// "Match theme" pairs each preset with one of X's own accent colors; Slate has no
// color of its own, so it keeps X's white. A custom hue gets the same saturation
// and lightness as X's blue.
function themeButtonColor() {
  if (_theme !== "custom") return (THEMES[_theme] || THEMES.dim).button;
  const a = 0.88 * 0.47;
  const f = (n) => {
    const k = (n + _customHue / 30) % 12;
    const v = 0.53 - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(v * 255).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

// Dark text only on genuinely light colors. Plain contrast ratio would put dark
// text on X's own blue, where X itself uses white.
function buttonTextColor(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.4 ? "#0f1419" : "#ffffff";
}

function activeButtonColor() {
  return _buttonColor === "theme" ? themeButtonColor()
    : _buttonColor === "custom" && /^#[0-9a-f]{6}$/i.test(_buttonHex) ? _buttonHex
    : null;
}

// The Nov 2026 redesign has no inline colours to match: every primary button
// is bg-btn-primary + text-inverted, drawn from X's own --x-btn-primary
// tokens. Overriding the tokens recolours them all (Post, Follow, Subscribe,
// Chat's buttons) with X's own hover and pressed states intact. The label
// colour is set on the button itself, so --x-fg-inverted changes nowhere
// else. `scope` is the dark-theme selector for the page or a shadow root.
function buttonTokenCSS(scope, imp) {
  const color = activeButtonColor();
  if (!color) return "";
  const i = imp ? " !important" : "";
  return `
  ${scope} {
    --x-btn-primary: ${color}${i};
    --x-btn-primary-hover: color-mix(in srgb, ${color} 85%, #000)${i};
    --x-btn-primary-pressed: color-mix(in srgb, ${color} 70%, #000)${i};
  }
  ${imp ? "" : `html.${DIM_CLASS} `}[class~="bg-btn-primary"] { --x-fg-inverted: ${buttonTextColor(color)}${i}; }`;
}

function applyButtonColor() {
  const color = activeButtonColor();
  sendShadowCSS(); // Chat's shadow roots carry the same tokens; see buildShadowCSS
  if (!color) return removeButtonColor();
  let style = document.getElementById(BUTTONS_CSS_ID);
  if (!style) {
    style = document.createElement("style");
    style.id = BUTTONS_CSS_ID;
    (document.head || document.documentElement).appendChild(style);
  }
  // Legacy UI (inline colours) first, then the redesign's tokens.
  style.textContent = `
    ${PRIMARY_BUTTON} { background-color: ${color} !important; }
    ${PRIMARY_BUTTON}:hover { background-color: color-mix(in srgb, ${color} 85%, #000) !important; }
    ${PRIMARY_BUTTON}:active { background-color: color-mix(in srgb, ${color} 70%, #000) !important; }
    ${PRIMARY_BUTTON}, ${PRIMARY_BUTTON} * { color: ${buttonTextColor(color)} !important; }
    ${buttonTokenCSS(`html.${DIM_CLASS}[data-theme="dark"], html.${DIM_CLASS} [data-theme="dark"], html.${DIM_CLASS} .dark-theme`, false)}
  `;
}

function removeButtonColor() {
  document.getElementById(BUTTONS_CSS_ID)?.remove();
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
// SideNav_NewTweet_Button is the big compose button in the left sidebar — the
// most prominent "Post" on the whole site, and the one people mean when they
// ask for this.
//
// The Nov 2026 redesign dropped nearly every data-testid. Its equivalents: the
// sidebar button is #sidebar-compose-post, the composer's Post button is the
// design-system button inside the compose <form>, and the retweet button is
// the one drawing the #icon-repost sprite (language-independent). The legacy
// selectors stay for accounts X hasn't moved over yet.
const WORDING_TEXT_SELECTOR = [
  '[data-testid="SideNav_NewTweet_Button"]',
  '[data-testid="tweetButton"]',
  '[data-testid="tweetButtonInline"]',
  '[role="tab"]',
  '[data-testid="Dropdown"] [role="menuitem"]',
  '#sidebar-compose-post',
  'form [data-slot="xds-button"]',
  '[role="menu"] [role="menuitem"]',
].join(",");

// aria-labels safe to rewrite (interactive controls, never tweet bodies).
const WORDING_ARIA_SELECTOR = [
  '[data-testid="retweet"]',
  '[data-testid="unretweet"]',
  '[data-testid="SideNav_NewTweet_Button"]',
  '[data-testid="tweetButton"]',
  '[data-testid="tweetButtonInline"]',
  '#sidebar-compose-post',
  'form [data-slot="xds-button"]',
  'button:has(use[href^="#icon-repost"])',
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

// ── Default to the Following tab ──────────────────────────────────
// X drops you back on the algorithmic "For you" timeline every time you land on
// /home. When enabled, nudge it over to Following once per arrival — a single
// click, latched, so switching back to For you sticks and we never fight the user.

let _followingTab = false;
let _followingDone = false; // latched per arrival at /home
let _lastPath = location.pathname;

function tryDefaultFollowing() {
  if (!_followingTab || _followingDone || location.pathname !== "/home") return;
  // primaryColumn went away in the Nov 2026 redesign; <main> holds the same
  // tablist there.
  const primary = document.querySelector('[data-testid="primaryColumn"]') || document.querySelector("main");
  if (!primary) return;
  // The tabs are localized and carry no test id, so match on position: X always
  // renders "For you" first and "Following" second, with pinned lists after.
  // (A second, empty tablist also exists in the column — skip it.)
  const tablist = [...primary.querySelectorAll('[role="tablist"]')]
    .find((tl) => tl.querySelectorAll('[role="tab"]').length >= 2);
  if (!tablist) return;
  const following = tablist.querySelectorAll('[role="tab"]')[1];
  if (!following) return;
  _followingDone = true; // latch before clicking — one nudge per arrival
  if (following.getAttribute("aria-selected") !== "true") following.click();
}

// Re-arm the nudge whenever the SPA navigates to a different route.
function trackRouteForFollowing() {
  if (location.pathname === _lastPath) return;
  _lastPath = location.pathname;
  _followingDone = false;
}

function applyDim() {
  // Hard invariant rather than trusting every call site: while Dim is off,
  // nothing may paint it. The observer, the theme sync and the init path all
  // route through here.
  if (!_enabled) return;
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
  for (const el of document.querySelectorAll(".xdm-dimmed, .xdm-dimmed-elevated, .xdm-dimmed-divider, .xdm-dimmed-badge, .xdm-dimmed-text")) {
    el.classList.remove("xdm-dimmed", "xdm-dimmed-elevated", "xdm-dimmed-divider", "xdm-dimmed-badge", "xdm-dimmed-text");
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

// X's theme is X's setting, and we keep no copy of it. X decides light or dark
// before first paint from its night_mode cookie: "0" light, "1"/"2" dark,
// absent = follow the system. The redesigned client also watches the cookie
// and re-themes live. Our storage holds one boolean (enabled = "paint X's dark
// as Dim"); light / dark / follow-system stays in X's Appearance settings.
function xThemeCookie() {
  try {
    const m = document.cookie.match(/(?:^|; )night_mode=([^;]*)/);
    return m ? decodeURIComponent(m[1]) : null;
  } catch { return null; }
}

// What X is about to render, by X's own rule.
function xWouldBeLight() {
  const v = xThemeCookie();
  if (v === "0") return true;
  if (v === "1" || v === "2") return false;
  return !!window.matchMedia && !window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function hasDraft() {
  for (const el of document.querySelectorAll('[contenteditable="true"], textarea')) {
    if ((el.value ?? el.textContent ?? "").trim()) return true;
  }
  return false;
}

// "Turn Dim on" means X looks Dim now, so when X is (or is about to be) light
// this puts X in dark, once, at the moment the person asked for Dim: first run
// after install, the popup switch, the popup's "Switch to Dim". Never on a
// plain page load: someone who picks Light or "Use system setting" in X
// afterwards has made a choice, and Dim waits for X to go dark.
let _forceTimer = 0;
function forceXDark() {
  if (!xWouldBeLight()) return;
  // Appearance panel open: go through X's own radio so its UI stays in step.
  activateLightsOut();
  const host = location.hostname.split(".").slice(-2).join(".");
  try {
    document.cookie = `night_mode=2; path=/; domain=.${host}; max-age=31536000; secure`;
  } catch { return; }
  // The redesign picks the cookie up by itself. The older client reads it only
  // at load, so if X is still light after a moment, reload once: a visible
  // tab, nothing being written, and never twice in a session.
  clearTimeout(_forceTimer);
  _forceTimer = setTimeout(() => {
    if (!_enabled || isXDark() !== false) return;
    if (document.visibilityState !== "visible" || hasDraft()) return;
    try {
      if (sessionStorage.getItem("__xdm_forced")) return;
      sessionStorage.setItem("__xdm_forced", "1");
    } catch { return; }
    location.reload();
  }, 2000);
}

function takePendingDark() {
  chrome.storage.local.remove("pendingDark");
  if (_enabled) forceXDark();
}

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
  syncSettingsButtons(true);
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

// Pure neutral grey, as X's jetfuel framework (Creator Studio) hard-codes it:
// "rgb(115, 115, 115)" or "rgba(115, 115, 115, 1)". Returns the channel or -1.
function neutralChannel(c) {
  const m = /^rgba?\((\d+), (\d+), (\d+)(?:, ([\d.]+))?\)$/.exec(c || "");
  if (!m || (m[4] !== undefined && +m[4] < 0.5)) return -1;
  const r = +m[1], g = +m[2], b = +m[3];
  return Math.max(r, g, b) - Math.min(r, g, b) <= 2 ? r : -1;
}

function dimElement(el) {
  if (!el || el.nodeType !== 1) return;
  const jf = el.classList.contains("jf-element");
  const cs = jf ? (() => { try { return getComputedStyle(el); } catch { return null; } })() : null;
  // Jetfuel text greys (Creator Studio subtitles, #737373 and friends) have
  // no token and a hashed class, so the computed colour is the only signal.
  if (cs && !el.classList.contains("xdm-dimmed-text")) {
    const t = neutralChannel(cs.color);
    if (t >= 80 && t <= 200) el.classList.add("xdm-dimmed-text");
  }
  if (el.classList.contains("xdm-dimmed") || el.classList.contains("xdm-dimmed-elevated") ||
      el.classList.contains("xdm-dimmed-divider")) return;
  const bg = cs ? cs.backgroundColor : el.style.backgroundColor;
  // rgb(23,23,23): jetfuel modal surface (Original Content Rewards "?" dialog)
  if (bg === "rgb(0, 0, 0)" || bg === "rgba(0, 0, 0, 1)" || bg === "rgb(20, 20, 20)" ||
      (jf && bg === "rgb(23, 23, 23)")) {
    el.classList.add("xdm-dimmed");
  } else if (bg === "rgb(24, 24, 27)") {
    el.classList.add("xdm-dimmed-elevated");
  } else if (jf && neutralChannel(bg) >= 30 && neutralChannel(bg) <= 60) {
    // #262626-ish: an empty one is a divider line, one with content is a
    // filled badge ("Retired" on Revenue Sharing).
    el.classList.add(el.childElementCount || el.textContent.trim() ? "xdm-dimmed-badge" : "xdm-dimmed-divider");
  }
}

// ── Display Settings Injection ─────────────────────────────────────

// Built as DOM rather than an innerHTML string: the markup is static, but
// addons-linter flags every innerHTML write and flagged code buys a manual
// review pass on every AMO submission.
const SVG_NS = "http://www.w3.org/2000/svg";
const CHECKMARK_CLASS =
  "r-4qtqp9 r-yyyyoo r-dnmrzs r-bnwqim r-lrvibr r-m6rgpd r-jwli3a r-1hjwoze r-12ym1je";
const CHECKMARK_PATH =
  "M9.64 18.952l-5.55-4.861 1.317-1.504 3.951 3.459 8.459-10.948L19.4 6.32 9.64 18.952z";

function makeCheckmark() {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("class", CHECKMARK_CLASS);
  const g = document.createElementNS(SVG_NS, "g");
  const path = document.createElementNS(SVG_NS, "path");
  path.setAttribute("d", CHECKMARK_PATH);
  g.appendChild(path);
  svg.appendChild(g);
  return svg;
}

function setSelected(btnEl) {
  btnEl.style.borderColor = "rgb(29, 155, 240)";
  btnEl.style.borderWidth = "2px";
  const circle = btnEl.querySelector('[role="radio"] > div');
  if (circle) {
    circle.style.backgroundColor = "rgb(29, 155, 240)";
    circle.style.borderColor = "rgb(29, 155, 240)";
    circle.replaceChildren(makeCheckmark());
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

// ── Appearance panel (Nov 2026 redesign) ──
// Settings became a modal whose Background group is Light / Dark / Use system
// setting: Base UI radios, each a row of label + span[role=radio] + a hidden
// input whose value (light|dark|system) is the only language-independent
// signal. Dim goes back in as a fourth row between Light and Dark, the order
// classic Twitter used, cloned from X's own Dark row so it looks native.

function findBackgroundGroup() {
  const dark = document.querySelector('[role="radiogroup"] input[type="radio"][value="dark"]');
  const group = dark && dark.closest('[role="radiogroup"]');
  if (!group || !group.querySelector('input[type="radio"][value="light"]')) return null;
  return { group, dark };
}

// The child of `group` that holds `el`, whatever wraps it.
function rowIn(group, el) {
  let n = el;
  while (n && n.parentElement !== group) n = n.parentElement;
  return n;
}

function setRadioChecked(radio, on) {
  if (!radio) return;
  radio.setAttribute("aria-checked", on ? "true" : "false");
  radio.toggleAttribute("data-checked", on);
  radio.toggleAttribute("data-unchecked", !on);
}

// Dim's row stands in for X's Dark while Dim is on. Light and "Use system
// setting" stay X's own rows, checked exactly as X has them: with Dim on,
// "Use system setting" simply means light by day and Dim at night.
function syncDimRow(enabled) {
  const row = document.getElementById(DIM_BTN_ID);
  if (!row || !row.hasAttribute("data-xdm-row")) return false;
  const group = row.closest('[role="radiogroup"]');
  if (!group) return true;
  const inputs = [...group.querySelectorAll('input[type="radio"]')];
  const picked = inputs.find((i) => i.checked);
  const dimPicked = !!enabled && !!picked && picked.value === "dark";
  setRadioChecked(row.querySelector('[role="radio"]'), dimPicked);
  for (const input of inputs) {
    const r = rowIn(group, input);
    setRadioChecked(r && r.querySelector('[role="radio"]'),
      input.checked && !(dimPicked && input.value === "dark"));
  }
  return true;
}

function tryInjectDimRow() {
  if (document.getElementById(DIM_BTN_ID)) return true;
  const bg = findBackgroundGroup();
  if (!bg) return false;
  const { group } = bg;
  const darkRow = rowIn(group, bg.dark);
  if (!darkRow) return false;

  const row = darkRow.cloneNode(true);
  row.id = DIM_BTN_ID;
  row.setAttribute("data-xdm-row", "");
  // Cut every tie to X's wiring: the label's for= would select Dark, and the
  // hidden input would join X's form state.
  for (const el of row.querySelectorAll("[id]")) el.removeAttribute("id");
  row.querySelector("label")?.removeAttribute("for");
  row.querySelector("input")?.remove();
  const radio = row.querySelector('[role="radio"]');
  const name = chrome.i18n.getMessage("dimLabel");
  if (radio) {
    radio.removeAttribute("aria-labelledby");
    radio.removeAttribute("data-composite-item-active");
    radio.setAttribute("aria-label", name);
    radio.setAttribute("tabindex", "0");
  }
  const label = [...row.querySelectorAll("label span, label")].find(
    (el) => !el.children.length && el.textContent.trim()
  );
  if (label) label.textContent = name;

  group.insertBefore(row, darkRow);

  row.addEventListener("click", (e) => {
    e.preventDefault();
    setSettings({ enabled: true });
    // The onChanged handler does the same; doing it here too makes the click
    // feel instant instead of waiting on the storage round trip.
    _enabled = true;
    activateLightsOut();
    syncSettingsButtons(true);
  });
  row.addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "Enter") { e.preventDefault(); row.click(); }
  });

  // Only X's Dark row turns Dim off: it is the one choice that means "black,
  // not Dim". Light and "Use system setting" leave Dim on, waiting for X to go
  // dark. Capture phase, so it runs before X re-renders.
  group.addEventListener("click", (e) => {
    if (_switchingToDim || row.contains(e.target)) return;
    const own = rowIn(group, e.target);
    const input = own && own.querySelector('input[type="radio"]');
    if (!input) return;
    if (input.value === "dark") {
      setSettings({ enabled: false });
      _enabled = false;
    }
    // X re-renders its radios after the click; re-assert ours after it.
    for (const ms of [0, 50, 300]) setTimeout(() => syncDimRow(_enabled), ms);
  }, true);

  getSettings(({ enabled }) => syncSettingsButtons(!!enabled));
  return true;
}

function tryInjectDimOption() {
  if (document.getElementById(DIM_BTN_ID)) return;
  if (tryInjectDimRow()) return;

  // Legacy picker: find it by its radio inputs (language-independent)
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

  // Lights Out is the one choice that means "black, not Dim", so only it
  // turns Dim off. Default (light) leaves Dim on, waiting for X to go dark.
  lightsOutBtn.addEventListener("click", () => {
    if (_switchingToDim) return; // Ignore clicks triggered by dim switch
    setSettings({ enabled: false });
    setUnselected(dimBtn);
  });
  defaultBtn.addEventListener("click", () => setUnselected(dimBtn));
}

// ── Lights Out Helper ──────────────────────────────────────────────
// Clicks X's Lights Out radio (if the Display settings page is open) to ensure
// the correct base theme. Used by both the Dim button and the popup toggle.

let _switchingToDim = false;

function activateLightsOut() {
  const dimBtn = document.getElementById(DIM_BTN_ID);
  if (!dimBtn) return; // Settings page not open
  if (dimBtn.hasAttribute("data-xdm-row")) {
    // Appearance panel: select X's Dark. Base UI listens on the role=radio span.
    const bg = findBackgroundGroup();
    if (!bg || bg.dark.checked) return;
    const darkRadio = rowIn(bg.group, bg.dark)?.querySelector('[role="radio"]');
    _switchingToDim = true;
    (darkRadio || bg.dark).click();
    _switchingToDim = false;
    // X re-renders its radios after the switch; re-assert Dim's row after it.
    for (const ms of [50, 300]) setTimeout(() => syncSettingsButtons(_enabled), ms);
    return;
  }
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
      // Put Copy link first in any share menu that just opened
      if (_copyLinkFirst) {
        for (const m of mutations) {
          for (const n of m.addedNodes) {
            if (n.nodeType === 1) hoistCopyLink(n);
          }
        }
      }
      // Re-arm + apply the Following-tab nudge on SPA route changes
      trackRouteForFollowing();
      tryDefaultFollowing();
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
getSettings(({ enabled, theme, customHue, birdLogo, oldFont, classicFavicon, tweetWording, followingTab, imageGrid, copyLinkFirst, buttonColor, buttonHex, hideGrok, hiddenNav }) => {
  _theme = theme ?? "dim";
  _customHue = customHue ?? 210;
  _birdLogo = !!birdLogo;
  _oldFont = !!oldFont;
  _classicFavicon = !!classicFavicon;
  _tweetWording = !!tweetWording;
  _followingTab = !!followingTab;
  _imageGrid = !!imageGrid;
  _copyLinkFirst = !!copyLinkFirst;
  _buttonColor = buttonColor || "white";
  _buttonHex = buttonHex || "";
  _hideGrok = !!hideGrok;

  if (enabled === undefined) {
    // Genuinely first run — unless this device already recorded "off", in
    // which case respect it rather than silently switching Dim back on.
    const cached = (() => { try { return localStorage.getItem("__xdm_enabled"); } catch { return null; } })();
    _enabled = cached !== "0";
    setSettings({ enabled: _enabled });
    // Just installed: X should come up Dim even if it was on Light, which is
    // otherwise indistinguishable from the extension not working.
    if (_enabled) forceXDark();
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

  // The popup asked for Dim while no X tab was listening.
  chrome.storage.local.get(["pendingDark"], (d) => { if (d && d.pendingDark) takePendingDark(); });

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

  // Apply classic image grid if enabled
  if (_imageGrid) applyImageGrid();
  if (_copyLinkFirst) applyCopyLinkFirst();
  if (_hideGrok) applyHideGrok();
  applyHiddenNav(hiddenNav);

  // Apply button color if set
  applyButtonColor();

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

  // Nudge to the Following tab if enabled (timeline may render late)
  if (_followingTab) {
    tryDefaultFollowing();
    for (const ms of [500, 1500, 3000]) setTimeout(tryDefaultFollowing, ms);
  }

  // Apply Post→Tweet wording if enabled
  if (_tweetWording) {
    applyTweetWording(document, false);
    for (const ms of [500, 1500, 3000]) setTimeout(() => { if (_tweetWording) applyTweetWording(document, false); }, ms);
    startWordingInterval();
  }
});

// The popup asks whether Dim is on but standing down because X is in Light
// mode. Nothing else says so, and from the outside it looks exactly like Dim
// being broken.
chrome.runtime?.onMessage?.addListener((msg, _sender, reply) => {
  if (msg && msg.type === "xdm:status") reply({ xLight: _enabled && isXDark() === false });
});

// Sync the radio buttons on the Display settings page with the current state
function syncSettingsButtons(enabled) {
  const dimBtn = document.getElementById(DIM_BTN_ID);
  if (!dimBtn) return;
  if (syncDimRow(!!enabled)) return;
  const radiogroup = dimBtn.closest('[role="radiogroup"]');
  if (!radiogroup) return;
  const allBtns = radiogroup.querySelectorAll(":scope > div");
  const lightsOutBtn = allBtns[allBtns.length - 1];

  if (enabled && isXDark() !== false) {
    setSelected(dimBtn);
    for (const btn of allBtns) {
      if (btn !== dimBtn) setUnselected(btn);
    }
  } else {
    setUnselected(dimBtn);
    const native = isXDark() === false ? allBtns[0] : lightsOutBtn;
    if (native && native !== dimBtn) setSelected(native);
  }
}

// Update the settings page Dim button preview color
function updateSettingsButtonColor() {
  const dimBtn = document.getElementById(DIM_BTN_ID);
  // The Appearance panel's rows are plain list rows, with no swatch to tint.
  if (!dimBtn || dimBtn.hasAttribute("data-xdm-row")) return;
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
  // Now that local wins reads, a change arriving from another device has to be
  // written through to local, otherwise the next read would undo it.
  if (area === "sync") {
    const mirror = {};
    for (const k of SETTING_KEYS) {
      if (changes[k] && changes[k].newValue !== undefined) mirror[k] = changes[k].newValue;
    }
    if (Object.keys(mirror).length) chrome.storage.local.set(mirror);
  }
  if (changes.enabled) {
    _enabled = !!changes.enabled.newValue;
    try { localStorage.setItem("__xdm_enabled", _enabled ? "1" : "0"); } catch (e) {}
    if (_enabled) {
      _suspendedForLight = false;
      startBodyObserver();
      // If X's settings are open, select its dark base there. Putting a light
      // X in dark otherwise is forceXDark's job, and only when the person asked
      // for Dim on this device (pendingDark); a change that merely synced in
      // leaves X's theme alone and Dim waits for X to go dark.
      activateLightsOut();
      syncDimWithTheme();
    } else {
      stopBodyObserver();
      removeDim();
    }
    syncSettingsButtons(_enabled);
  }
  // After the enabled block on purpose: one write may carry both.
  if (area === "local" && changes.pendingDark && changes.pendingDark.newValue) takePendingDark();
  if (changes.theme || changes.customHue) {
    if (changes.theme) _theme = changes.theme.newValue ?? "dim";
    if (changes.customHue) _customHue = changes.customHue.newValue ?? 210;
    ensureBaseCSS();
    syncThemeColor();
    updateSettingsButtonColor();
    applyButtonColor();
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
  if (changes.imageGrid) {
    _imageGrid = !!changes.imageGrid.newValue;
    if (_imageGrid) applyImageGrid();
    else removeImageGrid();
  }
  if (changes.copyLinkFirst) {
    _copyLinkFirst = !!changes.copyLinkFirst.newValue;
    if (_copyLinkFirst) applyCopyLinkFirst();
    else removeCopyLinkFirst();
  }
  if (changes.buttonColor || changes.buttonHex) {
    if (changes.buttonColor) _buttonColor = changes.buttonColor.newValue || "white";
    if (changes.buttonHex) _buttonHex = changes.buttonHex.newValue || "";
    applyButtonColor();
  }
  if (changes.hideGrok) {
    _hideGrok = !!changes.hideGrok.newValue;
    if (_hideGrok) applyHideGrok();
    else removeHideGrok();
  }
  if (changes.hiddenNav) applyHiddenNav(changes.hiddenNav.newValue);
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
  if (changes.followingTab) {
    _followingTab = !!changes.followingTab.newValue;
    // Turning it on should take effect immediately, not on the next navigation.
    if (_followingTab) { _followingDone = false; tryDefaultFollowing(); }
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
