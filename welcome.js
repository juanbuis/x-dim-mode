const params = new URLSearchParams(location.search);
const reason = params.get("reason");
const version = params.get("v");

const isUpdate = reason === "update";
const msg = chrome.i18n.getMessage;

// Arabic is the one RTL locale we ship; Chrome does not set direction on
// extension pages automatically, so do it from the locale.
document.documentElement.dir = chrome.i18n.getMessage("@@bidi_dir");

// Close button
document.getElementById("closeBtn").addEventListener("click", () => window.close());

// Version badge
document.getElementById("version").textContent = version ? `v${version}` : "";

// ── Settings (local first, as content.js reads them) ───────────────

const KEYS = ["theme", "customHue", "birdLogo", "tweetWording", "hideGrok", "hiddenNav", "buttonColor", "buttonHex"];

function getSettings(cb) {
  chrome.storage.sync.get(KEYS, (syncVals) => {
    chrome.storage.local.get(KEYS, (localVals) => {
      const merged = {};
      for (const k of KEYS) merged[k] = localVals[k] !== undefined ? localVals[k] : syncVals[k];
      cb(merged);
    });
  });
}

function setSettings(obj) {
  chrome.storage.sync.set(obj, () => void chrome.runtime.lastError);
  chrome.storage.local.set(obj);
}

// ── The mini X ─────────────────────────────────────────────────────
// Colours derived exactly as content.js derives them (paletteFromHue,
// themeButtonColor, buttonTextColor), so the preview is what x.com will show.
// Duplicated because this page and the content script share no code.

const THEMES = {
  dim:   { hue: 210, sat: 34, button: "#1d9bf0", name: "Dim" },
  slate: { hue: 210, sat: 8,  button: null,      name: "Slate" },
  jade:  { hue: 150, sat: 34, button: "#00ba7c", name: "Jade" },
  plum:  { hue: 270, sat: 34, button: "#7856ff", name: "Plum" },
  dusk:  { hue: 330, sat: 34, button: "#f91880", name: "Dusk" },
  ember: { hue: 25,  sat: 34, button: "#ff7a00", name: "Ember" },
};
const X_WHITE = "#EFF3F4";
const DEFAULT_BUTTON_HEX = "#ff5500";
const BIRD_PATH = "M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z";

function hueSat(s) {
  return s.theme === "custom" ? { hue: s.customHue ?? 210, sat: 34 } : (THEMES[s.theme] || THEMES.dim);
}

function themeButtonColor(s) {
  if (s.theme !== "custom") return (THEMES[s.theme] || THEMES.dim).button;
  const h = s.customHue ?? 210;
  const a = 0.88 * 0.47;
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const v = 0.53 - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(v * 255).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function buttonTextColor(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.4 ? "#0F1419" : "#FFFFFF";
}

// Fully saturated colour for a hue, and back: the slider's whole range.
function hueToHex(h) {
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const c = 0.5 - 0.5 * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(c * 255).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function hexToHue(hex) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
  const max = Math.max(r, g, b), d = max - Math.min(r, g, b);
  if (!d) return 0;
  const h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return Math.round((h * 60 + 360) % 360);
}

function customHex(s) {
  return /^#[0-9a-f]{6}$/i.test(s.buttonHex || "") ? s.buttonHex : DEFAULT_BUTTON_HEX;
}

function buttonFill(s) {
  if (s.buttonColor === "theme") return themeButtonColor(s) || X_WHITE;
  if (s.buttonColor === "custom") return customHex(s);
  return X_WHITE;
}

const mock = document.getElementById("mock");
const SVG_NS = "http://www.w3.org/2000/svg";

function renderMock(s) {
  const { hue: h, sat } = hueSat(s);
  const bSat = Math.round(sat * 0.47);
  // The page itself takes the theme too (tokens in welcome.html :root).
  const root = document.documentElement.style;
  root.setProperty("--h", String(h));
  root.setProperty("--s", `${sat}%`);
  root.setProperty("--brand", themeButtonColor(s) || "#1D9BF0");
  mock.style.setProperty("--m-bg", `hsl(${h}, ${sat}%, 13%)`);
  mock.style.setProperty("--m-line", `hsl(${h}, ${bSat}%, 26%)`);
  mock.style.setProperty("--m-fg2", `hsl(${h}, ${Math.round(sat * 0.32)}%, 60%)`);
  mock.style.setProperty("--m-el", `hsl(${h}, ${Math.round(sat * 0.71)}%, 20%)`);
  const fill = buttonFill(s);
  mock.style.setProperty("--m-btn", fill);
  mock.style.setProperty("--m-btn-fg", buttonTextColor(fill));
  mock.classList.toggle("no-grok", !!s.hideGrok);
  const hidden = new Set(s.hiddenNav || []);
  for (const n of mock.querySelectorAll("[data-nav]")) n.classList.toggle("is-hidden", hidden.has(n.dataset.nav));

  const logo = document.getElementById("mockLogo");
  if (s.birdLogo) {
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    const p = document.createElementNS(SVG_NS, "path");
    p.setAttribute("d", BIRD_PATH);
    svg.appendChild(p);
    logo.replaceChildren(svg);
  } else {
    const x = document.createElement("span");
    x.className = "m-x";
    x.textContent = "X";
    logo.replaceChildren(x);
  }
  document.getElementById("mockPost").textContent = msg(s.tweetWording ? "mockTweet" : "mockPost");
  document.getElementById("mockFollow").textContent = msg("mockFollow");
}

function navSvg(item) {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  for (const [d, evenodd] of item.paths) {
    const p = document.createElementNS(SVG_NS, "path");
    p.setAttribute("d", d);
    if (evenodd) p.setAttribute("fill-rule", "evenodd");
    svg.appendChild(p);
  }
  return svg;
}

(function buildMockNav() {
  const rail = document.getElementById("mockNav");
  for (const item of NAV_ITEMS) {
    if (item.bubble) {
      document.getElementById("mockChatBubble").appendChild(navSvg(item));
      continue;
    }
    const span = el("span", "m-ico");
    span.dataset.nav = item.id;
    if (item.id === "grok") span.dataset.grok = "";
    span.appendChild(navSvg(item));
    rail.appendChild(span);
  }
})();

// ── Controls ───────────────────────────────────────────────────────
// Real settings, not a demo: each one writes storage exactly as the popup and
// Extras do, so an open x.com tab changes along with the preview.

const panel = document.getElementById("panel");
let state = {};

function el(tag, cls) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  return e;
}

// A row's words: its name and, under it, one line on what it does (the same
// sentences the Extras info tips use). Without the line the panel was three
// bare names, which undersold what 2.0 adds.
function rowText(label, desc, forId) {
  const wrap = el("div", "row-text");
  const name = el(forId ? "label" : "span", "row-label");
  if (forId) name.htmlFor = forId;
  name.textContent = label;
  wrap.appendChild(name);
  if (desc) {
    const d = el("p", "row-desc");
    d.textContent = desc;
    wrap.appendChild(d);
  }
  return wrap;
}

function switchRow(key, label, desc) {
  const row = el("div", "row");
  const id = `sw-${key}`;
  const text = rowText(label, desc, id);
  const toggle = el("label", "toggle");
  const input = el("input");
  input.type = "checkbox";
  input.id = id;
  input.checked = !!state[key];
  input.addEventListener("change", () => {
    state[key] = input.checked;
    setSettings({ [key]: input.checked });
    renderMock(state);
  });
  toggle.append(input, el("span", "slider"));
  row.append(text, toggle);
  return row;
}

// options: [{ value, title, color }]; color may be a function of state.
function dotsRow(label, options, isActive, pick, desc) {
  const row = el("div", "row");
  const text = rowText(label, desc);
  const dots = el("div", "dots");
  dots.setAttribute("role", "group");
  dots.setAttribute("aria-label", label);
  const buttons = options.map((o) => {
    const b = el("button");
    b.type = "button";
    b.title = o.title;
    b.setAttribute("aria-label", o.title);
    b.addEventListener("click", () => { pick(o.value); refresh(); renderMock(state); });
    dots.appendChild(b);
    return b;
  });
  function refresh() {
    options.forEach((o, i) => {
      buttons[i].style.background = typeof o.color === "function" ? o.color(state) : o.color;
      buttons[i].setAttribute("aria-pressed", String(isActive(o.value)));
    });
  }
  refresh();
  row.refresh = refresh;
  row.append(text, dots);
  return row;
}

function buildInstallPanel() {
  document.getElementById("panelTitle").textContent = msg("welcomeMakeYours");
  const themes = Object.entries(THEMES).map(([value, t]) => ({
    value, title: t.name, color: `hsl(${t.hue}, ${t.sat}%, 28%)`,
  }));
  panel.append(
    dotsRow(msg("themeLabel"), themes, (v) => (state.theme || "dim") === v, (v) => {
      state.theme = v;
      setSettings({ theme: v });
    }),
    switchRow("birdLogo", msg("birdLogo"), msg("tipBird")),
    switchRow("tweetWording", msg("tweetWording"), msg("tipWording")),
    switchRow("hideGrok", msg("hideGrok"), msg("tipHideGrok")),
  );
}

function buildUpdatePanel() {
  document.getElementById("panelTitle").textContent = msg("newIn2");
  const colors = dotsRow(msg("buttonColor"), [
    { value: "white", title: msg("buttonColorWhite"), color: X_WHITE },
    { value: "theme", title: msg("buttonColorTheme"), color: (s) => themeButtonColor(s) || X_WHITE },
    { value: "custom", title: msg("buttonColorCustom"), color: (s) => customHex(s) },
  ], (v) => (state.buttonColor || "white") === v, (v) => {
    state.buttonColor = v;
    const write = { buttonColor: v };
    if (v === "custom" && !state.buttonHex) write.buttonHex = state.buttonHex = DEFAULT_BUTTON_HEX;
    setSettings(write);
    hueRow.hidden = v !== "custom";
  }, msg("tipButtonColor"));

  // Any colour: a hue slider under the dots while Custom is picked. Dragging
  // recolours the preview's buttons live. Ticks go to local only (sync has a
  // write quota); the release commits to both, as the popup's slider does.
  const hueRow = el("div", "row row-sub");
  const hue = el("input", "hue-slider");
  hue.type = "range";
  hue.min = "0";
  hue.max = "360";
  hue.value = String(hexToHue(customHex(state)));
  hue.setAttribute("aria-label", msg("buttonColorCustom"));
  hue.addEventListener("input", () => {
    state.buttonHex = hueToHex(+hue.value);
    chrome.storage.local.set({ buttonColor: "custom", buttonHex: state.buttonHex });
    colors.refresh();
    renderMock(state);
  });
  hue.addEventListener("change", () => setSettings({ buttonColor: "custom", buttonHex: state.buttonHex }));
  hueRow.appendChild(hue);
  hueRow.hidden = (state.buttonColor || "white") !== "custom";
  // Sidebar: X's own icons, tap one to hide it (same control as Extras).
  const side = el("div", "row row-stack");
  side.append(rowText(msg("sidebarItems"), msg("sidebarHint")), buildNavPicker(state.hiddenNav, (list) => {
    state.hiddenNav = list;
    setSettings({ hiddenNav: list });
    renderMock(state);
  }, msg));
  panel.append(colors, hueRow, switchRow("hideGrok", msg("hideGrok"), msg("tipHideGrok")), side);

  // Also in this update: the fixes, short. updateFeatureN is rewritten for
  // each release that shows this screen.
  const also = document.getElementById("also");
  document.getElementById("alsoTitle").textContent = msg("alsoNew");
  const list = document.getElementById("features");
  for (const text of [msg("updateFeature1"), msg("updateFeature2"), msg("updateFeature3")].filter(Boolean)) {
    const li = el("li");
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    const p = document.createElementNS(SVG_NS, "path");
    p.setAttribute("d", "M5 12.5l4.5 4.5L19 7.5");
    p.setAttribute("fill", "none");
    p.setAttribute("stroke", "currentColor");
    p.setAttribute("stroke-width", "2.2");
    p.setAttribute("stroke-linecap", "round");
    p.setAttribute("stroke-linejoin", "round");
    svg.appendChild(p);
    const span = el("span");
    span.textContent = text;
    li.append(svg, span);
    list.appendChild(li);
  }
  also.hidden = !list.children.length;
}

// ── Copy ───────────────────────────────────────────────────────────

const heading = document.getElementById("heading");
const subtitle = document.getElementById("subtitle");
if (isUpdate) {
  heading.textContent = msg("update2Title");
  subtitle.textContent = msg("update2Sub");
} else {
  heading.textContent = msg("welcomeHeadingInstall");
  subtitle.textContent = msg("welcomeSubtitleInstall");
}
document.getElementById("hint").textContent = msg("extrasHint");

getSettings((s) => {
  state = s;
  if (isUpdate) buildUpdatePanel();
  else buildInstallPanel();
  renderMock(state);
  // Let the first paint land before the mock starts animating its changes.
  requestAnimationFrame(() => mock.classList.add("ready"));
});

// Pin hint — install only. On an update the extension is already there, and
// most people have long since decided whether to pin it.
if (!isUpdate) {
  document.getElementById("pinHintTitle").textContent = msg("pinHintTitle");
  document.getElementById("pinHintText").textContent = msg("pinHintText");
  document.getElementById("pinHint").classList.add("show");
  document.body.classList.add("has-pin");
}

// ── Actions ────────────────────────────────────────────────────────
// "Try it now" sits under the preview, as its action: the drawing is a
// preview, x.com is the real thing. Secondary, never primary: a primary one
// used to win the click, send people to x.com, and they never came back to the
// email box.
const actions = document.getElementById("actions");
const tryBtn = el("a", "btn-secondary");
tryBtn.href = "https://x.com";
tryBtn.target = "_blank";
tryBtn.append(msg("tryNow"));
{
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");
  const p = document.createElementNS(SVG_NS, "path");
  p.setAttribute("d", "M5 12h14m-6-6 6 6-6 6");
  p.setAttribute("fill", "none");
  p.setAttribute("stroke", "currentColor");
  p.setAttribute("stroke-width", "2");
  p.setAttribute("stroke-linecap", "round");
  p.setAttribute("stroke-linejoin", "round");
  svg.appendChild(p);
  tryBtn.appendChild(svg);
}
document.getElementById("stageActions").appendChild(tryBtn);

// The update screen is the one surface the whole install base reliably sees,
// which makes it the highest-reach place to ask. Update only: a fresh install
// has nothing to rate yet.
if (isUpdate) {
  const rateBtn = el("a", "btn-secondary");
  rateBtn.href = RATE_URL;
  rateBtn.target = "_blank";
  rateBtn.textContent = msg("engageRate");
  actions.appendChild(rateBtn);
}

// Cross-promo, on both screens: Juan's other projects, as a quiet "same maker"
// note at the very end, after the email box and the buttons. UTM tags (medium
// says which screen) so the click-through is measurable on the other side.
{
  const utm = `utm_source=xdimmode&utm_medium=${isUpdate ? "update" : "install"}&utm_campaign=crosspromo`;
  document.getElementById("promoEyebrow").textContent = msg("promoEyebrow");
  document.getElementById("promoBackglow").href = `https://backglow.app/?${utm}`;
  document.getElementById("promoBackglowDesc").textContent = msg("promoBackglowDesc");
  document.getElementById("promoRecipe").href = `https://recipetables.com/?${utm}`;
  document.getElementById("promoDesc").textContent = msg("promoDesc");
  document.getElementById("promo").classList.add("show");
}

// ── Email ──────────────────────────────────────────────────────────

// Tag which surface the signup came from, so MailerLite can tell the install
// welcome apart from the post-update screen (all touchpoints share one form).
document.getElementById("emailSource").value = isUpdate ? "extension-update" : "extension-welcome";

// Install and update are different moments: a new user needs to know what
// they'd be signing up for; an existing user already has it working and
// cares that it keeps working when X moves things.
const emailLabel = document.getElementById("emailLabel");
const emailStrong = document.createElement("strong");
emailStrong.textContent = msg(isUpdate ? "emailHeadingUpdate" : "emailHeading");
emailLabel.replaceChildren(
  emailStrong,
  document.createTextNode(" " + msg(isUpdate ? "emailSubUpdate" : "emailSubInstall")),
);

document.getElementById("subscribeBtn").textContent = msg("subscribe");
document.getElementById("emailSuccess").textContent = msg("emailSuccess");

const form = document.getElementById("emailForm");
const success = document.getElementById("emailSuccess");
const error = document.getElementById("emailError");

// Hide the email box if this user already subscribed (from the popup or a
// previous welcome page — state roams via storage.sync)
chrome.storage.sync.get(["emailSubscribed"], (syncVals) => {
  chrome.storage.local.get(["emailSubscribed"], (localVals) => {
    const subscribed = syncVals.emailSubscribed !== undefined ? syncVals.emailSubscribed : localVals.emailSubscribed;
    if (subscribed) document.querySelector(".email-section").style.display = "none";
  });
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const btn = form.querySelector("button");
  btn.disabled = true;
  btn.textContent = "...";
  error.style.display = "none";

  const succeed = () => {
    form.style.display = "none";
    success.style.display = "block";
    // Post-subscribe is peak goodwill, and this audience is on X by
    // definition — the follow ask lives here, not in another prompt.
    const follow = document.getElementById("followCta");
    follow.textContent = msg("followCta");
    follow.style.display = "block";
    chrome.storage.local.set({ emailSubscribed: true });
    chrome.storage.sync.set({ emailSubscribed: true }, () => void chrome.runtime.lastError);
  };

  try {
    // The xdim.app proxy returns MailerLite's real verdict (the form endpoint
    // itself has no CORS headers, so it can only be read server-side).
    const res = await fetch("https://xdim.app/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: document.getElementById("emailInput").value.trim(),
        source: document.getElementById("emailSource").value,
      }),
    });
    const data = await res.json();
    if (data.success) {
      succeed();
      return;
    }
    // Proxy reachable and MailerLite said no — almost always a bad address.
    error.textContent = msg("emailInvalid");
    error.style.display = "block";
    btn.disabled = false;
    btn.textContent = msg("subscribe");
  } catch (err) {
    // Proxy unreachable (offline, or xdim.app down): fall back to the direct
    // no-cors post so the signup is never dropped. Opaque response, so assume
    // success — exactly what every version before the proxy did.
    try {
      await fetch(form.action, { method: "POST", body: new FormData(form), mode: "no-cors" });
      succeed();
      return;
    } catch {}
    error.textContent = msg("emailNetworkError");
    error.style.display = "block";
    btn.disabled = false;
    btn.textContent = msg("subscribe");
  }
});
