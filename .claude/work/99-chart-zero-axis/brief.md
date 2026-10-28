# 99. Chart value axis gives whole, unrepeated labels (Risky)

## Objective
A visits chart whose days are all zero no longer labels its value axis "1 1 1 0 0", and a series topping out at a small number (e.g. 3) shows whole-number labels only, none repeated. The split/range choice lives in a pure helper in `kc/insights/chart-model.ts` that the test runner loads; `chart.tsx` uses it.

## Read first
- D:\Dev\htdocs\kc-cms-app\CLAUDE.md and D:\Dev\htdocs\kc-cms-app\.claude\project.md
- D:\Dev\htdocs\kc-cms-app\kc\insights\chart.tsx
- D:\Dev\htdocs\kc-cms-app\kc\insights\chart-model.ts
- D:\Dev\htdocs\kc-cms-app\kc\tests\insights-chart.test.ts (style to match)

## Context
Seen on Henike in session 21. Cause: uPlot splits a 0..1 range into fractional steps and the axis formatter `compact(Math.round(s))` rounds 0.75 and 0.5 to 1. Hiding the value axis when every day is zero is acceptable too (the summary line already says "No visits"), but the helper must still give whole, unique splits for small maxima. Look up uPlot's axis `splits`/`incrs` option in node_modules/uplot (d.ts) rather than guessing; e.g. `incrs` of whole numbers, or a `splits` function from the helper.

## Start here
- `kc/insights/chart.tsx:54` scale: `y: { range: (_u, _min, max) => [0, Math.max(max, 1)] }`
- `kc/insights/chart.tsx:58` value axis: `values: (_u, splits) => splits.map((s) => compact(Math.round(s)))`
- Add to chart-model.ts e.g. `export function valueSplits(max: number): number[]` (0..top, whole steps, top >= 1, unique) and wire it into the y axis `splits` (and range to match).
- Done-test: `node C:\Users\roban\.claude\bin\project-test.cjs kc/tests/insights-chart.test.ts` (if the runner takes no file filter, use `node --test kc/tests/insights-chart.test.ts` through it as the runner's help says).

## Files you may touch
- `kc/insights/chart-model.ts`
- `kc/insights/chart.tsx`
- `kc/tests/insights-chart.test.ts`

## Done-test
New tests in kc/tests/insights-chart.test.ts: an all-zero series gives no repeated labels; a series topping out at 3 gives whole numbers only (labels as the axis would format them). Then the mutation check through the runner: break the helper on purpose (e.g. fractional steps), run the filtered tests, name which failed, restore, run green. Never the full suite.

## Boundaries
No commit, no push, no install, nothing outward. Client chart only: never touch the key handling or `kc/insights/token.ts`. project.md's Never list applies.

## Progress
Keep `progress.md` beside this file from your first step, one line per step that changes a file or finishes a unit of work. Already there? You are resuming: read it and check the disk against it first.

## Report
Write `result.md` beside this file, under 200 words: files changed, tests added, the mutation result naming the failed tests, calls made and why, what was not done.
