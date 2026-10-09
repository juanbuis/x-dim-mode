// Runs in the page's own world (manifest "world": "MAIN") at document_start.
//
// X renders Chat inside open shadow roots, each with its own adopted Tailwind
// sheet that redefines the dark tokens on an inner [data-theme="dark"] div.
// The page-level dim stylesheet can't reach into a shadow tree, so this adopts
// one shared sheet into every shadow root X creates, nested ones included.
// content.js (isolated world) owns the CSS text and sends it over a DOM event;
// this file only carries it across, and mirrors the html.x-dim-active gate so
// turning Dim off still turns it off inside the chat.
(() => {
  const sheet = new CSSStyleSheet();
  const desc = Object.getOwnPropertyDescriptor(ShadowRoot.prototype, "adoptedStyleSheets");
  if (!desc || !desc.set) return;

  // Keep ours last whenever X assigns its own sheets, so ties go to dim.
  Object.defineProperty(ShadowRoot.prototype, "adoptedStyleSheets", {
    ...desc,
    set(sheets) {
      desc.set.call(this, [...[...sheets].filter((s) => s !== sheet), sheet]);
    },
  });

  const attachShadow = Element.prototype.attachShadow;
  Element.prototype.attachShadow = function (init) {
    const root = attachShadow.call(this, init);
    try { root.adoptedStyleSheets = []; } catch {}
    return root;
  };

  const html = document.documentElement;
  const gate = () => { sheet.disabled = !html.classList.contains("x-dim-active"); };
  gate();
  new MutationObserver(gate).observe(html, { attributes: true, attributeFilter: ["class"] });

  document.addEventListener("xdm:shadow-css", (e) => {
    if (typeof e.detail === "string") sheet.replaceSync(e.detail);
  });
  document.dispatchEvent(new CustomEvent("xdm:shadow-ready"));
})();
