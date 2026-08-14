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
