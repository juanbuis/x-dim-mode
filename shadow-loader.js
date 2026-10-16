// Safari build only (build.sh adds it). Safari ignores "world": "MAIN" in the
// manifest, so shadow.js would never reach the page there; load it as a page
// script instead. shadow.js adopts into any chat roots that already exist, and
// announces itself so content.js resends the CSS.
const script = document.createElement("script");
script.src = chrome.runtime.getURL("shadow.js");
script.onload = () => script.remove();
(document.head || document.documentElement).appendChild(script);
