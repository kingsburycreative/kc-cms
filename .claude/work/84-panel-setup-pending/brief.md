# 84. Dashboard panels get setup-pending and could-not-load states (Normal)

## Objective
Empty dashboard panels (the Visits card, the "Not available" stat boxes) show a bare phrase or blank space (Rob, 2026-10-27). Each panel keeps its heading and size and shows one of two states: "not set up" (the site has no analytics IDs) says in one plain sentence that numbers start showing once analytics is connected; "couldn't load" (IDs set, the fetch failed) says the numbers could not be loaded right now. For staff only, the not-set-up state links to the staff strip's analytics IDs form. With data present, behaviour is unchanged.

## Read first
- .claude/project.md (upstream rule, Copy rule, never touch kc/insights/ beyond reading: it is a risky path, so do not edit it)
- The panel-setup-pending entry in kc/BOARD.md (the spec)
- kc/dashboard-server.tsx: `VISITS_FALLBACK`, `NOT_AVAILABLE`, how series and stats are fetched, and how it knows whether IDs exist (insights_keys table read, then insights.json fallback; see the insights-keys-editor work in .claude/work/80-*/result.md)
- kc/dashboard.tsx and the staff strip's analytics IDs form (find its anchor or id so the staff link can target it; add an id in kc/ if none exists)
- kc/tests/dashboard-server.test.ts (test style)

## Build
- A small pure helper under `kc/` (relative `.ts` imports) that takes "IDs configured?", "fetch ok?" and "is staff?" and returns the panel state: data, not-set-up (with or without staff link), or could-not-load. Test it.
- Use it in kc/dashboard-server.tsx for the Visits card and each stat box. Panels keep heading and size; no blank gap; text wraps at 375px. Mobile first.
- The staff link is a plain text link to the analytics IDs form, rendered only when the viewer is staff.
- Copy: write both sentences and the link text with the `prose` skill, then run them through `avoid-ai-writing` and `humanizer` (Skill tool). Run `avoid-ai-design` on the UI. If the Skill tool refuses any, stop and say so in result.md. List each piece of copy in result.md.

## Files you may touch
- `kc/dashboard-server.tsx`, `kc/dashboard.tsx`
- `kc/panel-state.ts` (new helper)
- `kc/tests/dashboard-server.test.ts`, `kc/tests/panel-state.test.ts` (new)
- `kc/register/customizations.json` (only if an upstream file must change; avoid that)
- `.claude/work/84-panel-setup-pending/result.md`, `progress.md`

## Done-test
Extend kc/tests/dashboard-server.test.ts (and the new helper test): no IDs gives the setup-pending state; IDs set with a failed fetch gives the could-not-load state; the staff link is shown to staff only, never to clients. Source-read tests are fine where rendering is not possible under node --test.

Mutation check through the runner: collapse both states into one (a test fails); show the staff link to clients (a test fails); restore.

At the end, each exit 0 on the final tree:
- `node C:\Users\roban\.claude\bin\project-test.cjs kc/tests/panel-state.test.ts` and each test file you changed
- `npx tsc --noEmit`, `npx eslint kc`

## Boundaries
No commit, no push, no npm install, no package.json edits, no network in tests, no .env, no edits under kc/insights/.

## Progress
Keep `progress.md` beside this file from your first step, one line per step that changes a file or finishes a unit of work: done, files, next, anything half-written. Already there? You are resuming: read it and check the disk against it first.
