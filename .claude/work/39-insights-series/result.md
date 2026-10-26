# 39 result

Files changed: `kc/insights/series.ts` (new), `kc/insights/cloudflare.ts` (series request and parser added, 28-day query untouched), `kc/insights/reports.ts` (`dailyReport`), `kc/insights/route.ts` (`loadSeries`, `defaultSeriesCache`).

Tests added: `kc/tests/insights-series.test.ts` (10 tests), with the fixtures `cloudflare-series.json` and `ga4-series.json`. Green, 260/260. The runner ran the whole suite even though I gave it the file, so the existing insights tests pass unchanged too.

Mutation check:
- Bucketing by UTC date failed the late-evening test, plus both-sources and cache-by-site.
- Asking GA4 before Cloudflare failed both-sources and the 500 fallback test.
- Restored, then green.

Calls I made:
- The cache is keyed by the `site` string the caller passes, not by siteTag.
- A failure is not cached, so the next load tries again.
- The query window is now minus 91 days. It covers 90 Toronto days ending today and stays under the 93-day limit.
- GA4 asks for `89daysAgo` to `today`.

Field names:
- Cloudflare `datetime_geq`/`datetime_lt`/`datetimeHour` come from chris-adams `stats.mjs`, checked live on 2026-10-23.
- GA4 `date`/`sessions`/`screenPageViews` cite the api-schema URL. I did not check them live myself.

Gate fix: the test helper `day` was typed `{ day: string }[]`, so `.visits` failed tsc. It is now generic (`<T extends { day: string }>`) and returns the full point type; no assertion changed. `npx tsc --noEmit && npx eslint kc` exits 0; done-test green, 260/260.

Not done: there is no UI.
