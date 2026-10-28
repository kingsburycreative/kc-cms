# 87. One setup banner when analytics is not set up (Normal)

## Objective
On a site with no analytics IDs (seen on Henike, Rob 2026-10-28) the Visits panel and the three stat tiles each repeat "Shows once analytics is connected" with their own "Add the analytics IDs" link: four links. Show one setup banner in the Visits panel's place (one plain sentence, the staff-only link once) and hide the three tiles until analytics is set up. The "couldn't load" state (IDs set, fetch failed) keeps its own per-panel state, unchanged. In the page header, the bare "Not set up yet" in the slot where "See live site" sits must name what it is: "Live site not set up yet" (final wording through the copy skills). The sidebar's own "Not set up yet" lines stay as they are.

## Read first
- .claude/project.md (upstream rule, Copy rule; kc/insights/ is a risky path, read only)
- The setup-banner entry in kc/BOARD.md (the spec)
- .claude/work/84-panel-setup-pending/result.md and .claude/work/83-sidebar-not-set-up/result.md (what built the current states)
- kc/panel-state.ts, kc/not-set-up.ts, kc/dashboard-server.tsx, kc/dashboard.tsx
- kc/tests/panel-state.test.ts, kc/tests/not-set-up.test.ts, kc/tests/dashboard-server.test.ts (test style)

## Build
- Not set up: one banner where the Visits panel sits, same footprint, text wraps at 375px, mobile first. The staff link renders once and only for staff. The three tiles are not rendered.
- Could not load and data states: unchanged.
- Header slot: a separate constant for the live-site text (keep `NOT_SET_UP` for the sidebar) used where the header shows it.
- Copy: write the banner sentence, link text and header text with the `prose` skill, then `avoid-ai-writing` and `humanizer` (Skill tool). Run `avoid-ai-design` on the banner. If the Skill tool refuses any, stop and say so in result.md. List each piece of copy in result.md.

## Files you may touch
- `kc/panel-state.ts`, `kc/not-set-up.ts`, `kc/dashboard.tsx`, `kc/dashboard-server.tsx`
- `kc/tests/panel-state.test.ts`, `kc/tests/not-set-up.test.ts`, `kc/tests/dashboard-server.test.ts`, `kc/tests/dashboard.test.ts`, `kc/tests/dashboard-visits.test.ts`, `kc/tests/sidebar-dashboard.test.ts`, `kc/tests/dashboard-sections.test.ts`
- `.claude/work/87-setup-banner/result.md`, `progress.md`

## Done-test
Tests that a not-set-up site renders the setup text and the staff link exactly once (staff) and no tiles, never the link for clients; a could-not-load site still renders its own state; the header slot text names the live site. Source-read tests are fine where rendering is not possible under node --test.

Mutation check through the runner: render the tiles again when not set up (a test fails); restore.

At the end, each exit 0 on the final tree:
- `node C:\Users\roban\.claude\bin\project-test.cjs kc/tests/<file>.test.ts` for each test file you changed
- `npx tsc --noEmit`, `npx eslint kc`

## Boundaries
No commit, no push, no npm install, no package.json edits, no network in tests, no .env, no edits under kc/insights/.

## Progress
Keep `progress.md` beside this file from your first step, one line per step that changes a file or finishes a unit of work: done, files, next, anything half-written. Already there? You are resuming: read it and check the disk against it first.
