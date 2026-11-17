# 108.11. Guide redesign in the KC brand, from one tokens file (job: code)

## Objective
Rebuild the help guide's look so it reads as Kingsbury Creative: every font, colour, size, radius and shadow comes from one new file, `kc/guide/tokens.css`, with fonts self-hosted; shared markup helpers in `kc/guide/parts.ts` that pages call; a home page with three entry points; a phone menu sheet and a desktop on-this-page rail; a small client-side search. Pages' words are not rewritten here (that is card 12).

## Read first
- `.claude/project.md` (upstream-file rule, Never list, copy rule)
- `docs/adr/0005-guide-design-kc-brand-tokens.md` (authoritative), and the other ADRs in `docs/adr/`
- `.claude/work/108-help-guide-plan/plan.md` card 11 (the spec; ADR 0005 wins where they differ)
- `D:\Dev\hq\.claude\work\guide-redesign\research.md` sections (c) and (d), read only
- `C:\personas\cas\memory\design-slop.md`: avoid every item (no eyebrow labels, no cream page, no Fraunces headlines, no filled+ghost button pair, no curved accent nav border)
- `D:\Dev\htdocs\ui-library\components\*\manifest.json`: reuse patterns where they fit (read only)
- `D:\Dev\htdocs\kingsburycreative\css\themes.css`, `fonts.css`, `fonts\` (read only, source for tokens)
- `kc/guide/build.ts`, `shell.ts`, `style.css`, `pages.ts`, `pages/*.ts`, `kc/tests/guide-build.test.ts`, `kc/tests/help-pages.test.ts`

## Requirements
- `tokens.css` holds all fonts (@font-face pointing to `fonts/*.woff2`, relative), colours (white page, terracotta #C2602E accent, warm-dark text), type scale, radii, shadows. No raw hex, rgb() colour or font-family anywhere else in the guide (style.css, shell.ts, parts.ts, pages).
- Copy only the woff2 files used (Inter, JetBrains Mono, plus one display face for step numerals if used) into `kc/guide/fonts/`. Build copies tokens.css, fonts and search.js into the output. No http(s) font or script URL in any built page.
- Inter for headings and body, headings heavier at normal tracking.
- `parts.ts` exports: steps (numeral, action line, "You will see", "If not"), figure (image with caption and alt, optional ring and numbered dot by percentage position; a styled empty frame with the caption when no image exists), callout (note, warning), button-name chip, menu path (mono), "Check it worked", help bar, page header (goal, time, version stamp).
- Home page with three entry points: getting started, everyday tasks, modules.
- Mobile first: base styles for phone, layouts added with min-width queries. Works 280 to 1440px with no sideways scroll. Menu sheet on phone, on-this-page rail on desktop.
- Search over page titles and headings in `search.js`; pages read fine without it.
- Delete `kc/guide/pages/placeholder.ts` and its "Sample page" entry. Keep noindex on every page and the `--drafts` behaviour.
- Run `avoid-ai-design` via the Skill tool on the result; any visible UI label you write goes through `prose`, `avoid-ai-writing`, `humanizer` via the Skill tool. If one is refused, say so in result.md and stop.
- Relative imports with `.ts` extensions. No npm install, no network.

## Files you may touch
- `kc/guide/shell.ts`, `kc/guide/style.css`, `kc/guide/tokens.css` (new), `kc/guide/parts.ts` (new), `kc/guide/search.js` (new), `kc/guide/fonts/inter-latin.woff2`, `kc/guide/fonts/inter-latin-ext.woff2`, `kc/guide/fonts/jetbrains-mono-latin.woff2`, `kc/guide/fonts/jetbrains-mono-latin-ext.woff2` (new), `kc/guide/build.ts`, `kc/guide/pages.ts`, `kc/guide/pages/placeholder.ts` (delete)
- `kc/tests/guide-build.test.ts`, `kc/tests/help-pages.test.ts` (extend)
- `.claude/work/108-11-guide-redesign/` (result.md, progress.md, screenshots)

## Done-test
`node --test kc/tests/guide-build.test.ts kc/tests/help-pages.test.ts` passes, with tests asserting: no colour hex or font-family outside tokens.css; every built page links tokens.css and uses self-hosted fonts only (no http font URLs); parts.ts step output has numeral, action, "You will see" and "If not" slots; the placeholder page is gone; noindex on every page. Mutation check through `node C:\Users\roban\.claude\bin\project-test.cjs`: put a raw hex in style.css, run, see the test fail, revert, run green. Plus one 390px and one 1280px screenshot of a built page (playwright is installed) saved in the card folder.

## Rules
Keep `progress.md` beside this brief, updated after every step. No commit. `result.md`: what was built, tests added, mutation result, screenshot paths, copy written, anything not verified.

Secrets: never run a command or read a file that prints a secret value; values move file-to-file or pipe-to-pipe only (secret-put.cjs, secret-to-file.cjs).
