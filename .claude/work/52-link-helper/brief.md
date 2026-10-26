# 52. Link helper in `kc/` and the repo chrome (Normal)

## Objective
Board card 49 (`.claude/work/40-plan-short-urls/plan.md` card 49). Wrap every in-app page link in `kc/` and the repo chrome in `shortHref(...)` from `kc/short-url.ts`, so KC's own links use the short address.

## Read first
- `D:\Dev\htdocs\kc-cms-app\.claude\project.md` (upstream files, relative `.ts` imports, tests)
- Design, Flags and card 49 in `.claude/work/40-plan-short-urls/plan.md` (the spec; follow it exactly)
- `kc/short-url.ts` and `kc/tests/short-url.test.ts`

## Start here
- Find `shortHref` in `kc/short-url.ts` (if card 47 did not export one by that name, add the smallest one there that returns the short form via the existing functions, with tests). Then go file by file through the list below, wrapping page hrefs only. `/api/`, `github.com` and `raw.githubusercontent.com` strings stay as they are. Upstream files under `components/` are touched only on the page-link lines plus one import line.

## Files you may touch
- `kc/short-url.ts` (only to add or export `shortHref`), `kc/tests/short-url.test.ts`
- `kc/client-view.ts`, `kc/dashboard.ts`, `kc/dashboard.tsx`, `kc/history/history-view.tsx`
- `components/repo/repo-nav.tsx`, `components/repo/repo-sidebar.tsx`, `components/repo/repo-dropdown.tsx`, `components/repo/repo-branches.tsx`, `components/repo/repo-latest.tsx`, `components/repo/repo-action-buttons.tsx` (line 381 only), `components/repo/repo-templates.tsx` (line 101) (upstream, smallest change)
- `kc/tests/dashboard.test.ts`, `kc/tests/client-view.test.ts`, and one new `kc/tests/short-href-links.test.ts` if the `/api/` count source test fits better there
- `.claude/work/52-link-helper/result.md` and `progress.md` (new)

## Done-test
`node C:\Users\roban\.claude\bin\project-test.cjs kc/tests/dashboard.test.ts kc/tests/client-view.test.ts kc/tests/short-url.test.ts` (plus the new test file if made) passes, then `npx tsc --noEmit && npx eslint kc` exit 0. Every assert under card 49's done-test in the plan: owner `kingsburycreative` + branch `main` gives `/besciworks/...` hrefs in `quickActions` and `dashboardTiles`; owner `acme` or branch `dev` keep the full form; the one-repo client link is `/besciworks`; a source test pins the `/api/` literal count across the touched files to the number recorded before your edit.

Mutation check, through the runner: make `shortHref` return its input; name the dashboard and client-view tests that fail, restore, run green.

## Boundaries
No commit, no push, no install, no network. No file outside the list, no `package.json`, lock file or `db/migrations/`. Never read or print a secret or `.env`. No client-facing copy changes. Keep `progress.md` beside this brief, updated after each step that changes a file: done so far, files touched, next step, anything half-written.

## Report
`result.md` beside this file, under 200 words: files changed, tests added, the mutation result naming the failing tests, anything left undone.
