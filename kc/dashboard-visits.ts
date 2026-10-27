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

export type RangeChange = { last: number; previous: number; change: number | "new" | null };

// The last n days of one metric against the n before. Same rules as weekSummary.
export function rangeChange(days: SeriesPoint[], n: number, metric: "visits" | "views" = "visits"): RangeChange {
  const total = (list: SeriesPoint[]) => list.reduce((t, d) => t + d[metric], 0);
  const last = total(days.slice(-n));
  const previous = total(days.slice(-2 * n, -n));
  if (last === 0 && previous === 0) return { last, previous, change: null };
  if (previous === 0) return { last, previous, change: "new" };
  return { last, previous, change: Math.round(((last - previous) / previous) * 100) };
}

export type VisitsSummary = { last: number; change: number | "new" | null; hasPrevious: boolean; sentence: string };

// The visits panel's figure and sentence for the chosen range, from rangeChange.
// With no days before the range there is no earlier data: no change, no tail.
export function visitsSummary(days: SeriesPoint[], n: number): VisitsSummary {
  const { last, previous, change } = rangeChange(days, n, "visits");
  const hasPrevious = days.slice(-2 * n, -n).length > 0;
  const tail = hasPrevious ? ` ${previous.toLocaleString("en-US")} the ${n} days before.` : "";
  return { last, change: hasPrevious ? change : null, hasPrevious, sentence: `Last ${n} days.${tail}` };
}

// An SVG path for a sparkline in a width by height box, oldest value first.
export function sparkPath(values: number[], width = 120, height = 36): string {
  if (values.length < 2) return "";
  const max = Math.max(...values, 1);
  const step = width / (values.length - 1);
  const y = (v: number) => +(height - 2 - (v / max) * (height - 4)).toFixed(1);
  return values.map((v, i) => `${i === 0 ? "M" : "L"}${+(i * step).toFixed(1)} ${y(v)}`).join(" ");
}
