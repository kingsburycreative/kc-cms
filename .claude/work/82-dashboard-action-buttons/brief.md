# 82. Dashboard action buttons (Normal)

## Objective
The dashboard's quick actions (`kc/dashboard.tsx`, the `actions.map` list near line 117) render as underlined text links on every site (Rob, 2026-10-27). Make them real buttons with one visual weight.

## Read first
- .claude/project.md (KC code under `kc/`, relative `.ts` imports; copy and UI rules)
- The dashboard-action-buttons entry in kc/BOARD.md (the spec)
- kc/dashboard.tsx (the actions section) and components/ui/button.tsx (variants, `asChild`)
- kc/tests/dashboard-sections.test.ts and kc/tests/dashboard.test.ts (source-read test style)
- c:/personas/cas/memory/design-slop.md (no filled-next-to-outlined pair)

## Build
- Each quick action renders as `<Button asChild variant=... >` around the existing `Link`, the same variant for every action (one visual weight; no filled primary beside an outlined one), at least 44px tall (`min-h-11`).
- No `underline` / `hover:underline` classes left on the actions.
- Mobile first: the list wraps on a phone (actions may go full width or wrap), and sits in a row from the 600px container width (use the container query or breakpoint style already used in the file).
- Keep the existing icon glyph and label text; no new copy.
- Run the avoid-ai-design skill on the result (Skill tool); if refused, say so in result.md.

## Files you may touch
- `kc/dashboard.tsx` (actions section only)
- `kc/tests/dashboard-sections.test.ts` or `kc/tests/dashboard.test.ts`
- `.claude/work/82-dashboard-action-buttons/result.md`, `progress.md`

## Done-test
A test asserting each quick action renders through `Button` (with `asChild` around `Link`) and that no `underline` class remains on them, and that a single variant is used for all actions.

Mutation check through the runner: put the plain `Link` with its underline classes back (a test fails); restore.

At the end, each exit 0 on the final tree:
- `node C:\Users\roban\.claude\bin\project-test.cjs kc/tests/<the file you extended>.test.ts`
- `npx tsc --noEmit`, `npx eslint kc`

## Boundaries
No commit, no push, no npm install, no package.json edits, no network in tests, no .env.

## Progress
Keep `progress.md` beside this file from your first step, one line per step that changes a file or finishes a unit of work: done, files, next, anything half-written. Already there? You are resuming: read it and check the disk against it first.
