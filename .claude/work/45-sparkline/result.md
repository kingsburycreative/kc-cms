# 45. Sparkline and chart motion

Files changed: `kc/insights/chart.tsx`, `kc/tests/insights-chart.test.ts`.

- `MetricChart` exported with `compact` prop: 72px, axes and cursor off, no title/table, same lazy `import("uplot")` in the effect, same shimmer, same `role="img"` summary label.
- Plot is built once per metric/mode; a range change calls `setData()` with a 150ms opacity fade, skipped when `matchMedia("(prefers-reduced-motion: reduce)")` matches.
- 500ms `clip-path` draw-in on the wrapper when the plot is ready (`motion-reduce:` turns it off).
- `setCursor` hook moves a positioned tooltip.

Tests added: "MetricChart is exported with a 72px compact mode", "range change fades and swaps data only when motion is allowed". Existing tests unchanged. Done-test, tsc and eslint all exit 0.

Mutation: changed `import type uPlot` to a value import at the top. "chart.tsx loads uplot lazily" failed (1 fail). Restored, back to green.

Copy: no new strings. The tooltip uses the existing `tooltipText` ("Oct 26: 1 visit") and the toggle keeps "Last N days". So prose, avoid-ai-writing and humanizer had nothing to check. I removed the old hint line "Touch or hover the chart for a day." because the tooltip replaces it. avoid-ai-design (detect, dashboard, inside the design system) on the toggle and tooltip found nothing. Both use theme tokens.

Not done: page wiring (card 39/40). Card 41 should audit this.
