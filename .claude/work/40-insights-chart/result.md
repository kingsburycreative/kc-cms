# 40 result

Files added: `kc/insights/chart-model.ts`, `kc/insights/chart.tsx`, `kc/tests/insights-chart.test.ts`. No existing file changed.

Tests added: 6 (summary sentence one/zero/many, compact numbers, labels and tooltip, table newest first, lazy uplot import, source markers).

Mutation: top-level `import uPlot from "uplot"` failed "chart.tsx loads uplot lazily"; replacing `<table` with `<div` failed "chart.tsx source markers". Restored, green (266 pass; the runner ran the whole suite despite the filter).

Copy: "Last 7/30/90 days"; "{n} visit(s)/page view(s) in the last N days" and "No visits in the last N days"; "Show the numbers"; "Day", "Visits", "Page views"; tooltip "Oct 26: 12 visits"; hint "Touch or hover the chart for a day."; group label "Date range". Skills run: prose, avoid-ai-writing, humanizer, avoid-ai-design. The copy is plain and needed no edits.

Not done: `tsc` and `eslint` not run (brief says gate runs them); not seen in a browser. The component takes the full 90-day `days` array as its prop, defaults to 30 days, and uses `--chart-grid` CSS variable for grid colour with a grey fallback. The `text-primary`, `text-muted-foreground` classes assume the app's shadcn tokens.
