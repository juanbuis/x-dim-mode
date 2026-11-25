const fs = require("fs");
const msgs = fs.readFileSync("pages/_locales/en/messages.json", "utf8");
fs.writeFileSync("pages/stub.js", `(() => {
  const MSG = ${msgs};
  const q = new URLSearchParams(location.search);
  const state = Object.assign({ enabled: true, theme: "dim", customHue: 210, extrasSeenRevision: 99, emailSubscribed: true }, JSON.parse(q.get("s") || "{}"));
  const area = {
    get(keys, cb) { const out = {}; const ks = keys == null ? Object.keys(state) : typeof keys === "string" ? [keys] : Array.isArray(keys) ? keys : Object.keys(keys); for (const k of ks) if (state[k] !== undefined) out[k] = state[k]; cb && cb(out); return Promise.resolve(out); },
    set(obj, cb) { Object.assign(state, obj); cb && cb(); return Promise.resolve(); },
    remove(k, cb) { cb && cb(); return Promise.resolve(); },
  };
  window.chrome = {
    i18n: {
      getMessage(k, subs) {
        if (k === "@@bidi_dir") return "ltr";
        if (k === "@@ui_locale") return "en";
        const m = MSG[k]; if (!m) return "";
        const list = subs == null ? [] : Array.isArray(subs) ? subs : [subs];
        let s = m.message.replace(/\\$([A-Za-z0-9_@]+)\\$/g, (_, n) => { const p = m.placeholders && m.placeholders[n.toLowerCase()]; return p ? p.content : ""; });
        return s.replace(/\\$(\\d)/g, (_, i) => list[i - 1] ?? "");
      },
      getUILanguage: () => "en",
    },
    storage: { local: area, sync: area, onChanged: { addListener() {} } },
    runtime: { getManifest: () => ({ version: "2.0.0" }), getURL: (p) => p, id: "stub", sendMessage() {} },
    tabs: { query(_q, cb) { cb && cb([]); return Promise.resolve([]); }, sendMessage() {}, create() {} },
    management: { getSelf(cb) { const r = { installType: "normal" }; cb && cb(r); return Promise.resolve(r); } },
    action: { getUserSettings: () => Promise.resolve({ isOnToolbar: true }) },
  };
})();
`);
