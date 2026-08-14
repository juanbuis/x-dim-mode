# Chrome Web Store listing — X Dim Mode

Paste-ready copy for the CWS dashboard. Keep this file in sync when features change.

---

## Short description (max 132 — currently 108)

Also lives in `_locales/*/messages.json` as `extDescription`, translated into all
10 locales. CWS reads it from the manifest, so **do not retype it in the
dashboard** — updating the locale files is what changes it.

```
Brings back the Dim dark blue theme X removed, plus the Twitter bird logo, classic font, and old image grid.
```

---

## Detailed description (max 16,000)

```
X removed Dim — the dark blue background that used to sit between Lights Out and Default — and left you with pure black or pure white. X Dim Mode puts it back.

Dim returns as a fourth option inside X's own display settings, exactly where it always was. Pick it once and it stays.


THEMES

• Dim — the original dark blue background, restored
• Five more to choose from: Slate, Jade, Plum, Dusk, and Ember
• Custom — dial in any color you want with the hue slider
• Applies everywhere: timeline, DMs, modals, the new chat UI, and X Pro


EXTRAS — optional pieces of old Twitter

All off by default. Turn on only the ones you want.

• Classic bird logo — the bird instead of the X
• Classic font — Helvetica Neue, the typeface X used before Chirp
• Classic favicon — the Twitter bird back in your tab
• "Tweet, not Post" — the old wording, compose button included
• Start on Following — open on Following instead of For You
• Classic image grid — multi-image posts get the old grid, with nothing cropped off-screen


EASIER ON THE EYES

Dark blue backgrounds cut halation: the glow that white text throws against pure black, which makes reading harder if you have astigmatism. That is the reason a lot of people used Dim in the first place, and the reason its removal was so unwelcome.


PRIVACY

No account. No tracking. No analytics. No data collection of any kind.

The extension asks for exactly one permission — "storage" — which it uses to remember your settings. Those settings sync across your own devices through your browser account, and go nowhere else.


ALSO WORTH KNOWING

• Works on x.com, twitter.com, and X Pro
• Available in English, Spanish, Portuguese, French, German, Russian, Japanese, Korean, Chinese, and Arabic
• Open source: https://github.com/juanbuis/x-dim-mode

X changes its layout often, and when it does something here occasionally breaks. There is a "Report a problem" link in the popup — reports get read, and fixes usually ship within a few days.
```

---

## Category & fields

- **Category:** Accessibility (not Themes — this is an extension, and the
  halation/astigmatism case is the honest fit)
- **Language:** English (with the 10 locales supplied by the manifest)
- **Single purpose:** "Restores the Dim dark blue theme and related legacy
  Twitter UI options to X."
- **Permission justification — `storage`:** "Stores the user's chosen theme,
  custom color, and Extras toggles so they persist between sessions and sync
  across the user's own devices. No data leaves the browser."
- **Remote code:** No
- **Data usage:** Nothing collected. Tick none of the categories.
