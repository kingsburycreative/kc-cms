// One-week visits summary for the dashboard: the last 7 days against the 7
// before. Pure; takes the daily series, oldest first.
import type { SeriesPoint } from "./insights/series.ts";

export type WeekSummary = {
  last: number;
  previous: number;
  // Whole percent, "new" when the week before had no visits, null when neither week did.
  change: number | "new" | null;
  sentence: string;
};

const sum = (days: SeriesPoint[]) => days.reduce((total, d) => total + d.visits, 0);
const visits = (n: number) => `${n} ${n === 1 ? "visit" : "visits"}`;

export function weekSummary(days: SeriesPoint[]): WeekSummary {
  const last = sum(days.slice(-7));
  const previous = sum(days.slice(-14, -7));
  if (last === 0 && previous === 0) return { last, previous, change: null, sentence: "No visits yet this week" };
  if (previous === 0) return { last, previous, change: "new", sentence: `${visits(last)} in the last 7 days. None the week before.` };
  const change = Math.round(((last - previous) / previous) * 100);
  const tail = change > 0 ? `up ${change}% on` : change < 0 ? `down ${-change}% on` : "the same as";
  return { last, previous, change, sentence: `${visits(last)} in the last 7 days, ${tail} the week before.` };
}
