# 40. Insights chart component on uPlot (Normal)

## Objective
Board card 29 (`.claude/work/38-plan-insights-charts/plan.md` card 29). A client component that draws one line-and-fill chart per metric (visits, page views) from the daily series card 28 built, with a 7/30/90 range toggle, a text summary and a "Show the numbers" table. No page wiring in this card (that is card 30).

## Read first
- `D:\Dev\htdocs\kc-cms-app\.claude\project.md` (relative `.ts` imports in `kc/`, the Copy rule, Never list)
- Card 29 in `D:\Dev\htdocs\kc-cms-app\.claude\work\38-plan-insights-charts\plan.md`
- `D:\Dev\htdocs\kc-cms-app\kc\insights\series.ts` (the series and range types you take as props)
- `D:\Dev\htdocs\chris-adams\public\stats\` (reference page using uPlot 1.6.32; read only)

## Start here
- New `kc/insights/chart-model.ts`: pure functions only (axis labels, tooltip text, summary sentence, table rows newest first, compact numbers: 950 -> `950`, 3690 -> `3.69k`). No React, no uplot import, so the test runner can load it.
- New `kc/insights/chart.tsx`: `"use client"`; load `uplot` with `await import("uplot")` inside a `useEffect`, never a top-level import; CSS from `uplot/dist/uPlot.min.css`. Toggle buttons with `aria-pressed`; touch-friendly tooltip; height 170 below `sm`, 200 above; resizes with its card; colours read from computed styles; y axis from zero. Before uPlot draws, a skeleton of the final height shimmers (`animate-pulse` or similar) with `motion-reduce:animate-none` beside it. Each chart's `aria-label` is the summary sentence; a `<details>` table holds the numbers. Without JS the totals and the table still render. Data comes in as props; the toggle makes no network call.
- Done-test: `node C:\Users\roban\.claude\bin\project-test.cjs kc/tests/insights-chart.test.ts`

## Files you may touch
- `D:\Dev\htdocs\kc-cms-app\kc\insights\chart-model.ts` (new)
- `D:\Dev\htdocs\kc-cms-app\kc\insights\chart.tsx` (new)
- `D:\Dev\htdocs\kc-cms-app\kc\tests\insights-chart.test.ts` (new)
- `D:\Dev\htdocs\kc-cms-app\.claude\work\40-insights-chart\result.md` and `progress.md` (new)

## Copy and design
The summary sentence, the toggle labels, "Show the numbers", table headers and tooltip text are client-facing: write them with the `prose` skill, then run them through `avoid-ai-writing` and `humanizer`, each with the Skill tool. Run `avoid-ai-design` on the component. If the Skill tool refuses any of them, stop and say so in result.md. List each piece of copy in result.md. Mobile first: base styles for the phone, `sm:` and up layered on.

## Done-test
`node --test kc/tests/insights-chart.test.ts` passes, then `npx tsc --noEmit && npx eslint kc` exit 0. Asserts: the summary sentence for a one-visit, a zero and a many-visit range (singular/plural right); the table has one row per day, newest first; 950 formats as `950` and 3690 as `3.69k`; a source test finds `import("uplot")` inside `chart.tsx` and no top-level `uplot` import, `motion-reduce` beside the shimmer class, `aria-pressed`, and a `<details>` table.

Mutation check, through the runner: import uplot at the top of `chart.tsx` and name the failing source test; drop the table and name the failing table test; restore and run green. Every run filtered to the done-test file.

## Boundaries
No commit, no push, no install, nothing outward. No `package.json`, lock file or `db/migrations/` change; uplot 1.6.32 is already installed. No change to any existing file. Keep `progress.md` beside this brief, updated after each step that changes a file.

## Report
`result.md` beside this file, under 200 words: files changed, tests added, the mutation result naming the failing tests, the copy written and which skills ran, what was not done or not seen in a browser.
