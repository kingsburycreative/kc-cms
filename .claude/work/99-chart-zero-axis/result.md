# 99 result

Files changed:
- kc/insights/chart-model.ts: new `valueSplits(max)`. It returns ticks from 0 up to at least max (and at least 1), in whole steps of 1, 2 or 5 x 10^n, with no more than five steps.
- kc/insights/chart.tsx: the y scale range now ends at the last split, and the value axis uses `splits: (_u, _i, _min, max) => valueSplits(max)`.
- kc/tests/insights-chart.test.ts: two tests added. "an all-zero series gives no repeated value labels" checks the labels are 0 and 1. "a series topping out at 3 gives whole, unrepeated labels" checks 0..3 and whole, unique labels for several maxima, plus the wiring in chart.tsx.

Mutation: I set the step to top/4, which gives fractional steps. Both new tests failed, then passed again once restored.

Note: the runner ignored a bare file argument and ran the full suite. Every run (583 tests) was the full suite, including the passing one.

Not done: I did not hide the axis when every day is zero. With the change, an all-zero chart labels its axis 0 and 1.
