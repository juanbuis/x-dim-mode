// Uninstall survey
chrome.runtime.setUninstallURL("https://docs.google.com/forms/d/e/1FAIpQLSewJf4DzNQpDiemgLskxtiTr8v8jGsRnf2TElorW2gLvkuagg/viewform");

// Open welcome/update page
chrome.runtime.onInstalled.addListener(({ reason, previousVersion }) => {
  const v = chrome.runtime.getManifest().version;

  if (reason === "install") {
    chrome.storage.local.set({ installTimestamp: Date.now() });
    const params = new URLSearchParams({ v, reason });
    chrome.tabs.create({ url: chrome.runtime.getURL(`welcome.html?${params}`) });
  } else if (reason === "update") {
    // Set installTimestamp for existing users so engagement prompt starts from update
    chrome.storage.local.get("installTimestamp", ({ installTimestamp }) => {
      if (!installTimestamp) chrome.storage.local.set({ installTimestamp: Date.now() });
    });

    // Only show update page for major versions (2.0, 3.0, etc.) or 1.3.0
    const major = v.split(".")[0];
    const isMajorBump = previousVersion && major !== previousVersion.split(".")[0];
    const is130 = v === "1.3.0";

    if (isMajorBump || is130) {
      const params = new URLSearchParams({ v, reason });
      params.set("from", previousVersion);
      chrome.tabs.create({ url: chrome.runtime.getURL(`welcome.html?${params}`) });
    }
  }
});
