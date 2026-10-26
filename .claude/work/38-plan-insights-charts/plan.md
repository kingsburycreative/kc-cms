# Plan: charts and history on Insights (Rob, 2026-10-26)

Rob: "update the besciworks insight to show the graphs and historic data", modelled on Chris Adams's /stats page. Every site in the insights map gets it. The text cards stay.

## Flags

1. **The dependency has no way past `project.md`.** `.claude/project.md` says never edit `package.json` or `package-lock.json`, never run `npm install`, and a new dependency parks the card. There is no exception path, so the coordinator must clear it: a person runs the install (card 27) before card 29 can start. Both files are upstream files, so the one-line `package.json` change may conflict on an upstream merge; resolve by keeping the line.
2. **Version: `1.6.32`**, the one Chris Adams vendors (`D:\Dev\htdocs\chris-adams\public\stats\uPlot.LICENSE.txt`, lines 1-2). Pin exactly, no caret.
3. **Card 25's Cloudflare query may be wrong.** `kc/insights/cloudflare.ts` filters on `date_geq` with `Date!` variables and says its field names are unverified. Chris Adams's `lib/stats.mjs` verified `datetime_geq` and `datetime_lt` (type `Time!`) with `dimensions { datetimeHour }` against the live API on 2026-10-23. Card 28 uses the verified shape. The old 28-day query is not touched here; if the live check (card 32) fails it, that is a separate fix.
4. **History depth.** Chris's notes: Cloudflare allows 93 days per query and keeps 184 days. The ranges are 7, 30 and 90 days, inside both. Anything longer needs stored history, which this plan does not build. The API-only decision holds up to about six months.
5. **Visits by day.** Summing GA4 `activeUsers` over days counts a returning person each day, but it is not Cloudflare's "visit". Card 28 uses GA4 `sessions` and `screenPageViews`. Check both names at the api-schema URL in the card.
6. **Day boundaries.** Cloudflare buckets by UTC hour; GA4 by the property's time zone. Cloudflare days are cut in `America/Toronto`, as Chris does. Fine for Ontario clients; a client elsewhere would need a per-site zone.
7. **Not tried live.** Token scope for BeSciWorks's site tag and the two GA4 metrics are checked only at deploy (card 32).
8. I cannot edit `kc/BOARD.md`. The coordinator adds cards 27 to 32 there.

## Cards

### 27. Add uplot 1.6.32 (waiting on Rob or the coordinator)
Role: waiting on a person. Risky path: no.
- `package.json`
- `package-lock.json`

New dependency uplot approved by Rob, 2026-10-26, for kc-cms globally. A person runs `npm install --save-exact uplot@1.6.32` in `D:\Dev\htdocs\kc-cms-app` and commits the two files; the loop must not.

Done-test: `node -e "const p=require('./package.json');process.exit(p.dependencies.uplot==='1.6.32'?0:1)"` exits 0, the lock holds `node_modules/uplot` at `1.6.32`, and `Test-Path node_modules\uplot\dist\uPlot.esm.js` is true.

### 28. History series from Cloudflare and GA4
Role: `implementer`. Risky path: yes (`kc/insights/`, token-bearing calls).
- `kc/insights/series.ts` (new: range list, Toronto day bucketing, zero-filled daily points, slicing 7/30/90)
- `kc/insights/cloudflare.ts` (series request and parser)
- `kc/insights/reports.ts` (GA4 daily report: dimension `date`, metrics `sessions`, `screenPageViews`)
- `kc/insights/route.ts` (`loadSeries`, one-hour cache keyed by site, Cloudflare first, GA4 fallback, status-only log line)
- `kc/tests/insights-series.test.ts` (new)
- `kc/tests/fixtures/insights/` (series fixtures for both APIs)

One 90-day query per source fills every range, as on Chris's page. Cite the docs URL for each field in a comment. A failure returns no series, never a thrown page.

Done-test: `node --test kc/tests/insights-series.test.ts`, then `npx tsc --noEmit && npx eslint kc`. Asserts from fixtures: the request uses `datetime_geq`/`datetime_lt` and `datetimeHour` and a window under 93 days; a day with no rows comes back as zeros; a late-evening Toronto hour lands on the Toronto day; 7, 30 and 90 are slices of the same list; GA4 `YYYYMMDD` parses to the right day; with both sources the series comes from Cloudflare, with only GA4 from GA4; a 500 from Cloudflare falls back to GA4; the log line holds the status and no token. Mutation check: bucket by UTC date and the late-evening test fails; swap the source order and the both-sources test fails.

### 29. Chart component
Role: `implementer`. Risky path: no. Waits on 27.
- `kc/insights/chart-model.ts` (new: axis labels, tooltip text, summary sentence, table rows, compact numbers)
- `kc/insights/chart.tsx` (new: client component, loads `uplot` by dynamic import inside an effect, CSS from `uplot/dist/uPlot.min.css`)
- `kc/tests/insights-chart.test.ts` (new)

Behaviour: a line-and-fill chart per metric (visits, page views), a 7/30/90 toggle with `aria-pressed`, tooltip that works by touch, height 170 below the `sm` width and 200 above, resize with the card, colours read from the page's computed styles, y axis starts at zero. Before uPlot loads, a skeleton of the final height shimmers; under `prefers-reduced-motion` it holds still. Each chart has a text summary ("1,240 visits, 12 Oct to 25 Oct") as its `aria-label` and a "Show the numbers" `<details>` table. Without JS the totals and the table still show. The component takes data as props and makes no network call on toggle. Uses `avoid-ai-design`.

Done-test: `node --test kc/tests/insights-chart.test.ts`, then `npx tsc --noEmit && npx eslint kc`. Asserts: summary sentence for a one-visit, a zero and a many-visit range; the table has one row per day, newest first; `chart-model` formats 950 as `950` and 3690 as `3.69k`; a source test finds `import("uplot")` inside `chart.tsx` and no top-level `uplot` import, `motion-reduce` beside the shimmer class, `aria-pressed`, and a `<details>` table. Mutation check: import uplot at the top of `chart.tsx` and the source test fails; drop the table and the table test fails.

### 30. Page wiring and copy
Role: `implementer`. Risky path: no (reads the loader, handles no token). Waits on 28 and 29.
- `app/(main)/[owner]/[repo]/[branch]/insights/page.tsx` (upstream-tree file KC already edits; the smallest change: load the series, render the charts above the cards)
- `kc/insights/charts-section.tsx` (new: heading, toggle, two charts, info notes)
- `kc/tests/insights-page.test.ts` (new)

Info notes explain visit versus page view for a client, as Chris's do. When the series came from GA4 only, a line says it counts visitors who allowed analytics; the Cloudflare label rules stay as card 25 set them. A series failure drops the charts and leaves every text card. All copy goes through the `prose`, `avoid-ai-writing` and `humanizer` skills with the Skill tool, listed in result.md. Checked at 375, 768 and 1024 with no sideways scroll.

Done-test: `node --test kc/tests/insights-page.test.ts`, then `npx tsc --noEmit && npx eslint kc`. Source tests: the page calls `loadSeries` and still renders all five text cards; the charts section sits above the cards; no em dash, "leverage" or "robust" in the new copy; both info notes exist. Mutation check: remove the charts section from the page and the test fails.

### 31. Security audit of the series loader
Role: `security-auditor`. Risky path: yes.
- `kc/insights/series.ts`
- `kc/insights/cloudflare.ts`
- `kc/insights/reports.ts`
- `kc/insights/route.ts`

Done-test: result names each finding by file and line, none high left open; confirms no token or account id reaches a log line or the page's props, the series cache is keyed by site so one client cannot read another's, and `node --test "kc/tests/**/*.test.ts"` is green.

### 32. Live check and deploy (waiting on Rob)
Role: waiting on Rob. Risky path: no (box step).
- `D:\Dev\htdocs\kc-cms\server\deploy.sh`

Done-test: after the deploy, signed in as the `+kctest` client, the BeSciWorks Insights page shows both charts with real numbers that match Cloudflare's dashboard within bots (Chris's page notes Cloudflare's own overview counts more), the toggle changes the chart without a network request (browser network tab), and a phone-width check at 375 shows the menu, the charts and no sideways scroll. This is also where the Cloudflare token scope and GA4 `sessions` are proven.
