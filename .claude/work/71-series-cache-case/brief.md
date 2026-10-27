# 71. Insights page keys the series cache on seriesSiteKey (Normal)

## Objective
The dashboard keys the shared series cache on `seriesSiteKey(owner, repo)` (lowercased), but the Insights page still passes `` `${owner}/${repo}` `` as typed (app/(main)/[owner]/[repo]/[branch]/insights/page.tsx, the `loadSeries` call near line 87). A mixed-case URL therefore misses the cache the dashboard filled and adds a second entry. After this card the page passes `seriesSiteKey(owner, repo)`. The series cache is already capped (`createCache` with `CACHE_MAX` in kc/insights/route.ts); do not change route.ts.

## Read first
- D:/Dev/htdocs/kc-cms-app/.claude/project.md (upstream rule, Never list)
- app/(main)/[owner]/[repo]/[branch]/insights/page.tsx
- kc/tests/insights-page.test.ts and kc/tests/dashboard-server.test.ts lines 45-55 (how a source test asserts the dashboard uses seriesSiteKey)

## Start here
- Import `seriesSiteKey` from "@/kc/insights/route" alongside the existing imports, and use it for `site:` in the loadSeries call.
- Done-test command: `node C:\Users\roban\.claude\bin\project-test.cjs kc/tests/insights-page.test.ts` (if the runner refuses a path argument, follow what other briefs in .claude/work do).

## Files you may touch
- `app/(main)/[owner]/[repo]/[branch]/insights/page.tsx` (the one-line hook plus the import)
- `kc/tests/insights-page.test.ts`

## Done-test
In kc/tests/insights-page.test.ts, reading the page source: the loadSeries call passes `site: seriesSiteKey(owner, repo)`, the page does not contain `` site: `${owner}/${repo}` ``, and seriesSiteKey is imported from the insights route module. Existing tests still pass.

Mutation check through the runner: put back the template-literal site, run, name the tests that failed, restore, run green.

## Boundaries
No commit, no push, no install, nothing outward, no network. No user-facing copy. Do not touch kc/insights/.

## Progress
Keep `progress.md` beside this file from your first step, one line per step that changes a file or finishes a unit of work: done, files, next, anything half-written. Already there? You are resuming: read it and check the disk against it first.

## Report
Write `result.md` beside this file, under 200 words: files changed, tests added, the mutation result naming the tests that failed, and what was not done.
