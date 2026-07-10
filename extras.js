const birdToggle = document.getElementById("birdToggle");

// i18n
document.getElementById("backLabel").textContent = chrome.i18n.getMessage("extName");
document.getElementById("extrasTitle").textContent = chrome.i18n.getMessage("extras");
document.getElementById("birdLabel").textContent = chrome.i18n.getMessage("birdLogo");

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
chrome.storage.sync.get(["birdLogo"], (syncVals) => {
  chrome.storage.local.get(["birdLogo"], (localVals) => {
    const birdLogo = syncVals.birdLogo !== undefined ? syncVals.birdLogo : localVals.birdLogo;
    birdToggle.checked = !!birdLogo;
  });
});

birdToggle.addEventListener("change", () => {
  const obj = { birdLogo: birdToggle.checked };
  chrome.storage.sync.set(obj, () => void chrome.runtime.lastError);
  chrome.storage.local.set(obj);
});
