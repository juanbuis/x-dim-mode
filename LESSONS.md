# Lessons

## Verify the published version before packaging a release

**What happened (Aug 2026):** The changelog listed 1.5.0 as unreleased, so new fixes
were filed under it and packaged as 1.5.0. But 1.5.0 had already been published to the
Chrome Web Store on Jul 10 — the zip would have been rejected, since CWS requires a
strictly higher version than the published one.

**Rule:** Before building a release zip, check the *store's* current version, not the
repo's changelog. `curl` the public listing, or read the Package page in the dev console.
The repo's "unreleased" heading is an intention, not a fact.

**Related:** the site's changelog had drifted even further behind (stuck at 1.3.0 while
1.5.1 shipped). Anything that restates the version — store listing, marketing site,
AMO — needs a pass at release time, not just `manifest.json`.

## Don't let a client-side fetch be the only source of a public number

**What happened:** xdim.app rendered `useState("2,000+")` and corrected it after a
client fetch, so the served HTML — and every crawler, preview, and first paint — showed
a number that was 2x stale for months. A second layer: Next's data cache persisted the
scrape across builds, so a build could bake in an even older value.

**Rule:** Numbers that make a claim to the public get server-rendered, with an explicit
`revalidate`. If the source can fail, fall back to something that stays true
("Thousands of installs"), never to a hardcoded figure that silently rots.

## Never emit fabricated values into structured data

**What happened:** A `ratingValue ?? "5.0"` fallback was added to the JSON-LD so the
page always had an aggregateRating. That ships invented review counts to Google when
the scrape fails — exactly what earns manual actions.

**Rule:** If real data isn't available, omit the property. A missing `aggregateRating`
costs a rich-result enhancement; a fake one risks the whole listing.
