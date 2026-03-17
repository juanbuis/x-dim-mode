const birdToggle = document.getElementById("birdToggle");

// i18n
document.getElementById("backLabel").textContent = chrome.i18n.getMessage("extName");
document.getElementById("extrasTitle").textContent = chrome.i18n.getMessage("extras");
document.getElementById("birdLabel").textContent = chrome.i18n.getMessage("birdLogo");

// Load state
chrome.storage.local.get(["birdLogo"], ({ birdLogo }) => {
  birdToggle.checked = !!birdLogo;
});

birdToggle.addEventListener("change", () => {
  chrome.storage.local.set({ birdLogo: birdToggle.checked });
});
