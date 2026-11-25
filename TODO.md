# Ship checklist — 2.0.0

Live everywhere: **1.8.4** (Chrome Web Store and AMO checked 2026-11-25, nothing
pending). 2.0.0 is prepared and **not submitted**.

## Packages (built 2026-11-25 with the rewritten `build.sh`)

- `~/Downloads/x-dim-mode-2.0.0.zip` — Chrome Web Store, Edge
- `~/Downloads/x-dim-mode-firefox-2.0.0.zip` — AMO (desktop + Android)
- Same files as 1.8.4 plus `nav-items.js`, `sidebar.html`, `sidebar.js`,
  `tips.js`, `icons/backglow96.png`. Firefox manifest identical to 1.8.4 apart
  from the version. `addons-linter`: 0 errors, 0 warnings, 0 notices.

## Before submitting

- [ ] Load the **built zip** unpacked (not the source tree) and click through:
      popup, Extras with the info icons, Sidebar page, welcome screen
      (`?reason=install`) and 2.0 screen (`?reason=update`)
- [ ] Fresh-install first run: remove and re-add, open x.com with X set to
      Light. X should turn Dim by itself. Also checks the pin hint.
- [ ] Old X design: if X serves it, check the Extras and that switching Dim on
      from Light works (it reloads the tab once there)
- [ ] Firefox: load the Firefox zip in about:debugging and repeat the first two
- [x] New screenshots: `store/screenshots/` (see below)

## Chrome Web Store

- [ ] `cws-publish cplloghlcgkjkogmbehmkhlleopnfogc ~/Downloads/x-dim-mode-2.0.0.zip`
      (uploads and submits for review)
- [ ] Paste the detailed description from `store/chrome-listing.md`, and the 10
      localized ones from `store/cws-descriptions/` (four new Extras lines each)
- [ ] Leave the short description alone: it comes from `extDescription`
- [ ] Privacy tab: unchanged, but check the host-permission justification is
      still filled in (`store/cws-privacy-practices.txt`)
- [ ] Upload the new screenshots

## Firefox (AMO)

- [ ] Upload `x-dim-mode-firefox-2.0.0.zip`
- [ ] Release notes: `store/release-notes-2.0.0.txt`
- [ ] Reviewer notes: `store/amo-listing.md` (now mentions the theme cookie)
- [ ] Description from `store/amo-listing.md`; new screenshots

## Safari (Mac App Store) — not ready

- [ ] Add `nav-items.js`, `sidebar.html`, `sidebar.js`, `tips.js` to the Xcode
      project (`build.sh` warns about each). `MARKETING_VERSION` is already 2.0.0.
- [ ] `build.sh` now stages `dist/safari` from AGENTS.md's description, not
      from the lost original: build the app and test on x.com before trusting it
- [ ] The App Store Connect key IDs were in `NOTES.local.md`, which did not
      survive the move to this Mac

## Screenshots (1280×800 everywhere: CWS, AMO, Edge, Mac App Store)

Done: the new set is in `store/screenshots/`, 24-bit PNG with no alpha, the same
five files for every store. They replace the four in `store/safari/screenshots/`
and the three on AMO, which show the old X.

1. `1-dim-is-back.png` — your profile on the redesigned X, in Dim
2. `2-before-after.png` — X's Dark next to Dim, same page
3. `3-in-x-settings.png` — X's Appearance panel with the Dim row
4. `4-themes.png` — the six themes across one page, with the popup
5. `5-extras.png` — the Extras and Sidebar pages

- [ ] Upload them to CWS, AMO and (when it ships) the Mac App Store; Edge when
      the account is verified
- [ ] `og-image.png` and the two `extras-demo` GIFs on xdim.app still show the
      old X

`store/screenshots/src/make.sh` rebuilds them; its header says how the captures
of x.com were taken (they are not in git).

## After release

- [ ] Site: merge the `release/2.0-changelog` branch in `x-dim-mode-site` and deploy
- [ ] Reply to the person who asked for button colors
- [ ] Link the uninstall form to a Sheet, so reasons can be read by date

## Edge Add-ons — blocked

Unchanged: the Partner Center account still needs to clear verification
(detail was in NOTES.local.md). The Chrome zip is what gets uploaded there.

## Still open from earlier releases

- [ ] Manual test: image grid on a 4-image post, quote-tweet with images, and
      the photo lightbox
- [ ] Delete test subscribers from MailerLite (search `+xdm-`)
- [ ] Reply to @cornholio74 (image-grid bug report) and the AMO 4★ reviewer
      (Barbes, review id 2723590)
