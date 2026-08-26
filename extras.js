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

// i18n
document.getElementById("backLabel").textContent = chrome.i18n.getMessage("extName");
document.getElementById("extrasTitle").textContent = chrome.i18n.getMessage("extras");
document.getElementById("birdLabel").textContent = chrome.i18n.getMessage("birdLogo");
document.getElementById("tweetWordingLabel").textContent = chrome.i18n.getMessage("tweetWording");
document.getElementById("faviconLabel").textContent = chrome.i18n.getMessage("classicFavicon");
document.getElementById("oldFontLabel").textContent = chrome.i18n.getMessage("oldFont");
document.getElementById("followingTabLabel").textContent = chrome.i18n.getMessage("followingTab");
document.getElementById("imageGridLabel").textContent = chrome.i18n.getMessage("imageGrid");
document.getElementById("copyLinkFirstLabel").textContent = chrome.i18n.getMessage("copyLinkFirst");
document.getElementById("groupLookLabel").textContent = chrome.i18n.getMessage("groupLook");
document.getElementById("groupTimelineLabel").textContent = chrome.i18n.getMessage("groupTimeline");

// Footer: credit + share (mirrors the popup footer — this page gets the most
// engaged users and previously carried no promo at all)
document.getElementById("creditLink").textContent = chrome.i18n.getMessage("credit");
const shareLink = document.getElementById("shareLink");
shareLink.textContent = chrome.i18n.getMessage("popupShareLink");
shareLink.href = "https://x.com/intent/tweet?text=" +
  encodeURIComponent("If you miss X's dark blue theme, X Dim Mode brings it back \u2014 free extension:") +
  "&url=" + encodeURIComponent("https://xdim.app");

// Report-a-problem link (same prefilled mailto as the popup footer)
const reportLink = document.getElementById("reportLink");
reportLink.textContent = chrome.i18n.getMessage("reportProblem");
{
  const v = chrome.runtime.getManifest().version;
  const subject = encodeURIComponent(`X Dim Mode ${v} — problem report`);
  const body = encodeURIComponent(
    `What looks wrong?\n\n\nWhere on X (page or section):\n\n\n---\nVersion: ${v}\nBrowser: ${navigator.userAgent}`
  );
  reportLink.href = `mailto:yo@juanbuis.com?subject=${subject}&body=${body}`;
}

// Load state (sync preferred, local fallback — mirrors helpers in popup.js)
const EXTRA_KEYS = ["birdLogo", "tweetWording", "classicFavicon", "oldFont", "followingTab", "imageGrid", "copyLinkFirst"];
const TOGGLES = {
  birdLogo: birdToggle,
  tweetWording: tweetWordingToggle,
  classicFavicon: faviconToggle,
  oldFont: oldFontToggle,
  followingTab: followingTabToggle,
  imageGrid: imageGridToggle,
  copyLinkFirst: copyLinkFirstToggle,
};

chrome.storage.sync.get(EXTRA_KEYS, (syncVals) => {
  chrome.storage.local.get(EXTRA_KEYS, (localVals) => {
    for (const key of EXTRA_KEYS) {
      const val = syncVals[key] !== undefined ? syncVals[key] : localVals[key];
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
  const on = EXTRA_KEYS.filter((k) => TOGGLES[k].checked).length;
  if (on < 2) return;
  chrome.storage.local.get(["extrasDelightAt"], (d) => {
    if (d.extrasDelightAt) return;               // only ever the first time
    chrome.storage.local.set({ extrasDelightAt: Date.now() });
  });
}
