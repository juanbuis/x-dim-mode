# Changelog

## 1.5.2

- **Fixed:** Dim no longer paints over X's Light theme. X replaced the theme signal the extension was watching, so Dim could switch itself on over a light page — leaving dark text on a dark background. It now follows X's current theme and stays out of the way in Light mode.

## 1.5.1

- **Fixed:** the "Share via Chat" modal is dimmed instead of near-black
- **Fixed:** avatar loading placeholders are navy-tinted instead of flashing grey
- **Fixed:** the modal backdrop is classic Twitter's blue-grey scrim again instead of black

## 1.5.0

- **New:** your theme and settings now sync across devices
- **New:** "Report a problem" link in the popup and Extras
- **New:** join the newsletter right from the popup — new features and experiments, first
- **New:** "Tweet, not Post" (Extras) — renames Post back to Tweet, Repost back to Retweet
- **New:** classic favicon (Extras) — the blue bird returns to your tab, which reads "Twitter" again
- **New:** classic font (Extras) — swaps Chirp back to the old Helvetica Neue look
- **Removed:** the support/donate button
- **Fun:** the ✨ in the popup gives one gentle twinkle the first time you open it — there's good stuff behind it
- **Improved:** the theming engine now catches styles applied after page load — more resilient to X updates
- **Fixed:** reply and compose windows are dimmed again — X had reset them to black
- **Fixed:** Creator Studio no longer shows grey boxes behind its icons
- **Fixed:** Premium promo cards blend in cleanly, with no two-tone edge
- **Fixed:** the "Today's News" sidebar block is dimmed instead of pure black
- **Fixed:** stray hairline at the bottom of dropdown menus

## 1.4.0

- **Bird logo toggle** — bring back the classic Twitter bird (in Extras)
- Support/donate button in popup and welcome page
- Uninstall survey
- Redesigned popup

## 1.3.2

- Share link in popup footer
- Email capture prompt (after 7 days)
- Engagement prompt — share/review (after 14 days)
- Improved welcome page email capture
- Translation updates

## 1.3.1

- PWA title bar theming
- Reduced permissions

## 1.3.0

- **6 color themes** — Dim, Slate, Jade, Plum, Dusk, and Ember
- **Custom color picker** — choose any hue you want
- Full X Pro support
- Covers more pages on X
- Auto light/dark switching — follows your system theme
- Localized in 10 languages (EN, ES, FR, DE, PT-BR, JA, ZH, KO, RU, AR)
- Tons of fixes and improvements

## 1.2.0

- Broader dim coverage across more pages
- Fixed console errors caused by third-party scripts
- Fixed stale styles after extension updates

## 1.1.0

- Broader dim coverage across more pages
- Runtime scanner for catching missed dark elements
- Fixed flash of black on page load
- Faster, more reliable toggling

## 1.0.0

- Initial release
- Restores the Dim background theme on X
- Adds a Dim option to Settings → Display → Background
- Quick toggle from the extension popup
