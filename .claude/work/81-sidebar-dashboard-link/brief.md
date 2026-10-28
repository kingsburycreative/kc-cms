# 81. Sidebar Dashboard link (Normal)

## Objective
The sidebar has no Dashboard link on any site (Rob, 2026-10-27, seen on BeSciWorks and Henike). Add one as the first sidebar item, pointing at the repo/branch root, marked current on the dashboard only.

## Read first
- .claude/project.md (upstream rule: `components/repo/repo-sidebar.tsx` is an upstream file; smallest hook)
- The sidebar-dashboard-link entry in kc/BOARD.md (the spec)
- components/repo/repo-sidebar.tsx (how items, `shortHref` and active state work; note the existing `pathname.startsWith(href/)` match would mark the root active on every page, so the Dashboard item must match the root exactly)
- kc/tests/sidebar-groups.test.ts and kc/tests/dashboard-sections.test.ts (source-read test style)
- kc/register/customizations.json (the entry that claims repo-sidebar.tsx)

## Build
- A Dashboard item first in the sidebar, href `shortHref(\`/${owner}/${repo}/${encodeURIComponent(branch)}\`)`, same row style as the other items, at least 44px tap target.
- `aria-current="page"` and the active style only when the pathname is exactly the root (with or without trailing slash), never on child pages.
- The label is the single word "Dashboard"; no other copy.
- If KC logic is more than a line or two, put it in a small helper under `kc/` (relative imports with `.ts`) and test the helper.

## Files you may touch
- `components/repo/repo-sidebar.tsx`
- `kc/sidebar-dashboard.ts` (new, optional helper)
- `kc/tests/sidebar-dashboard.test.ts` (new) or `kc/tests/sidebar-groups.test.ts`
- `kc/register/customizations.json` (only to update the repo-sidebar entry's description if needed)
- `.claude/work/81-sidebar-dashboard-link/result.md`, `progress.md`

## Done-test
Tests asserting the Dashboard item comes first (before Media and the content groups), uses the root href through `shortHref`, and is current only on the exact root path (a child path like `/o/r/main/media/x` is not current).

Mutation check through the runner: drop the item (a test fails); move it after Media (a test fails); restore.

At the end, each exit 0 on the final tree:
- `node C:\Users\roban\.claude\bin\project-test.cjs kc/tests/sidebar-dashboard.test.ts` (or the file you extended)
- the register test through the same runner
- `npx tsc --noEmit`, `npx eslint kc`

## Boundaries
No commit, no push, no npm install, no package.json edits, no network in tests, no .env.

## Progress
Keep `progress.md` beside this file from your first step, one line per step that changes a file or finishes a unit of work: done, files, next, anything half-written. Already there? You are resuming: read it and check the disk against it first.
