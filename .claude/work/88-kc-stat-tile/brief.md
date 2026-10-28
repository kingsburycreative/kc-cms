# 88. KC stat tile (Normal)

## Objective
The dashboard's Visitors, Pages viewed and Time on site tiles squeeze to three words a line at 390px. Build a KC stat tile component in `kc/` after the ui-library stat-card spec and use it for those tiles: number first, plain-case label (no all-caps letter-spaced label), optional trend and sparkline, two columns at the base width (390px and up) driven by container width, and a `.kc-shimmer` skeleton of the same shape and tile count.

## Read first
- .claude/project.md (upstream rule, Copy rule; kc/insights/ is a risky path, read only)
- The kc-stat-tile entry in kc/BOARD.md (the spec)
- `D:\Dev\htdocs\ui-library\BOARD.md` (find the ui-stat-card row, around row 186) and the stat-card component it points to, read only
- kc/dashboard-server.tsx (`Tile`, `StatTiles`, around lines 85-125, and its skeleton), app/globals.css `.kc-shimmer` (read only)
- .claude/work/86-kc-shimmer/result.md, .claude/work/87-setup-banner/result.md
- kc/tests/dashboard-server.test.ts, kc/tests/kc-shimmer.test.ts (test style)

## Build
- New `kc/stat-tile.tsx`: `StatTile` (value first, label below in sentence case, optional change/trend and sparkline) and `StatTileSkeleton` using `.kc-shimmer` blocks of the same shape. Also export a grid wrapper or class constant: two columns at base width (`grid-cols-2`), from container queries for wider layouts; keep the existing dashboard layout at 900px working.
- Replace `Tile` in kc/dashboard-server.tsx with `StatTile`; the tiles' skeleton renders the same number of tiles (three) as the real grid.
- Keep existing states (not set up hides tiles, could-not-load per tile) unchanged.
- Mobile first. Run `avoid-ai-design` (Skill tool) on the tile; no eyebrow labels, no beige. Any new visible text goes through `prose`, `avoid-ai-writing`, `humanizer`; if the Skill tool refuses one, stop and say so in result.md. List copy and the design check in result.md.

## Files you may touch
- `kc/stat-tile.tsx` (new), `kc/dashboard-server.tsx`, `kc/dashboard-skeleton.tsx`, `kc/tests/dashboard-skeleton.test.ts` if it exists, `kc/tests/kc-shimmer.test.ts`
- `kc/tests/stat-tile.test.ts` (new), `kc/tests/dashboard-server.test.ts`, `kc/tests/dashboard.test.ts`, `kc/tests/dashboard-visits.test.ts`, `kc/tests/dashboard-sections.test.ts`
- `.claude/work/88-kc-stat-tile/result.md`, `progress.md`

## Done-test
Tests asserting the dashboard tiles render through `StatTile`, the tile grid is two columns at the base width (no breakpoint prefix on `grid-cols-2`), the label has no uppercase/tracking classes, and the skeleton renders the same tile count as the real grid. Source-read tests are fine where rendering is not possible under node --test.

Mutation check through the runner: make the base grid one column; a test fails; restore.

At the end, each exit 0 on the final tree:
- `node C:\Users\roban\.claude\bin\project-test.cjs kc/tests/<file>.test.ts` for each test file you changed or added
- `npx tsc --noEmit`, `npx eslint kc`

## Boundaries
No commit, no push, no npm install, no package.json edits, no network in tests, no .env, no edits under kc/insights/ or app/, no edits to ui-library.

## Progress
Keep `progress.md` beside this file from your first step, one line per step that changes a file or finishes a unit of work: done, files, next, anything half-written. Already there? You are resuming: read it and check the disk against it first.
