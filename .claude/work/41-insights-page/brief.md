# 41. Charts on the Insights page, with their copy (Risky)

## Objective
Board card 30 (`.claude/work/38-plan-insights-charts/plan.md` card 30). Load the 90-day series on the Insights page and render a charts section (heading, the card 29 `InsightsChart`, two info notes) above the existing text cards. Risky because the new file sits under `kc/insights/`, which holds the GA4 key at runtime: no token, key or env value may reach the client component's props.

## Read first
- `D:\Dev\htdocs\kc-cms-app\.claude\project.md` (upstream-file rule, Copy rule, Never list)
- Card 30 in `D:\Dev\htdocs\kc-cms-app\.claude\work\38-plan-insights-charts\plan.md`
- `kc/insights/route.ts` (`loadSeries`, `SeriesOptions`, line ~254), `kc/insights/series.ts`, `kc/insights/chart.tsx`
- `app/(main)/[owner]/[repo]/[branch]/insights/page.tsx`

## Start here
- New `kc/insights/charts-section.tsx`: takes only a `Series` (days and `from`) as props. Heading, the chart, an info note on visit versus page view in plain words for a client, and when `from` is `ga4` a line that it counts visitors who allowed analytics. Cloudflare label rules stay as card 25 set them. Mobile first.
- Page: smallest change. Call `loadSeries` server-side with the same sources and key the page already passes to `loadSiteInsights`; on `null` or a throw, render no charts section and keep every text card. Charts section above the cards.
- Done-test: `node C:\Users\roban\.claude\bin\project-test.cjs kc/tests/insights-page.test.ts`

## Files you may touch
- `D:\Dev\htdocs\kc-cms-app\app\(main)\[owner]\[repo]\[branch]\insights\page.tsx` (upstream-tree file KC already edits)
- `D:\Dev\htdocs\kc-cms-app\kc\insights\charts-section.tsx` (new)
- `D:\Dev\htdocs\kc-cms-app\kc\tests\insights-page.test.ts` (new)
- `D:\Dev\htdocs\kc-cms-app\.claude\work\41-insights-page\result.md` and `progress.md` (new)

## Copy and design
The heading and both info notes are client-facing: write them with the `prose` skill, then `avoid-ai-writing` and `humanizer`, each with the Skill tool. Run `avoid-ai-design` on the section. If the Skill tool refuses any, stop and say so in result.md. List each piece of copy in result.md.

## Done-test
`node --test kc/tests/insights-page.test.ts` passes, then `npx tsc --noEmit && npx eslint kc` exit 0. Source tests: the page calls `loadSeries` and still renders all five text cards; the charts section sits above the cards; the series failure path leaves the cards; the charts section props carry no key or token; no em dash, "leverage" or "robust" in the new copy; both info notes exist.

Mutation check, through the runner, filtered to the done-test file: remove the charts section from the page and name the failing test; restore and run green.

## Boundaries
No commit, no push, no install, nothing outward. No `package.json`, lock file or `db/migrations/` change. No other existing file. Keep `progress.md` beside this brief, updated after each step that changes a file.

## Report
`result.md` beside this file, under 200 words: files changed, tests added, the mutation result naming the failing test, the copy written and which skills ran, what was not seen in a browser.
