// Store-aware review link, shared by every page that asks for a review
// (popup, Extras, update screen). Before this it was hardcoded to the Chrome
// Web Store, so every Firefox user who ever saw the ask was sent to a page
// they could not rate on.
const RATE_URL = location.protocol === "moz-extension:"
  ? "https://addons.mozilla.org/firefox/addon/x-dim-mode/reviews/"
  : "https://chromewebstore.google.com/detail/x-dim-mode/cplloghlcgkjkogmbehmkhlleopnfogc/reviews";
