// Size each extension-page iframe to its content, as the browser sizes a popup.
for (const f of document.querySelectorAll("iframe.ext")) {
  const fit = () => { try { const d = f.contentDocument; f.style.height = Math.ceil(d.documentElement.getBoundingClientRect().height) + "px"; } catch (e) {} };
  f.addEventListener("load", () => { fit(); setTimeout(fit, 300); setTimeout(fit, 1200); });
}
