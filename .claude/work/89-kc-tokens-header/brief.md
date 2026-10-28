# 89. KC tokens and page header (Normal)

## Objective
Token pass in `app/globals.css` (an upstream file this card names; KC tracks it as "branding"), then rebuild `kc/page-header.tsx` and the dashboard title block after ui-library's page-header pattern.

## Read first
- .claude/project.md (upstream rule, Copy rule, risky paths)
- The kc-tokens-header entry in kc/BOARD.md (the spec)
- `D:\Dev\htdocs\ui-library\tokens.css` (read only; do not import it whole)
- `D:\Dev\htdocs\ui-library-lanes\b\components\nav\ui-page-header\` README and component (read only)
- app/globals.css, kc/page-header.tsx, kc/dashboard.tsx (title block), kc/tests/page-header.test.ts, kc/tests/dashboard.test.ts, kc/tests/kc-shimmer.test.ts (test style)

## Build
- app/globals.css: cool neutrals, radius steps, shadows and a focus-ring token after tokens.css. Terracotta stays `--primary`. Replace the green `--chart-1..5` values (oklch hue ~162-166) in both `:root` and `.dark` with values that read on our palette in light and dark. Theme selector stays `.dark`, not `[data-ui-theme]`. No beige or cream backgrounds. Keep the `.kc-shimmer` rules intact.
- kc/page-header.tsx: title, one subtitle line (publish status), one kind of action; actions sit under the title on a phone and at the end of the row from 768px (`md:`), mobile-first base classes. Keep existing callers (dashboard, history view, insights page) working with their current props; update the dashboard's title block to use it.
- Run `avoid-ai-design` (Skill tool) on the header. Any new visible text goes through `prose`, `avoid-ai-writing`, `humanizer`; if the Skill tool refuses one, stop and say so in result.md. List copy and the design check in result.md.

## Files you may touch
- `app/globals.css`, `kc/page-header.tsx`, `kc/dashboard.tsx`
- `kc/tests/page-header.test.ts`, `kc/tests/dashboard.test.ts`, `kc/tests/tokens.test.ts` (new)
- `.claude/work/89-kc-tokens-header/result.md`, `progress.md`

## Done-test
Tests asserting: the `--chart-*` values are not the old greens in both `:root` and `.dark`; a focus-ring token exists; the page header puts actions after the title in source order, stacked at base width and in a row from `md:` (768px). Source-read tests are fine.

Mutation check through the runner: restore the old chart greens; a test fails; restore.

At the end, each exit 0 on the final tree:
- `node C:\Users\roban\.claude\bin\project-test.cjs kc/tests/<file>.test.ts` for each test file you changed or added
- `npx tsc --noEmit`, `npx eslint kc`

## Boundaries
No commit, no push, no npm install, no package.json edits, no network in tests, no .env. Leave `components/ui/*`, `repo-sidebar.tsx`, kc/insights/ and app/api/ alone. No edits to ui-library.

## Progress
Keep `progress.md` beside this file from your first step, one line per step that changes a file or finishes a unit of work: done, files, next, anything half-written. Already there? You are resuming: read it and check the disk against it first.
