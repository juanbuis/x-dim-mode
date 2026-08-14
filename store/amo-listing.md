# addons.mozilla.org listing — X Dim Mode

Same product, but AMO has its own fields and its own markup rules.
Firefox for Android is served from this one listing: the
`gecko_android` key in the packaged manifest is what makes it installable
there, so there is no second submission.

---

## Summary (max 250)

```
X removed Dim — the dark blue background between Lights Out and Default. This puts it back, as a fourth option inside X's own display settings. Six themes plus a custom color, and optional throwbacks: the bird logo, the classic font, and the old image grid.
```

## Description

AMO's description field is **Markdown**, not HTML — the editor links to
"Some Markdown supported". `**bold**` works; use plain `•` bullets rather than
list syntax, which renders inconsistently. This is what is currently live.

```
X removed Dim — the dark blue background that used to sit between Lights Out and Default — and left you with pure black or pure white. X Dim Mode puts it back.

Dim returns as a fourth option inside X's own display settings, exactly where it always was. Pick it once and it stays.

**Themes**
• Dim — the original dark blue background, restored
• Five more to choose from: Slate, Jade, Plum, Dusk, and Ember
• Custom — dial in any color you want with the hue slider
• Applies everywhere: timeline, DMs, modals, the new chat UI, and X Pro

**Extras — optional pieces of old Twitter**
All off by default. Turn on only the ones you want.
• Classic bird logo — the bird instead of the X
• Classic font — Helvetica Neue, the typeface X used before Chirp
• Classic favicon — the Twitter bird back in your tab
• "Tweet, not Post" — the old wording, compose button included
• Start on Following — open on Following instead of For You
• Classic image grid — multi-image posts get the old grid, with nothing cropped off-screen

**Easier on the eyes**
Dark blue backgrounds cut halation: the glow that white text throws against pure black, which makes reading harder if you have astigmatism. That is why a lot of people used Dim in the first place, and why its removal was so unwelcome.

**Privacy**
No account. No tracking. No analytics. No data collection of any kind. The extension asks for exactly one permission — storage — which it uses to remember your settings. Those settings sync across your own devices through your Firefox account and go nowhere else.

**Also worth knowing**
• Works on x.com, twitter.com, and X Pro
• Runs on Firefox for Android as well as desktop
• Available in English, Spanish, Portuguese, French, German, Russian, Japanese, Korean, Chinese, and Arabic
• Open source: https://github.com/juanbuis/x-dim-mode

X changes its layout often, and when it does something here occasionally breaks. There is a "Report a problem" link in the popup — reports get read, and fixes usually ship within a few days.
```

---

## Fields

- **Categories:** Appearance + Social & Communication (both now set).
- **Tags:** dark mode, dim, twitter, theme, accessibility
- **License:** MIT (matches the repo)
- **Source code:** not required — no build step, no minification, no bundler.
  The zip is the source. If a reviewer asks, point at
  `build.sh`, which only copies files and rewrites two manifest keys.
- **Data collection:** None. The packaged manifest already declares
  `browser_specific_settings.gecko.data_collection_permissions.required = ["none"]`,
  which is what the dashboard's data-collection question maps to.

## Reviewer notes

```
No build step: the uploaded zip is the complete, unminified source. build.sh in
the repo only copies files and derives two Firefox-specific manifest keys
(background.scripts instead of a service worker, plus browser_specific_settings).

The extension injects CSS into x.com / twitter.com / pro.x.com to recolor the
interface, and reads and writes chrome.storage for the user's settings. It makes
one network request, and only when the user types an email address into the
optional newsletter field and presses subscribe: a POST to
https://xdim.app/api/subscribe. Nothing is sent otherwise, and there is no
telemetry anywhere in the codebase.
```

---

## Gotcha for next time

On the "Describe Version" step, the two textareas are mislabelled in the
accessibility tree: the one reported as "Release Notes:" is actually **Notes to
Reviewer**. Check the rendered page before submitting rather than trusting the
label, or the release notes go to reviewers and the reviewer notes go public.
