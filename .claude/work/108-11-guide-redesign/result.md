# 108.11 result

**Built.** `kc/guide/tokens.css` (all fonts, colours, scale, radii, shadows), `parts.ts` (steps, figure with ring/dot or empty frame, callout, chip, menu path, check it worked, help bar, page header, heading ids), `search.js` (+ build-written `search-index.js`), four self-hosted woff2 in `kc/guide/fonts/` (Inter, JetBrains Mono, latin + ext). `style.css` rewritten mobile first (menu sheet via :target, no script; rail from 76rem). `shell.ts` home page with three doors. `build.ts` copies tokens, fonts, search. `pages.ts`: placeholder removed, `goal`/`time` optional fields, `entryPoints()`. `placeholder.ts` deleted. Existing `picture-marker` paragraphs are styled as empty frames until card 12.

**Tests added** in guide-build and help-pages: no raw colour/font-family outside tokens.css, tokens linked, no remote URLs, three doors, rail and search entries, placeholder gone, noindex everywhere, parts output.

**Mutation.** Raw `#a84f23` in style.css: "keeps every colour and font family in tokens.css" failed. Reverted, green (757).

**Screenshots** (demo page using parts, drafts build): `demo-change-text-390.png`, `demo-change-text-1280.png`, `index-1280.png`, `menu-sheet-390.png`. No sideways scroll at 280, 390, 1280, 1440.

**Copy** (prose, avoid-ai-writing, humanizer run; one change, the home lead): home title and lead, door titles and lines, Menu, Close, Search the guide, Nothing found., On this page, Picture to come, Careful, Good to know, Need a hand?, help bar line, You will see, If not, Check it worked.

**Notes.** The runner runs the full suite whatever args are passed. avoid-ai-design: no P0 beyond Inter, which ADR 0005 sets. Display face not used; numerals are Inter. Help bar sits at page end, not sticky. Not verified: search.js behaviour in a browser.
