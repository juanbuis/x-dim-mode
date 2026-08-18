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
- [ ] Work the **Privacy practices** tab from `store/cws-privacy-practices.txt`
      — every field paste-ready, including the **host-permission justification**
      (x.com / twitter.com / pro.x.com), which is easy to miss and blocks
      submission on its own
- [ ] Data usage there: tick **only** "Personally identifiable information",
      policy URL `https://xdim.app/privacy`. Corrected — an earlier version of
      this list said "tick nothing", which was wrong.
- [ ] Paste the 10 localized descriptions from `store/cws-descriptions/`
      (language dropdown at the top of the Store listing tab)
- [ ] Optional: screenshots predate this release — the classic image grid and
      the grouped Extras menu are the two worth showing

## Firefox follow-up — data disclosure

1.7.0 shipped to AMO declaring `data_collection_permissions.required = ["none"]`,
which tells the install prompt the add-on never transmits personal data. That is
not quite right: the optional newsletter field sends an email address to
MailerLite when a user chooses to enter one. `build.sh` now also declares
`optional: ["personallyIdentifyingInfo"]` (linter clean).

- [ ] Ship this in the next AMO upload. Not urgent enough to rush a 1.7.1 on its
      own, but it should not sit for long — it is a disclosure accuracy issue,
      and the fix is already in the build.

## Edge Add-ons — blocked

The listing is complete and would publish on one click; the Microsoft Partner
Center developer account still needs to clear verification. Account-specific
detail is in NOTES.local.md (untracked).

Everything else on Edge is done and waiting:
- [x] Package 1.7.0 uploaded and verified (permissions reduced to `storage`)
- [x] Privacy section complete and saved
- [x] English store listing complete (description + 300x300 logo)
- [x] Public, all 241 markets

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
