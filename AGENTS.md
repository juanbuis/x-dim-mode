# X Dim Mode — orientation

A browser extension that dims X's bright chrome and adds a set of optional
Extras. Published on the Chrome Web Store and AMO, in 10 locales. The repo is
**public** — anything account-specific belongs in `NOTES.local.md`, which is
gitignored.

Read by both Codex and Claude Code (`CLAUDE.md` is a symlink to this file, so
there is only one to edit).

## This repo builds BOTH browsers

`build.sh` zips this same source twice and patches the manifest for Firefox on
the way out (MV3 `service_worker` → `background.scripts`, the `gecko` id, the
minimum versions). **A change never needs to land anywhere else.**

`../x-dim-mode-firefox` is a dead fork, two minor versions behind, kept only as
history. Do not edit it. `../x-dim-mode-1.5.0` is an unzipped release artifact,
not a repo. The marketing site is `../x-dim-mode-site`.

**`build.sh` is gitignored, so it exists only on this machine.** If it is ever
lost, it has to be rewritten from the store listings and this file.

## Where the thinking lives

| File | What it holds |
|---|---|
| `LESSONS.md` | Corrections turned into rules. Read before touching selectors or shipping a release. |
| `TODO.md` | The release checklist and what's next |
| `CHANGELOG.md` | Public history, one entry per published version |
| `store/` | Every piece of paste-ready store copy, per locale |
| `NOTES.local.md` | Account-specific notes, never published |

Commit messages carry the reasoning: a `type:` prefix, then a body saying why,
what was verified, and what was rejected. Match that — `git log --format='%b'`
on a file is usually faster than re-deriving its history.

## Building and releasing

- `./build.sh [outdir]` (default `~/Downloads`) produces both zips. There are no
  tests, no linter and no CI — verification is manual.
- Firefox packages are checked with `addons-linter` externally. The target is
  **zero warnings, not just zero errors**: a warning costs a manual review pass,
  which is why no `innerHTML` writes remain.
- **Check the store's live version before packaging.** The repo changelog has
  been wrong before, and a zip was once built at an already-published version.
- The version lives only in `manifest.json`, but a bump also touches
  `CHANGELOG.md`, `store/release-notes-<ver>.txt`, `store/chrome-listing.md` and
  the site's changelog array. These drift; check all five.
- **Chrome submission cannot be automated** — Chrome blocks extensions from
  scripting the Web Store. Everything needed is paste-ready in `store/`,
  including the host-permission justification that silently blocks submission
  when it's missing.
- **Never type the short description into the Chrome dashboard.** It is read
  from `_locales/*/messages.json` `extDescription`; typing it overrides all ten
  translations at once.
- One AMO package serves Firefox desktop and Android — there is no second
  submission.
- Reload from the built zip when testing locally; the local server has served
  stale copies more than once.

## Standing rules

**Matching X's DOM**
- X's markup differs when logged out, and changes without notice. **Never encode
  parent/child structure in a selector.** Match a stable signal — an icon's
  `path` prefix, a `data-testid` — and derive structure at runtime.
- Match controls by icon path, not by label. That is free i18n across every
  language X ships.
- The share menu is React-managed and short-lived: **never move nodes**, reorder
  with CSS `order`/`flex` only.
- React rewrites some attributes in place, so the bird-logo swap needs a polling
  interval, not only a MutationObserver.

**State**
- Reads prefer `local` and fall back to `sync`. Sync-wins is what caused "dim
  won't turn off".
- `applyDim()` refuses to paint when disabled — one invariant, rather than a
  check at each call site.
- `preload.css` runs at `document_start` gated on `html.x-dim-active`, applied
  optimistically from a `localStorage` cache and corrected once X commits its
  own theme.
- `EXTRAS_REVISION` is duplicated in `background.js` and `extras.js` on purpose
  (separate contexts). Bump both.

**Shipping user-visible copy**
- Everything user-visible ships in all ten locales; store copy uses US spelling.
- Popup labels must fit 240px **in every locale** — measure, don't estimate.
- RTL is set manually via `@@bidi_dir`; Chrome doesn't set `dir` on extension
  pages.

## Conventions

`content.js` is one flat file divided by `// ── Section ──` banners, each
feature self-contained: `ensureXCSS` / `applyX` / `removeX`, plus a `*_CSS_ID`
and a class constant. A new Extra follows that shape and adds its key to
`SETTING_KEYS`.
