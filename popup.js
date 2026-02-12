const toggle = document.getElementById("toggle");
const dot = document.getElementById("dot");

chrome.storage.local.get("enabled", ({ enabled }) => {
  toggle.checked = !!enabled;
  dot.classList.toggle("active", !!enabled);
});

toggle.addEventListener("change", () => {
  const enabled = toggle.checked;
  chrome.storage.local.set({ enabled });
  dot.classList.toggle("active", enabled);
});
