// Arabic is the one RTL locale we ship; Chrome does not set direction on
// extension pages automatically, so do it from the locale.
document.documentElement.dir = chrome.i18n.getMessage("@@bidi_dir");

const birdToggle = document.getElementById("birdToggle");
const tweetWordingToggle = document.getElementById("tweetWordingToggle");
const faviconToggle = document.getElementById("faviconToggle");
const oldFontToggle = document.getElementById("oldFontToggle");
const followingTabToggle = document.getElementById("followingTabToggle");
const imageGridToggle = document.getElementById("imageGridToggle");
const copyLinkFirstToggle = document.getElementById("copyLinkFirstToggle");
const hideGrokToggle = document.getElementById("hideGrokToggle");

// i18n
document.getElementById("backLabel").textContent = chrome.i18n.getMessage("appName");
document.getElementById("extrasTitle").textContent = chrome.i18n.getMessage("extras");
document.getElementById("birdLabel").textContent = chrome.i18n.getMessage("birdLogo");
document.getElementById("tweetWordingLabel").textContent = chrome.i18n.getMessage("tweetWording");
document.getElementById("faviconLabel").textContent = chrome.i18n.getMessage("classicFavicon");
document.getElementById("oldFontLabel").textContent = chrome.i18n.getMessage("oldFont");
document.getElementById("followingTabLabel").textContent = chrome.i18n.getMessage("followingTab");
document.getElementById("imageGridLabel").textContent = chrome.i18n.getMessage("imageGrid");
document.getElementById("copyLinkFirstLabel").textContent = chrome.i18n.getMessage("copyLinkFirst");
document.getElementById("buttonColorLabel").textContent = chrome.i18n.getMessage("buttonColor");
document.getElementById("groupLookLabel").textContent = chrome.i18n.getMessage("groupLook");
document.getElementById("groupTimelineLabel").textContent = chrome.i18n.getMessage("groupTimeline");
document.getElementById("groupDeclutterLabel").textContent = chrome.i18n.getMessage("groupDeclutter");
document.getElementById("hideGrokLabel").textContent = chrome.i18n.getMessage("hideGrok");
document.getElementById("sidebarLabel").textContent = chrome.i18n.getMessage("sidebarItems");

// Footer: report + review only. Follow and Share live in the popup's footer;
// repeating them here pushed the list past the popup's height.
const rateLink = document.getElementById("rateLink");
rateLink.textContent = chrome.i18n.getMessage("engageRate");
rateLink.href = RATE_URL;

// Report-a-problem link (same prefilled mailto as the popup footer)
const reportLink = document.getElementById("reportLink");
reportLink.textContent = chrome.i18n.getMessage("reportProblem");
{
  const v = chrome.runtime.getManifest().version;
  const subject = encodeURIComponent(`Dim Mode ${v} — problem report`);
  const body = encodeURIComponent(
    `What looks wrong?\n\n\nWhere on X (page or section):\n\n\n---\nVersion: ${v}\nBrowser: ${navigator.userAgent}`
  );
  reportLink.href = `mailto:yo@juanbuis.com?subject=${subject}&body=${body}`;
}

// Load state (sync preferred, local fallback — mirrors helpers in popup.js)
const EXTRA_KEYS = ["birdLogo", "tweetWording", "classicFavicon", "oldFont", "followingTab", "imageGrid", "copyLinkFirst", "hideGrok"];
const TOGGLES = {
  birdLogo: birdToggle,
  tweetWording: tweetWordingToggle,
  classicFavicon: faviconToggle,
  oldFont: oldFontToggle,
  followingTab: followingTabToggle,
  imageGrid: imageGridToggle,
  copyLinkFirst: copyLinkFirstToggle,
  hideGrok: hideGrokToggle,
};

// Sidebar items are chosen on their own page (sidebar.html); here they only
// count toward noteDelight.
let _hiddenNav = [];
chrome.storage.sync.get(["hiddenNav"], (syncVals) => {
  chrome.storage.local.get(["hiddenNav"], (localVals) => {
    _hiddenNav = localVals.hiddenNav !== undefined ? localVals.hiddenNav : (syncVals.hiddenNav || []);
  });
});

chrome.storage.sync.get(EXTRA_KEYS, (syncVals) => {
  chrome.storage.local.get(EXTRA_KEYS, (localVals) => {
    for (const key of EXTRA_KEYS) {
      // Local first, as content.js reads it, so a toggle never shows a state
      // the page isn't using.
      const val = localVals[key] !== undefined ? localVals[key] : syncVals[key];
      TOGGLES[key].checked = !!val;
    }
  });
});

for (const key of EXTRA_KEYS) {
  TOGGLES[key].addEventListener("change", () => {
    const obj = { [key]: TOGGLES[key].checked };
    chrome.storage.sync.set(obj, () => void chrome.runtime.lastError);
    chrome.storage.local.set(obj);
    if (TOGGLES[key].checked) noteDelight();
  });
}

// Someone who has switched on a second Extra has gone looking for more of the
// product and liked what they found — a far better moment to ask for a review
// than an arbitrary day-14 timer, which most people are not in the popup for.
// Recorded here; the prompt itself is shown by popup.js on the way back.
function noteDelight() {
  const on = EXTRA_KEYS.filter((k) => TOGGLES[k].checked).length + (_buttonColor !== "white" ? 1 : 0) +
    (_hiddenNav.length ? 1 : 0);
  if (on < 2) return;
  chrome.storage.local.get(["extrasDelightAt"], (d) => {
    if (d.extrasDelightAt) return;               // only ever the first time
    chrome.storage.local.set({ extrasDelightAt: Date.now() });
  });
}

// ── Button color ───────────────────────────────────────────────
// White, a match for the current theme, or a custom color, picked the way themes
// are in the popup. The slider covers quick picks; the hex field is for an exact color.
const swatches = [...document.querySelectorAll(".swatch")];
const swatchTheme = document.getElementById("swatchTheme");
const swatchCustom = document.getElementById("swatchCustom");
const colorWrap = document.getElementById("colorWrap");
const buttonHue = document.getElementById("buttonHue");
const buttonHexInput = document.getElementById("buttonHex");
const RAINBOW = "conic-gradient(#f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)";
const DEFAULT_BUTTON_HEX = "#ff5500";

document.getElementById("swatchWhite").title = chrome.i18n.getMessage("buttonColorWhite");
swatchTheme.title = chrome.i18n.getMessage("buttonColorTheme");
swatchCustom.title = chrome.i18n.getMessage("buttonColorCustom");
for (const s of swatches) s.setAttribute("aria-label", s.title);

let _buttonColor = "white";

function hueToHex(h) {
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const v = 0.5 - 0.5 * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(v * 255).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function hexToHue(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const max = Math.max(r, g, b);
  const d = max - Math.min(r, g, b);
  if (!d) return 0;
  const h = max === r ? (g - b) / d + 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return Math.round((h % 6) * 60);
}

function normalizeHex(value) {
  const v = value.trim().replace(/^#/, "").toLowerCase();
  if (/^[0-9a-f]{6}$/.test(v)) return `#${v}`;
  if (/^[0-9a-f]{3}$/.test(v)) return `#${[...v].map((c) => c + c).join("")}`;
  return null;
}

function showButtonColor(choice, hex) {
  _buttonColor = choice;
  for (const s of swatches) s.classList.toggle("active", s.dataset.color === choice);
  swatchCustom.style.background = choice === "custom" ? hex : RAINBOW;
  colorWrap.classList.toggle("open", choice === "custom");
}

function saveButtonColor(obj) {
  chrome.storage.sync.set(obj, () => void chrome.runtime.lastError);
  chrome.storage.local.set(obj);
  noteDelight();
}

// Duplicated from content.js (separate contexts), for the "Match theme" dot.
const THEME_BUTTONS = { dim: "#1d9bf0", slate: "#eff3f4", jade: "#00ba7c", plum: "#7856ff", dusk: "#f91880", ember: "#ff7a00" };

function showThemeSwatch(theme, customHue) {
  swatchTheme.style.background = theme === "custom"
    ? `hsl(${customHue ?? 210}, 88%, 53%)`
    : THEME_BUTTONS[theme] || THEME_BUTTONS.dim;
}

const BUTTON_KEYS = ["buttonColor", "buttonHex", "theme", "customHue"];
chrome.storage.sync.get(BUTTON_KEYS, (syncVals) => {
  chrome.storage.local.get(BUTTON_KEYS, (localVals) => {
    const hex = localVals.buttonHex ?? syncVals.buttonHex ?? DEFAULT_BUTTON_HEX;
    buttonHexInput.value = hex;
    buttonHue.value = hexToHue(hex);
    showThemeSwatch(localVals.theme ?? syncVals.theme, localVals.customHue ?? syncVals.customHue);
    showButtonColor(localVals.buttonColor ?? syncVals.buttonColor ?? "white", hex);
  });
});

for (const s of swatches) {
  s.addEventListener("click", () => {
    const hex = normalizeHex(buttonHexInput.value) || DEFAULT_BUTTON_HEX;
    showButtonColor(s.dataset.color, hex);
    saveButtonColor(s.dataset.color === "custom"
      ? { buttonColor: "custom", buttonHex: hex }
      : { buttonColor: s.dataset.color });
  });
}

// Same pattern as the popup's hue slider: live ticks to local only, because
// writing each one to sync would blow through its write quota.
let _buttonSyncTimer = 0;
buttonHue.addEventListener("input", () => {
  const hex = hueToHex(+buttonHue.value);
  buttonHexInput.value = hex;
  buttonHexInput.classList.remove("invalid");
  showButtonColor("custom", hex);
  chrome.storage.local.set({ buttonColor: "custom", buttonHex: hex });
  clearTimeout(_buttonSyncTimer);
  _buttonSyncTimer = setTimeout(() => saveButtonColor({ buttonColor: "custom", buttonHex: hex }), 400);
});

buttonHexInput.addEventListener("input", () => {
  const hex = normalizeHex(buttonHexInput.value);
  buttonHexInput.classList.toggle("invalid", !hex && buttonHexInput.value.trim() !== "");
  if (!hex) return;
  buttonHue.value = hexToHue(hex);
  showButtonColor("custom", hex);
  saveButtonColor({ buttonColor: "custom", buttonHex: hex });
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local" || !(changes.theme || changes.customHue)) return;
  chrome.storage.local.get(["theme", "customHue"], (d) => showThemeSwatch(d.theme, d.customHue));
});
