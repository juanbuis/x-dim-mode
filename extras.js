const birdToggle = document.getElementById("birdToggle");
const tweetWordingToggle = document.getElementById("tweetWordingToggle");
const faviconToggle = document.getElementById("faviconToggle");
const oldFontToggle = document.getElementById("oldFontToggle");

// i18n
document.getElementById("backLabel").textContent = chrome.i18n.getMessage("extName");
document.getElementById("extrasTitle").textContent = chrome.i18n.getMessage("extras");
document.getElementById("birdLabel").textContent = chrome.i18n.getMessage("birdLogo");
document.getElementById("tweetWordingLabel").textContent = chrome.i18n.getMessage("tweetWording");
document.getElementById("faviconLabel").textContent = chrome.i18n.getMessage("classicFavicon");
document.getElementById("oldFontLabel").textContent = chrome.i18n.getMessage("oldFont");

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
const EXTRA_KEYS = ["birdLogo", "tweetWording", "classicFavicon", "oldFont"];
const TOGGLES = {
  birdLogo: birdToggle,
  tweetWording: tweetWordingToggle,
  classicFavicon: faviconToggle,
  oldFont: oldFontToggle,
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
  });
}
