# 108.04 result

**Added:** `playwright` ^1.65.1 as a devDependency (package.json, package-lock.json only); Chromium headless shell installed.

**Files:** `kc/guide/screenshots/compare.ts`, `manifest.json` (empty list: the placeholder page has no pictures), `hashes.json` (`{}`), `run.mjs`, and `kc/tests/help-screenshots.test.ts` (new, 13 tests).

**compare.ts:** `hashFolder`, `diffHashes`, `changedPages` (changed, added or removed pictures, mapped to pages by the manifest and by each page body's `<img src>`), `picturesUsedBy`, `missingFromManifest`, `parseStep`. `run.mjs` reads `KC_GUIDE_DEMO_URL` (prints how to set it and exits 1 if absent), screenshots each manifest entry full-page at its `width` (375 or 1280), writes `kc/guide/img/`, prints changed pages, rewrites `hashes.json`.

**Calls:** one manifest entry is one file at one width, so the picture name carries the width. `parseStep` lives in compare.ts so the steps are tested. A new page with pictures needs manifest entries or the manifest test fails.

**Mutation:** made `changedPages` start with every page. Failed: lists exactly the pages whose picture hash differs; lists no page when every picture matches; lists a page once when two changed; added/removed picture; first run (5). Restored; green (645 pass, 0 fail).

**Not verified:** run.mjs was not run (no demo site, per brief). The runner ran the whole suite, not just my file; all green. tsc/eslint not run.
