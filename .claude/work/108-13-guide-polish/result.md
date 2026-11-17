# 108.13 result

**Changed.** `kc/guide/shell.ts`: home page is now a dark band (linocut workspace art beside the title, above it and cropped on a phone) then three door panels, each page listing title, goal and "About N minutes"; sidebar groups mirror the doors (Getting started first, "Everyday tasks" replaces "Every site"); new `renderNotFound`. `build.ts`: writes `404.html`; `.htaccess` gets `ErrorDocument 404 /404.html` (my addition, so the page is actually served). `style.css`: hero, door panels, 404, button; header sticky from 56rem, sidebar sticks under it with its own scroll. `pages.ts`: `checkPages` refuses two pages with one title (and slug `404`). `kc/guide/img/`: `linocut-workspace.webp` (142 KB) and `linocut-mobile.webp` (94 KB).

**Duplicate.** The demo page was never in the repo: card 11's screenshots used a throwaway page. Nothing to remove; the new title check stops it building or listing.

**Art.** Both sources are 1024x1024, so "about 1200 wide" would mean upscaling; kept 1024, recompressed with sharp (already installed) at quality 42 to get under 150 KB.

**Tests added** (guide-build): no title twice in nav or home doors; duplicate title refused; hero image with alt, both art files under 150 KB, picture before the title; three doors with goal and time on every page row; sidebar group names and order; 404.html (noindex, art, link home, ErrorDocument); sticky sidebar CSS.

**Mutation.** Added a copy of a page to `pages.ts`: all seven new tests plus the real-guide, core, module and anatomy tests failed. Reverted: 873 pass, 0 fail. An earlier full-suite run had 4 unrelated failures (esbuild "write UNKNOWN" in register-load, restore-wiped-field); they did not recur.

**Screenshots** in this folder: `home`, `task`, `404` at 390 and 1280; no sideways scroll. Sidebar measured at 1280x700: starts under the header, scrolls on its own.

**Copy** (prose, avoid-ai-writing, humanizer run, no changes): two alt texts, 404 heading, line and link. Not verified: 404 on nested missing URLs (relative asset paths).

**Noticed.** `groupPages` in `pages.ts` is now only used by its test.
