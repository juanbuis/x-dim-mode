// Info tips: a small "i" after a row's label that explains the row on hover,
// keyboard focus or tap. One shared bubble, placed under the row, or above it
// when there is no room: the popup is exactly as tall as its content, so a
// bubble hanging off the bottom would force a scrollbar.
(() => {
  const bubble = document.createElement("div");
  bubble.className = "tip-bubble";
  bubble.setAttribute("role", "tooltip");
  bubble.hidden = true;
  document.body.appendChild(bubble);

  let current = null;

  function show(btn) {
    current = btn;
    bubble.textContent = btn.getAttribute("aria-label");
    bubble.hidden = false;
    const row = (btn.closest(".toggle-row") || btn).getBoundingClientRect();
    const h = bubble.offsetHeight;
    const below = row.bottom + window.scrollY - 2;
    const fits = below + h <= document.body.offsetHeight - 6;
    bubble.style.top = `${fits ? below : row.top + window.scrollY - h + 2}px`;
  }

  function hide(btn) {
    if (btn && btn !== current) return;
    current = null;
    bubble.hidden = true;
  }

  for (const btn of document.querySelectorAll(".tip[data-tip]")) {
    btn.setAttribute("aria-label", chrome.i18n.getMessage(btn.dataset.tip));
    btn.addEventListener("mouseenter", () => show(btn));
    btn.addEventListener("mouseleave", () => hide(btn));
    btn.addEventListener("focus", () => show(btn));
    btn.addEventListener("blur", () => hide(btn));
    // Touch has no hover: a tap opens it, another tap closes it.
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      if (current === btn && e.detail) hide(btn); else show(btn);
    });
  }
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") hide(); });
})();
