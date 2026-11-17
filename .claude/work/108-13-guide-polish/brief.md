# 108.13. Guide polish: a home page that looks like a creative studio's (job: code)

## Objective
The full spec is card 13 in `.claude/work/108-help-guide-plan/plan.md`; do all five fixes there: linocut home page with three door panels, the duplicate "Change the text on a page" out of the home list and nav, a sidebar that scrolls on its own (sticky under the header), the group label "Every site" renamed "Everyday tasks" with Getting started first, and a 404 page using the linocut-mobile art.

## Read first
- `.claude/project.md` (Never list, upstream-file rule) and `docs/adr/0005-guide-design-kc-brand-tokens.md` (colours and fonts only from `kc/guide/tokens.css`)
- `C:\personas\cas\memory\design-slop.md` (no eyebrows, no filled-plus-outlined pair, no cream, no comma headlines, no proof lines, no curved accent edge on the current nav item)
- `kc/guide/build.ts`, `shell.ts`, `pages.ts`, `parts.ts`, `style.css`, `kc/tests/guide-build.test.ts`, `kc/tests/help-pages.test.ts`
- Card 11's screenshots: `.claude/work/108-11-guide-redesign/index-1280.png`, `demo-change-text-390.png`
- Art: `D:\Dev\htdocs\kingsburycreative\docs\brand\linocut-workspace.webp` and `linocut-mobile.webp` (copy, never edit the originals)

## Requirements
- Find where the duplicate comes from (card 11's demo page, wherever it is built or listed) and stop it building and listing.
- Resize the workspace art to about 1200px wide, under 150 KB, with a tool already installed (installing anything is not allowed; if nothing can resize, copy as is when under 150 KB, else say so in result.md).
- Mobile first: base styles for a phone, desktop layout in `min-width` queries.

## Files you may touch
- `kc/guide/shell.ts`, `kc/guide/style.css`, `kc/guide/build.ts`, `kc/guide/pages.ts`, `kc/guide/parts.ts`
- `kc/guide/img/*` (new)
- any demo page file card 11 added under `kc/guide/`
- `kc/tests/guide-build.test.ts`, `kc/tests/help-pages.test.ts`
- `.claude/work/108-13-guide-polish/` (result.md, progress.md, screenshots)

## Done-test
`node --test kc/tests/guide-build.test.ts kc/tests/help-pages.test.ts`, run through `node C:\Users\roban\.claude\bin\project-test.cjs`, passes and asserts: no page title appears twice on the home page or in the nav; the home page has the illustration with non-empty alt text and three door panels each listing goal and time per page; a 404.html is built; the illustration file is under 150 KB. Mutation check through the runner: put the demo page back in the nav, see the test fail, revert, see it pass. Screenshots at 390 and 1280 of the built home page and one task page, saved in this card's folder.

## Rules
Keep `progress.md` beside this brief, updated after every step. No commit. `result.md`: what changed, test assertions added, screenshots taken, anything not verified.

Secrets: never run a command or read a file that prints a secret value; values move file-to-file or pipe-to-pipe only (secret-put.cjs, secret-to-file.cjs).
