const DIM_CSS_ID = "x-dim-theme-ext";
const DIM_BTN_ID = "x-dim-option-btn";

// ── Dim Theme CSS ──────────────────────────────────────────────────

const DIM_CSS = `
  :root[data-theme="dark"] {
    --background: 215, 29%, 13%;
    --border: 206, 16%, 26%;
  }

  :root {
    --dim-background-color: rgb(21, 32, 43);
    --dim-background-color-hover: rgb(30, 39, 50);
    --dim-backdrop-background-color: rgba(21, 32, 43, .85);
    --dim-color: rgb(139, 152, 165);
    --dim-border-color: rgb(56, 68, 77);
  }

  body[style*="background-color: rgb(0, 0, 0)"] {
    background-color: var(--dim-background-color) !important;
  }
  .r-kemksi {
    background-color: var(--dim-background-color);
  }
  .r-5zmot {
    background-color: var(--dim-backdrop-background-color);
  }
  .r-1shrkeu {
    background-color: var(--dim-border-color);
  }
  .r-1hdo0pc, .r-g2wdr4 {
    background-color: var(--dim-background-color-hover);
  }
  .r-1kqtdi0,
  .r-1igl3o0,
  .r-2sztyj,
  .r-1roi411 {
    border-color: var(--dim-border-color);
  }
  .r-gu4em3 {
    background-color: var(--dim-border-color);
  }
  .r-1bwzh9t {
    color: var(--dim-color);
  }
  .draftjs-styles_0 .public-DraftEditorPlaceholder-root {
    color: var(--dim-color);
  }
  [style*="color: rgb(113, 118, 123)"],
  [style*="-webkit-line-clamp: 3; color: rgb(113, 118, 123)"],
  [style*="-webkit-line-clamp: 2; color: rgb(113, 118, 123)"] {
    color: var(--dim-color) !important;
  }
  input::placeholder {
    color: var(--dim-color) !important;
  }
  [style*="background-color: rgb(0, 0, 0); border-color: rgb(47, 51, 54)"],
  [style*="border-color: rgb(47, 51, 54); background-color: rgb(0, 0, 0)"] {
    background-color: var(--dim-background-color) !important;
  }
  [style*="border-color: rgb(47, 51, 54)"].r-1che71a {
    background-color: var(--dim-background-color-hover);
  }
`;

function applyDim() {
  if (document.getElementById(DIM_CSS_ID)) return;
  const style = document.createElement("style");
  style.id = DIM_CSS_ID;
  style.textContent = DIM_CSS;
  (document.head || document.documentElement).appendChild(style);
}

function removeDim() {
  const el = document.getElementById(DIM_CSS_ID);
  if (el) el.remove();
}

// ── Display Settings Injection ─────────────────────────────────────

const CHECKMARK_SVG = `<svg viewBox="0 0 24 24" aria-hidden="true" class="r-4qtqp9 r-yyyyoo r-dnmrzs r-bnwqim r-lrvibr r-m6rgpd r-jwli3a r-1hjwoze r-12ym1je"><g><path d="M9.64 18.952l-5.55-4.861 1.317-1.504 3.951 3.459 8.459-10.948L19.4 6.32 9.64 18.952z"></path></g></svg>`;

function setSelected(btnEl) {
  btnEl.style.borderColor = "rgb(29, 155, 240)";
  btnEl.style.borderWidth = "2px";
  const circle = btnEl.querySelector('[role="radio"] > div');
  if (circle) {
    circle.style.backgroundColor = "rgb(29, 155, 240)";
    circle.style.borderColor = "rgb(29, 155, 240)";
    circle.innerHTML = CHECKMARK_SVG;
  }
  const input = btnEl.querySelector('input[type="radio"]');
  if (input) input.checked = true;
}

function setUnselected(btnEl) {
  btnEl.style.borderColor = "rgb(51, 54, 57)";
  btnEl.style.borderWidth = "1px";
  const circle = btnEl.querySelector('[role="radio"] > div');
  if (circle) {
    circle.style.backgroundColor = "rgba(0, 0, 0, 0)";
    circle.style.borderColor = "rgb(185, 202, 211)";
    circle.innerHTML = "";
  }
  const input = btnEl.querySelector('input[type="radio"]');
  if (input) input.checked = false;
}

function tryInjectDimOption() {
  if (document.getElementById(DIM_BTN_ID)) return;

  const radiogroup = document.querySelector('[aria-label="Background options"][role="radiogroup"]');
  if (!radiogroup) return;

  const buttons = radiogroup.querySelectorAll(':scope > div');
  if (buttons.length < 2) return;

  const defaultBtn = buttons[0];
  const lightsOutBtn = buttons[1];

  // Clone the Lights Out button as our base
  const dimBtn = lightsOutBtn.cloneNode(true);
  dimBtn.id = DIM_BTN_ID;

  // Set dim background color
  dimBtn.style.backgroundColor = "rgb(21, 32, 43)";

  // Change label to "Dim"
  const label = dimBtn.querySelector("span");
  if (label) label.textContent = "Dim";

  // Update radio input
  const input = dimBtn.querySelector('input[type="radio"]');
  if (input) {
    input.setAttribute("aria-label", "Dim");
    input.checked = false;
  }

  // Set initial visual state based on whether dim is enabled
  chrome.storage.local.get("enabled", ({ enabled }) => {
    if (enabled) {
      setSelected(dimBtn);
      setUnselected(lightsOutBtn);
    } else {
      setUnselected(dimBtn);
    }
  });

  // Insert between Default and Lights Out
  radiogroup.insertBefore(dimBtn, lightsOutBtn);

  // ── Click handlers ──

  let switchingToDim = false;

  dimBtn.addEventListener("click", () => {
    switchingToDim = true;

    // Ensure Lights Out is the base theme — click it if Default is active
    const loInput = lightsOutBtn.querySelector('input[type="radio"]');
    if (loInput && !loInput.checked) {
      // Click the radio input directly and fire events React listens for
      loInput.click();
      loInput.dispatchEvent(new Event("input", { bubbles: true }));
      loInput.dispatchEvent(new Event("change", { bubbles: true }));
    }

    // Wait for X to finish applying Lights Out before enabling dim
    setTimeout(() => {
      chrome.storage.local.set({ enabled: true });
      setSelected(dimBtn);
      setUnselected(defaultBtn);
      setUnselected(lightsOutBtn);
      switchingToDim = false;
    }, 300);
  });

  // When Default or Lights Out is clicked directly, disable Dim
  for (const nativeBtn of [defaultBtn, lightsOutBtn]) {
    nativeBtn.addEventListener("click", () => {
      if (switchingToDim) return; // Ignore clicks triggered by dim switch
      chrome.storage.local.set({ enabled: false });
      setUnselected(dimBtn);
    });
  }
}

// ── Observer & Init ────────────────────────────────────────────────

let observer;

function startObserver() {
  if (observer) return;
  observer = new MutationObserver(() => {
    try {
      // Re-inject dim CSS if X removes it
      chrome.storage.local.get("enabled", ({ enabled }) => {
        if (enabled && !document.getElementById(DIM_CSS_ID)) {
          applyDim();
        }
      });
      // Try to inject the Dim button on the display settings page
      tryInjectDimOption();
    } catch {
      // Extension context invalidated after reload — clean up
      observer.disconnect();
    }
  });
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
}

// Init
chrome.storage.local.get("enabled", ({ enabled }) => {
  if (enabled) applyDim();
  startObserver();
  tryInjectDimOption();
});

// Listen for toggle from popup
chrome.storage.onChanged.addListener((changes) => {
  if (changes.enabled) {
    if (changes.enabled.newValue) {
      applyDim();
    } else {
      removeDim();
    }
  }
});
