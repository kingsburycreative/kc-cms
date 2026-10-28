# 100. Chart card width (Risky)

## Objective
The dashboard visits chart fills its card's full width at every width, the last date label is fully shown, and the line is not flat when the site has visits. The cause of each defect is found and stated before it is fixed.

## Read first
- D:\Dev\htdocs\kc-cms-app\CLAUDE.md and D:\Dev\htdocs\kc-cms-app\.claude\project.md
- D:\Dev\htdocs\kc-cms-app\kc\insights\chart.tsx
- D:\Dev\htdocs\kc-cms-app\kc\insights\chart-model.ts
- D:\Dev\htdocs\kc-cms-app\kc\dashboard-server.tsx (where DashboardVisits is rendered, and the days it is given)

## Context
Seen on BeSciWorks at 1280px desktop in session 21: the chart draws at about half the card's width, the line is flat although the site has visits, and the last date label is cut off. Unchecked guess: chart.tsx reads `el.clientWidth` once when uPlot is built (around line 50) and the ResizeObserver watches the same element uPlot fills (around line 81), so a first measure taken before the card has its final width (or a plot that sizes its own container) holds that size. For the flat line check the metric, the range and the data passed in (fixture shape), and whether the plot is just squashed. The last label may need axis padding or a gap on the right series edge.

## Start here
- `kc/insights/chart.tsx:40-90`: the uPlot build and the ResizeObserver.
- Move whatever sizing or data logic the fix needs into a pure function in `kc/insights/chart-model.ts` so it can be tested without a DOM.
- Done-test command: `node C:\Users\roban\.claude\bin\project-test.cjs kc/tests/insights-chart.test.ts`

## Files you may touch
- `kc/insights/chart.tsx`
- `kc/insights/chart-model.ts`
- `kc/insights/charts-section.tsx`
- `kc/dashboard-server.tsx`
- `kc/tests/insights-chart.test.ts`

## Done-test
New fixture tests in `kc/tests/insights-chart.test.ts` on the pure piece the fix lands in (the width or observed element choice, the data series given a fixture with non-zero visits, the right padding that keeps the last label), passing with `node --test kc/tests/insights-chart.test.ts`. Then the mutation check through the runner: break the new code, run the filtered command, name the tests that failed, restore, run green. Never run the full suite. A 1280px screenshot is wanted if you can sign in locally; if you cannot, say so in result.md, do not fake it.

## Boundaries
No commit, no push, no install, nothing outward, no real network calls in tests. project.md's Never list applies. Do not touch upstream files.

## Progress
Keep `progress.md` beside this file from your first step, one line per step that changes a file or finishes a unit of work: done, files, next, anything half-written. Already there? You are resuming: read it and check the disk against it first.

## Report
Write `result.md` beside this file, under 200 words: the cause of each of the three defects with evidence, files changed, tests added, the mutation result naming the tests that failed, whether a screenshot was taken. Say what was not done.
