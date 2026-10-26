# 45. Sparkline and chart motion (Risky)

## Objective
Board card 38 (`.claude/work/39-plan-dashboard/plan.md` card 38). Give the existing Insights chart a `compact` sparkline mode for the dashboard, plus the full chart's motion from the approved mockup. No page wiring, no new dependency, no second uPlot setup.

## Read first
- `D:\Dev\htdocs\kc-cms-app\.claude\project.md` (relative `.ts` imports in `kc/`, Copy rule, Never list)
- Card 38 in `D:\Dev\htdocs\kc-cms-app\.claude\work\39-plan-dashboard\plan.md` (the spec; follow it exactly)
- `kc/insights/chart.tsx`, `kc/insights/chart-model.ts`, `kc/tests/insights-chart.test.ts`
- The mockup in `.claude/work/39-plan-dashboard/mockup/` for the motion

## Start here
- `MetricChart` exported from `kc/insights/chart.tsx` with a `compact` prop: height 72, no axes, no table, same lazy `import("uplot")` inside the effect, same shimmer skeleton with `motion-reduce:animate-none`, keeps the `role="img"` label from `summarySentence`.
- Full chart: a 7/30/90 range toggle (buttons with `aria-pressed`) calling `setData()` while the wrapper fades opacity; a one-off 500ms CSS `clip-path` draw-in on the wrapper; uPlot's own cursor with a `setCursor` hook moving a positioned tooltip (date and "N visits"). All three skip under `prefers-reduced-motion` (`motion-reduce:` classes and a `matchMedia` check before the fade).

## Files you may touch
- `D:\Dev\htdocs\kc-cms-app\kc\insights\chart.tsx`
- `D:\Dev\htdocs\kc-cms-app\kc\tests\insights-chart.test.ts`
- `D:\Dev\htdocs\kc-cms-app\.claude\work\45-sparkline\result.md` and `progress.md` (new)

## Copy
The toggle labels, tooltip text and any aria labels are client-facing: write them with the `prose` skill, then `avoid-ai-writing` and `humanizer`, via the Skill tool. Run `avoid-ai-design` on the toggle and tooltip. If the Skill tool refuses one, stop and say so in result.md. List each string in result.md.

## Done-test
`node C:\Users\roban\.claude\bin\project-test.cjs kc/tests/insights-chart.test.ts` passes, then `npx tsc --noEmit && npx eslint kc` exit 0. Source asserts: `MetricChart` exported; `compact` branches height to 72; `import("uplot")` only inside the effect; `motion-reduce:animate-none` beside the shimmer; toggle buttons carry `aria-pressed`; a `matchMedia("(prefers-reduced-motion` check guards the fade; existing chart tests unchanged and passing.

Mutation check, through the runner: import uplot at the top of the file and name the lazy-import test that fails; restore and run green.

## Boundaries
No commit, no push, no install, nothing outward. No `package.json`, lock file or `db/migrations/` change. No existing test weakened or removed. Keep `progress.md` beside this brief, updated after each step that changes a file.

## Report
`result.md` beside this file, under 200 words: files changed, tests added, the mutation result naming the failing tests, copy strings, what was not done.
