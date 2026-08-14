// Uninstall survey
chrome.runtime.setUninstallURL("https://docs.google.com/forms/d/e/1FAIpQLSewJf4DzNQpDiemgLskxtiTr8v8jGsRnf2TElorW2gLvkuagg/viewform");

// Open welcome/update page
chrome.runtime.onInstalled.addListener(({ reason, previousVersion }) => {
  const v = chrome.runtime.getManifest().version;

  // One-time settings migration: local → sync (existing sync values win).
  // Idempotent — safe to run on every install/update event.
  const SETTING_KEYS = ["enabled", "theme", "customHue", "birdLogo"];
  chrome.storage.sync.get(SETTING_KEYS, (syncVals) => {
    chrome.storage.local.get(SETTING_KEYS, (localVals) => {
      const toSync = {};
      for (const k of SETTING_KEYS) {
        if (syncVals[k] === undefined && localVals[k] !== undefined) toSync[k] = localVals[k];
      }
      if (Object.keys(toSync).length) {
        chrome.storage.sync.set(toSync, () => void chrome.runtime.lastError);
      }
    });
  });

  // Legacy email-prompt dismissal (boolean, pre-1.5.0) → timestamped, so the
  // 60-day re-prompt clock starts at this update rather than immediately.
  chrome.storage.local.get(["emailPromptDismissed", "emailPromptDismissedAt"], (d) => {
    if (d.emailPromptDismissed && !d.emailPromptDismissedAt) {
      chrome.storage.local.set({ emailPromptDismissedAt: Date.now() });
    }
  });

  if (reason === "install") {
    chrome.storage.local.set({ installTimestamp: Date.now() });
    const params = new URLSearchParams({ v, reason });
    chrome.tabs.create({ url: chrome.runtime.getURL(`welcome.html?${params}`) });
  } else if (reason === "update") {
    // Set installTimestamp for existing users so engagement prompt starts from update
    chrome.storage.local.get("installTimestamp", ({ installTimestamp }) => {
      if (!installTimestamp) chrome.storage.local.set({ installTimestamp: Date.now() });
    });

    // Show update page for major versions (2.0, 3.0, etc.) or specific releases
    // with notes worth surfacing.
    const major = v.split(".")[0];
    const isMajorBump = previousVersion && major !== previousVersion.split(".")[0];
    const SHOW_UPDATE_PAGE_FOR = ["1.3.0", "1.5.0", "1.6.0", "1.6.1", "1.7.0"];

    if (isMajorBump || SHOW_UPDATE_PAGE_FOR.includes(v)) {
      const params = new URLSearchParams({ v, reason });
      if (previousVersion && /^\d+\.\d+/.test(previousVersion)) params.set("from", previousVersion);
      chrome.tabs.create({ url: chrome.runtime.getURL(`welcome.html?${params}`) });
    }
  }
});
