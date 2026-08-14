# Chrome Web Store — localized detailed descriptions

One file per locale, each containing **only** the description text. Open a file,
select all, copy, paste. Nothing to trim, no headers to skip.

## Where these go

Chrome Web Store dashboard → your item → **Store listing** tab → the **language
dropdown at the top of the page**. The dropdown lists one entry per `_locales/`
directory in the package, so all ten appear. Pick a language, paste its
description into the Detailed Description field, then move to the next.

The **name** and **short description** are *not* edited here — they come from
`_locales/*/messages.json` in the manifest and are already translated. Only the
detailed description is per-locale in the dashboard.

## Files, in dropdown order

| File | Dashboard language |
|---|---|
| `01-English.txt` | English |
| `02-German.txt` | German |
| `03-Spanish.txt` | Spanish |
| `04-French.txt` | French |
| `05-Japanese.txt` | Japanese |
| `06-Korean.txt` | Korean |
| `07-Portuguese-Brazil.txt` | Portuguese (Brazil) |
| `08-Russian.txt` | Russian |
| `09-Chinese-Simplified.txt` | Chinese (Simplified) |
| `10-Arabic.txt` | Arabic |

All are far under the 16,000-character limit.

## Notes

- These are not required. A locale with no description falls back to the default
  listing language. But the name and short description are already localized, so
  without these a Japanese user gets a Japanese search result that opens an
  English page.
- Google asks that localized metadata stay consistent — same described feature
  set in every language. These are straight translations of the English, so they
  are.
- English is generated from `../chrome-listing.md` rather than duplicated, so
  edit that file and re-extract if the copy changes.
- The theme names (Slate, Jade, Plum, Dusk, Ember) are deliberately left
  untranslated: they are the labels the popup actually shows, in every locale.
