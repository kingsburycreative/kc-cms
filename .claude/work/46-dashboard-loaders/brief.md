# 46. Server loaders and skeletons (Risky)

## Objective
Board card 39 (`.claude/work/39-plan-dashboard/plan.md` card 39). Build the dashboard's async server panels and their skeletons, as new files only. No page wiring (card 40 does that). `PublishStatus` is out of scope: card 43 builds its state and the component.

## Read first
- `D:\Dev\htdocs\kc-cms-app\.claude\project.md` (relative `.ts` imports in `kc/`, Copy rule, Never list, risky paths)
- Card 39 in `D:\Dev\htdocs\kc-cms-app\.claude\work\39-plan-dashboard\plan.md` (the spec; follow it except PublishStatus)
- `kc/insights/series.ts`, `kc/insights/route.ts` (`loadSeries`, `defaultSeriesCache`, `insightsSourcesFor`), `kc/insights/gate.ts` (`getInsightsAccess`), `kc/insights/chart.tsx` (`MetricChart` compact), `kc/seo/site.ts`, `kc/update/status.ts` and `status-fetch.ts`, `kc/dashboard.ts`, `kc/dashboard-visits.ts`, `kc/dashboard.tsx`
- The mockup in `.claude/work/39-plan-dashboard/mockup/` for panel heights and motion

## Start here
- `kc/dashboard-server.tsx`: async `VisitsPanel` (only behind `getInsightsAccess`; `loadSeries` with `defaultSeriesCache` keyed on the site from `insightsSourcesFor`, never the user; null when no sources; a short fallback line when the series is null, never a throw), `SearchHealthPanel` (`getCollectionCache` + `parse` per collection into `siteHealth`), `VersionLine` (staff get the full status, clients only `{state}`, decided on the server).
- `kc/dashboard-skeleton.tsx`: one skeleton per panel at its final height, `animate-pulse` with `motion-reduce:animate-none`. Crossfade and once-on-mount motion as the card says, all off under reduced motion.

## Files you may touch
- `D:\Dev\htdocs\kc-cms-app\kc\dashboard-server.tsx` (new)
- `D:\Dev\htdocs\kc-cms-app\kc\dashboard-skeleton.tsx` (new)
- `D:\Dev\htdocs\kc-cms-app\kc\tests\dashboard-server.test.ts` (new)
- `D:\Dev\htdocs\kc-cms-app\.claude\work\46-dashboard-loaders\result.md` and `progress.md` (new)

If a pure helper needs splitting out for unit tests, put it inside `kc/dashboard-server.tsx` or say in result.md why you could not; no other file.

## Copy
The fallback line and any labels or aria text are client-facing: write them with the `prose` skill, then `avoid-ai-writing` and `humanizer`, via the Skill tool. Run `avoid-ai-design` on the skeletons. If the Skill tool refuses one, stop and say so in result.md. List each string in result.md.

## Done-test
`node C:\Users\roban\.claude\bin\project-test.cjs kc/tests/dashboard-server.test.ts` passes, then `npx tsc --noEmit && npx eslint kc` exit 0. Asserts: the visits panel is only built behind `getInsightsAccess`; the cache key is the site, not the user; a client's version props hold no `tag`, `url` or version string; a null series renders the fallback, not a throw; each skeleton has `animate-pulse` and `motion-reduce:animate-none`; no token, account id or key file name appears in any prop.

Mutation check, through the runner: pass the full version object to clients and name the failing client-props test; drop the access check and name the failing gate test; restore and run green.

## Boundaries
No commit, no push, no install, no network in tests, nothing outward. No `package.json`, lock file or `db/migrations/` change; no upstream file edited. Never read or print a secret or `.env`. Keep `progress.md` beside this brief, updated after each step that changes a file: done so far, files touched, next step, anything half-written.

## Report
`result.md` beside this file, under 200 words: files changed, tests added, the mutation result naming the failing tests, copy strings, what was not done.
