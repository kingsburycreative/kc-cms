// Pure text and row helpers for the Insights chart. No React and no uplot,
// so the test runner can load it.

import type { Range, SeriesPoint } from "./series.ts";

export type Metric = "visits" | "views";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const NAMES: Record<Metric, { one: string; many: string }> = {
  visits: { one: "visit", many: "visits" },
  views: { one: "page view", many: "page views" },
};

export const METRIC_TITLES: Record<Metric, string> = { visits: "Visits", views: "Page views" };

const trim = (n: number, digits: number) => n.toFixed(digits).replace(/\.?0+$/, "");

// 950 -> 950, 3690 -> 3.69k, 12345 -> 12.3k, 250000 -> 250k.
export function compact(n: number): string {
  if (n < 1000) return String(n);
  if (n < 10000) return `${trim(n / 1000, 2)}k`;
  if (n < 100000) return `${trim(n / 1000, 1)}k`;
  return `${Math.round(n / 1000)}k`;
}

// Value axis ticks: 0 up to at least max, whole steps of 1, 2 or 5 x 10^n,
// at most five steps, so no label repeats once rounded. 0 -> [0, 1].
export function valueSplits(max: number): number[] {
  const top = Math.max(1, Math.ceil(max));
  let step = 1;
  for (let mag = 1; ; mag *= 10) {
    const found = [1, 2, 5].map((m) => m * mag).find((s) => top / s <= 5);
    if (found) { step = found; break; }
  }
  const end = Math.ceil(top / step) * step;
  const out: number[] = [];
  for (let v = 0; v <= end; v += step) out.push(v);
  return out;
}

// "2026-10-26" -> "Oct 26".
export function axisLabel(day: string): string {
  const [, m, d] = day.split("-");
  return `${MONTHS[Number(m) - 1]} ${Number(d)}`;
}

// The x and y columns uPlot draws: noon of each day in seconds, and the metric
// as a number (a string count from a cache would plot as nothing).
export function plotData(days: SeriesPoint[], metric: Metric, previous?: number[] | null): [number[], ...number[][]] {
  const base: [number[], ...number[][]] = [days.map((p) => Date.parse(`${p.day}T12:00:00Z`) / 1000), days.map((p) => Number(p[metric]) || 0)];
  return previous ? [...base, previous.map((n) => Number(n) || 0)] : base;
}

// Right padding so the last date label, centred on the plot's right edge,
// is not clipped: half its width at about 7px a character, plus a gap.
export const edgePad = (lastDay: string | undefined) => (lastDay ? Math.ceil(axisLabel(lastDay).length * 3.5) + 8 : 8);

// The width to draw at: the frame's own width, which the plot cannot set
// because it sits absolutely inside it. Never below 1.
export const plotWidth = (frameWidth: number) => Math.max(1, Math.floor(frameWidth));

export const total = (days: SeriesPoint[], metric: Metric) => days.reduce((sum, p) => sum + p[metric], 0);

const noun = (metric: Metric, n: number) => (n === 1 ? NAMES[metric].one : NAMES[metric].many);

export function summarySentence(metric: Metric, sum: number, range: Range): string {
  return `${sum === 0 ? "No" : compact(sum)} ${noun(metric, sum)} in the last ${range} days`;
}

export function tooltipText(day: string, metric: Metric, value: number): string {
  return `${axisLabel(day)}: ${compact(value)} ${noun(metric, value)}`;
}

export type TableRow = { day: string; label: string; visits: number; views: number };

// One row per day, newest first.
export function tableRows(days: SeriesPoint[]): TableRow[] {
  return days.map((p) => ({ day: p.day, label: axisLabel(p.day), visits: p.visits, views: p.views })).reverse();
}
