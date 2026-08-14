# Ship checklist — 1.7.0

## Firefox (AMO) — DONE

- [x] Uploaded `x-dim-mode-firefox-1.7.0.zip`; validated with 0 errors, 0 warnings
- [x] Firefox for Android enabled (AMO locked the checkbox on from the
      `gecko_android` manifest key — no separate submission exists)
- [x] Release notes + reviewer notes filled in
- [x] Auto-approved and **live**: https://addons.mozilla.org/firefox/addon/x-dim-mode/
- [x] Listing summary and description rewritten; categories now
      Appearance + Social & Communication

## Chrome Web Store — NEEDS JUAN

Chrome blocks every extension from scripting the Web Store and its dev console,
so this half cannot be automated from here. Everything to paste is ready:

- [ ] Upload `~/Downloads/x-dim-mode-1.7.0.zip`
      (published version is currently 1.6.1 — verified against the live CRX)
- [ ] Paste the detailed description from `store/chrome-listing.md`
      — **the reminder you asked for: the current one still only sells themes**
- [ ] Paste "What's new" from `store/release-notes-1.7.0.txt`
- [ ] Leave the short description alone — it comes from the manifest
      (`_locales/*/messages.json` → `extDescription`), already rewritten in all
      10 locales, and typing it into the dashboard would override the translations
- [ ] Data usage: tick nothing. Permission justification for `storage` is in
      `store/chrome-listing.md`

## Edge Add-ons — BLOCKED ON ACCOUNT VERIFICATION

You already had a Partner Center account with an X Dim Mode draft sitting at
**version 1.3.0 since 19 Feb** — never published because the store listing was
never filled in (all 10 languages showed "Incomplete", empty descriptions).

Now done: package replaced with 1.7.0 (verified, permissions reduced to
`storage` only — the old draft still asked for `assets.mailerlite.com`),
English description written, 300x300 logo uploaded, visibility Public,
all 241 markets. Draft saved.

- [ ] **Complete developer account verification** — Partner Center → Account
      Settings. Until this is done the Publish button stays greyed out. This is
      an identity step; it has to be you.
- [ ] Then hit Publish on the Edge draft
- [ ] Optional: the other 9 languages still have empty descriptions. Edge only
      requires one, so English is enough — non-English users just see English
      copy. The extension's own UI stays localised either way.
- [ ] Optional: screenshots and promo tiles are empty. Not required, but the
      listing looks bare without them; the CWS/AMO screenshots would drop
      straight in (1280x800 or 640x400).

## Other stores — not worth doing

- **Opera**: has its own store, but Opera also installs directly from the
  Chrome Web Store. Not worth a second listing to maintain.
- **Brave, Vivaldi, Arc**: all install from the Chrome Web Store. Already covered.
- **Safari**: the only real gap. Needs an Xcode wrapper, a paid Apple Developer
  account, and its own testing — a project, not a submission.

## Before or shortly after

- [ ] Manual test: image grid on a 4-image post, quote-tweet with images, and
      the photo lightbox (the three cases never covered in testing)
- [ ] Test the pin hint — only appears on a genuine install
      (`reason=install`), so remove and re-add the unpacked extension
- [ ] Delete test subscribers from MailerLite (search `+xdm-`)
- [ ] Check MailerLite for `signup_source` values arriving
      (extension-welcome / extension-update / extension-popup / website)
- [ ] Reply to @cornholio74 (image-grid bug report) and the AMO 4★ reviewer
      (Barbes, review id 2723590) — drafts are in the session notes

## Note

When testing locally, `localhost:4411` served a stale copy more than once this
session. Rebuild with `./build.sh` and reload from the zip, or the changes look
like they never landed.
