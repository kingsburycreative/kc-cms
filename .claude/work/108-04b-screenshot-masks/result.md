# 108.04b result

Files changed: `kc/guide/screenshots/compare.ts`, `run.mjs`, `manifest.json`, `kc/tests/help-screenshots.test.ts`.

- `compare.ts`: entries take `replace` and `hide`; new `Manifest` type; `cleanPage(doc, mask, deny)` applies replace, then hide, then returns the deny words still in the page's visible text (case-insensitive). It is self-contained so run.mjs can ship its source into the page.
- `manifest.json`: call made, it was a bare array, so it is now `{ "deny": [...], "shots": [] }`. Deny seeded with kingsbury, kc test site, kingsburycreative.com, skilled-trades-month, henike, besciworks, cupboard, chris adams (the trap's client names).
- `run.mjs`: reads `manifest.shots`; runs `cleanPage` in the page via `tab.evaluate` before each capture; a shot with a deny word left is refused (names the shot and word), the run continues, then exits 1 without touching hashes.json. Never run (no demo site).

Tests added (fixture page, no browser): seeded deny list, replace/hide rule shape, replace swaps text, hide removes, deny fails a Kingsbury page in any case and passes the cleaned one, uses innerText when present, function source runs as plain JS. Existing manifest tests now read `.shots`.

Mutation: deny check forced to return nothing. Failed: "fails a page that still says Kingsbury, in any case" and "uses the browser's visible text when the page has it". Restored, green (runner runs the whole suite: 709 pass).

Not done: no real `replace`/`hide` entries yet, since `shots` is empty.
