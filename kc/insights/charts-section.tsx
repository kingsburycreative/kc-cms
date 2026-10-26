import { InsightsChart } from "./chart.tsx";
import type { Series } from "./series.ts";

export const CHARTS_HEADING = "Daily traffic";
export const VISIT_NOTE =
  "A visit is one person coming to the site. A page view is each page they open while they are there, so one visit can count several page views.";
export const GA4_NOTE = "These charts only count visitors who allowed analytics on the site.";

// Server component: only the series (days and source) crosses to the client chart.
export function ChartsSection({ series }: { series: Series }) {
  return (
    <section aria-labelledby="insights-charts" className="space-y-3">
      <h2 id="insights-charts" className="text-base font-semibold">{CHARTS_HEADING}</h2>
      <InsightsChart days={series.days} />
      <p className="text-sm text-muted-foreground">{VISIT_NOTE}</p>
      {series.from === "ga4" && <p className="text-sm text-muted-foreground">{GA4_NOTE}</p>}
    </section>
  );
}
