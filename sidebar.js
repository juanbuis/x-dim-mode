// Sidebar page: one row per item in X's sidebar, switch on = shown.
// Stored as hiddenNav (ids to hide); content.js applies it (applyHiddenNav).

document.documentElement.dir = chrome.i18n.getMessage("@@bidi_dir");
const t = (k) => chrome.i18n.getMessage(k);

document.getElementById("backLabel").textContent = t("extras");
document.getElementById("title").textContent = t("sidebarItems");
document.getElementById("hint").textContent = t("sidebarHint");

const NS = "http://www.w3.org/2000/svg";
const list = document.getElementById("list");
const hidden = new Set();

function save() {
  const ids = NAV_ITEMS.filter((i) => !i.noPick && hidden.has(i.id)).map((i) => i.id);
  chrome.storage.sync.set({ hiddenNav: ids }, () => void chrome.runtime.lastError);
  chrome.storage.local.set({ hiddenNav: ids });
}

function render() {
  list.replaceChildren();
  for (const item of NAV_ITEMS) {
    if (item.noPick) continue;
    const id = `nav-${item.id}`;
    const row = document.createElement("div");
    row.className = "toggle-row";

    const label = document.createElement("label");
    label.className = "label";
    label.htmlFor = id;
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    for (const [d, evenodd] of item.paths) {
      const p = document.createElementNS(NS, "path");
      p.setAttribute("d", d);
      if (evenodd) p.setAttribute("fill-rule", "evenodd");
      svg.appendChild(p);
    }
    const name = document.createElement("span");
    name.textContent = t(item.msg);
    label.append(svg, name);

    const toggle = document.createElement("label");
    toggle.className = "toggle";
    const input = document.createElement("input");
    input.type = "checkbox";
    input.id = id;
    input.checked = !hidden.has(item.id);
    input.addEventListener("change", () => {
      if (input.checked) hidden.delete(item.id); else hidden.add(item.id);
      row.classList.toggle("is-off", !input.checked);
      save();
      // Counts as an Extra for the review prompt, as it does on the Extras page.
      if (hidden.size) chrome.storage.local.get(["extrasDelightAt", "hideGrok", "birdLogo", "tweetWording"], (d) => {
        if (!d.extrasDelightAt && (d.hideGrok || d.birdLogo || d.tweetWording)) {
          chrome.storage.local.set({ extrasDelightAt: Date.now() });
        }
      });
    });
    const slider = document.createElement("span");
    slider.className = "slider";
    toggle.append(input, slider);

    row.classList.toggle("is-off", !input.checked);
    row.append(label, toggle);
    list.appendChild(row);
  }
}

// Local first, as content.js reads it.
chrome.storage.sync.get(["hiddenNav"], (syncVals) => {
  chrome.storage.local.get(["hiddenNav"], (localVals) => {
    const ids = localVals.hiddenNav !== undefined ? localVals.hiddenNav : (syncVals.hiddenNav || []);
    for (const id of ids) hidden.add(id);
    render();
  });
});
