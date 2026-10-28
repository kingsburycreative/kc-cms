# 100 Chart card width: result

Causes (from code reading, no browser):
- Half width: uPlot was built at `el.clientWidth` and the ResizeObserver watched that same box, which uPlot fills with a fixed-pixel root. In a grid or flex card, that content holds the box at its first (narrow) measure, so the observer never sees it grow. Fix: plot box is `absolute inset-0` inside the role=img frame (`w-full min-w-0`); the frame is measured and observed.
- Last label cut: uPlot centres the last x label on the plot's right edge with no right padding. Fix: `padding` right = `edgePad(lastDay)`.
- Flat line: not proven. The y-range and data path are correct for numeric fixtures; most likely the squashed plot. `plotData` now coerces counts to numbers in case a cache gives strings. Needs a look on the live site.

Files: kc/insights/chart.tsx, kc/insights/chart-model.ts (plotData, edgePad, plotWidth), kc/tests/insights-chart.test.ts.

Tests added: plot data not flat for a visits fixture; last label padding; plot sizes from its frame.

Mutation: observing `el` instead of the frame failed "the plot sizes from its frame, which it cannot hold at a stale width"; restored, green (586 pass).

No screenshot: did not sign in locally. Runner ran the whole suite despite the file arg.
