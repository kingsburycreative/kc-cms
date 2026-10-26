# 39. Insights history series from Cloudflare and GA4 (Risky)

## Objective
Board card 28 (`.claude/work/38-plan-insights-charts/plan.md` card 28). A server-side loader returns one daily series per site (visits and page views per day for the last 90 days, Toronto days, zero-filled), with 7, 30 and 90 day slices of the same list. Cloudflare first, GA4 as the fallback, no series (never a throw) when both fail. No UI in this card.

## Read first
- `D:\Dev\htdocs\kc-cms-app\.claude\project.md` (relative `.ts` imports in `kc/`, risky paths, Never list)
- Card 28 and Flags 3 to 6 in `D:\Dev\htdocs\kc-cms-app\.claude\work\38-plan-insights-charts\plan.md`
- `D:\Dev\htdocs\chris-adams\lib\stats.mjs`: the Cloudflare query shape verified live on 2026-10-23 (`datetime_geq`/`datetime_lt`, type `Time!`, `dimensions { datetimeHour }`, Toronto day bucketing). Read only; copy the shape, not the file.

## Start here
- `kc/insights/cloudflare.ts`: add a series request and parser beside the existing 28-day ones. Do not change the existing query (Flag 3).
- `kc/insights/reports.ts`: add a GA4 daily report: dimension `date`, metrics `sessions`, `screenPageViews`. Cite the GA4 api-schema URL in a comment.
- New `kc/insights/series.ts`: the range list (7, 30, 90), Toronto day bucketing (use `Intl.DateTimeFormat` with `America/Toronto`, not a fixed offset), zero-filled daily points, slicing.
- `kc/insights/route.ts`: `loadSeries`, a one-hour cache keyed by site (reuse `createCache`, line 44), Cloudflare first, GA4 fallback, one status-only log line on a Cloudflare failure (never the token or account id), following `loadSiteInsights` (line 184).
- Done-test: `node C:\Users\roban\.claude\bin\project-test.cjs kc/tests/insights-series.test.ts`

## Files you may touch
- `D:\Dev\htdocs\kc-cms-app\kc\insights\series.ts` (new)
- `D:\Dev\htdocs\kc-cms-app\kc\insights\cloudflare.ts`
- `D:\Dev\htdocs\kc-cms-app\kc\insights\reports.ts`
- `D:\Dev\htdocs\kc-cms-app\kc\insights\route.ts`
- `D:\Dev\htdocs\kc-cms-app\kc\tests\insights-series.test.ts` (new)
- `D:\Dev\htdocs\kc-cms-app\kc\tests\fixtures\insights\` (new series fixtures for both APIs only)
- `D:\Dev\htdocs\kc-cms-app\.claude\work\39-insights-series\result.md` and `progress.md` (new)

## Done-test
`node --test kc/tests/insights-series.test.ts` passes, then `npx tsc --noEmit && npx eslint kc` exit 0. Asserts from fixtures: the request uses `datetime_geq`/`datetime_lt` and `datetimeHour` with a window under 93 days; a day with no rows comes back as zeros; a late-evening Toronto hour (e.g. 02:00 UTC) lands on the Toronto day before; 7, 30 and 90 are slices of the same list; GA4 `YYYYMMDD` parses to the right day; with both sources the series comes from Cloudflare, with only GA4 from GA4; a 500 from Cloudflare falls back to GA4; the log line holds the status and no token; the cache is keyed by site (two sites do not share a series). Existing insights tests keep passing unchanged.

Mutation check, through the runner: bucket by UTC date and name the failing late-evening test; swap the source order and name the failing both-sources test; restore and run green. Every run filtered to the done-test file.

## Boundaries
No commit, no push, no install, nothing outward. No `package.json` or `db/migrations/` change. No real network calls in tests (inject `fetchFn`). Never read a secret or `.env`. No client-facing copy. Keep `progress.md` beside this brief, updated after each step that changes a file.

## Report
`result.md` beside this file, under 200 words: files changed, tests added, the mutation result naming the failing tests, which field names are cited to docs and which are unverified, what was not done.
