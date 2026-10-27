"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type uPlot from "uplot";
import { visitsSummary } from "../dashboard-visits.ts";
import "uplot/dist/uPlot.min.css";
import { RANGES, slice, type Range, type SeriesPoint } from "./series.ts";
import { METRIC_TITLES, axisLabel, compact, summarySentence, tableRows, tooltipText, total, type Metric } from "./chart-model.ts";

const SM_QUERY = "(min-width: 640px)";
const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";
const SPARK_HEIGHT = 72;
const heightNow = (spark: boolean) => (spark ? SPARK_HEIGHT : window.matchMedia(SM_QUERY).matches ? 200 : 170);
const toSeconds = (day: string) => Date.parse(`${day}T12:00:00Z`) / 1000;
const toData = (days: SeriesPoint[], metric: Metric, previous?: number[] | null): uPlot.AlignedData => {
  const base: uPlot.AlignedData = [days.map((p) => toSeconds(p.day)), days.map((p) => p[metric])];
  return previous ? [...base, previous] : base;
};

type Tip = { text: string; left: number; top: number };

// bare: just the plot, for a panel that draws its own frame and figures, with
// horizontal gridlines only. previous: the period before, drawn dashed.
export function MetricChart({ days, metric, range, compact: spark = false, bare = false, previous = null }: { days: SeriesPoint[]; metric: Metric; range: Range; compact?: boolean; bare?: boolean; previous?: number[] | null }) {
  const box = useRef<HTMLDivElement>(null);
  const plotRef = useRef<uPlot | undefined>(undefined);
  const daysRef = useRef(days);
  const previousRef = useRef(previous);
  const hasPrevious = previous !== null;
  const [ready, setReady] = useState(false);
  const [fading, setFading] = useState(false);
  const [tip, setTip] = useState<Tip | null>(null);
  const sum = total(days, metric);
  const summary = summarySentence(metric, sum, range);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    let observer: ResizeObserver | undefined;
    let cancelled = false;

    (async () => {
      const { default: UPlot } = await import("uplot");
      if (cancelled) return;
      const colour = getComputedStyle(el).color;
      const muted = getComputedStyle(el).getPropertyValue("--chart-grid") || "rgba(128,128,128,0.25)";
      plotRef.current = new UPlot(
        {
          width: el.clientWidth,
          height: heightNow(spark),
          legend: { show: false },
          cursor: spark ? { show: false } : { drag: { x: false, y: false }, points: { size: 9 } },
          scales: { x: { time: false }, y: { range: (_u, _min, max) => [0, Math.max(max, 1)] } },
          axes: spark
            ? [{ show: false }, { show: false }]
            : [
                { stroke: colour, grid: bare ? { show: false } : { stroke: muted }, ticks: { show: false }, values: (_u, splits) => splits.map((s) => axisLabel(new Date(s * 1000).toISOString().slice(0, 10))) },
                { stroke: colour, grid: { stroke: muted }, ticks: { show: false }, size: 44, values: (_u, splits) => splits.map((s) => compact(Math.round(s))) },
              ],
          series: [
            {},
            { stroke: colour, width: 2, fill: `color-mix(in srgb, ${colour} 15%, transparent)`, points: { show: false } },
            ...(hasPrevious ? [{ stroke: `color-mix(in srgb, ${colour} 55%, transparent)`, width: 1.5, dash: [6, 4], points: { show: false } }] : []),
          ],
          hooks: spark
            ? {}
            : {
                setCursor: [
                  (u) => {
                    const i = u.cursor.idx;
                    const p = i == null ? undefined : daysRef.current[i];
                    setTip(p ? { text: tooltipText(p.day, metric, p[metric]), left: u.over.offsetLeft + (u.cursor.left ?? 0), top: u.over.offsetTop + (u.cursor.top ?? 0) } : null);
                  },
                ],
              },
        },
        toData(daysRef.current, metric, previousRef.current),
        el,
      );
      observer = new ResizeObserver(() => plotRef.current?.setSize({ width: el.clientWidth, height: heightNow(spark) }));
      observer.observe(el);
      setReady(true);
    })();

    return () => {
      cancelled = true;
      observer?.disconnect();
      plotRef.current?.destroy();
      plotRef.current = undefined;
      setReady(false);
    };
  }, [metric, spark, bare, hasPrevious]);

  // A new range swaps the data in place; the wrapper fades unless the user asked for less motion.
  useEffect(() => {
    daysRef.current = days;
    previousRef.current = previous;
    const plot = plotRef.current;
    if (!plot) return;
    if (window.matchMedia(REDUCED_QUERY).matches) {
      plot.setData(toData(days, metric, previous));
      return;
    }
    const out = window.setTimeout(() => setFading(true), 0);
    const swap = window.setTimeout(() => {
      plot.setData(toData(days, metric, previous));
      setFading(false);
    }, 150);
    return () => {
      window.clearTimeout(out);
      window.clearTimeout(swap);
    };
  }, [days, metric, previous]);

  const skeleton = !ready && <div className="absolute inset-0 animate-pulse rounded bg-current opacity-10 motion-reduce:animate-none" />;

  if (spark) {
    return (
      <div role="img" aria-label={summary} className="relative h-[72px] text-primary">
        {skeleton}
        <div ref={box} className="h-full w-full" />
      </div>
    );
  }

  const Frame = bare ? "div" : "section";

  return (
    <Frame className={bare ? undefined : "rounded-lg border p-3 sm:p-4"}>
      {!bare && <h3 className="text-sm font-medium">{METRIC_TITLES[metric]}</h3>}
      {!bare && <p className="text-2xl font-semibold">{compact(sum)}</p>}
      <div role="img" aria-label={summary} className={`relative h-[170px] text-primary sm:h-[200px] ${bare ? "" : "mt-2"}`}>
        {skeleton}
        <div
          className={`h-full w-full transition-[opacity,clip-path] duration-500 motion-reduce:transition-none ${fading ? "opacity-40" : "opacity-100"} ${ready ? "[clip-path:inset(0_0_0_0)]" : "[clip-path:inset(0_100%_0_0)] motion-reduce:[clip-path:none]"}`}
        >
          <div ref={box} className="h-full w-full" />
        </div>
        {tip && (
          <p
            aria-hidden="true"
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded border bg-background px-2 py-1 text-xs whitespace-nowrap shadow-sm"
            style={{ left: tip.left, top: tip.top - 8 }}
          >
            {tip.text}
          </p>
        )}
      </div>
      {!bare && <p className="mt-2 text-sm">{summary}</p>}
    </Frame>
  );
}

// The dashboard's visits chart: the same range toggle, visits only, and the
// slice the button says. One panel: the figure with its change, the sentence,
// the plot with the period before dashed, a legend and a link to Insights.
export function DashboardVisits({ days, insightsHref }: { days: SeriesPoint[]; insightsHref?: string }) {
  const [range, setRange] = useState<Range>(30);
  const shown = slice(days, range);
  const before = days.slice(-2 * range, -range);
  const previous = before.length === shown.length ? before.map((p) => p.visits) : null;
  const { last, change, sentence } = visitsSummary(days, range);
  return (
    <div className="space-y-3">
      <div role="group" aria-label="Date range" className="flex flex-wrap gap-2">
        {RANGES.map((r) => (
          <button
            key={r}
            type="button"
            aria-pressed={range === r}
            onClick={() => setRange(r)}
            className="min-h-11 rounded-md border px-4 text-sm aria-pressed:bg-primary aria-pressed:text-primary-foreground"
          >
            {r} days
          </button>
        ))}
      </div>
      <div>
        <p className="flex flex-wrap items-baseline gap-x-3 text-3xl font-semibold tabular-nums">
          {last.toLocaleString("en-US")}
          {typeof change === "number" && (
            <span className={`text-sm font-normal ${change >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-muted-foreground"}`}>
              <span aria-hidden="true">{change >= 0 ? "▲" : "▼"}</span> {Math.abs(change)}%
              <span className="sr-only"> {change >= 0 ? "up" : "down"} on the {range} days before</span>
            </span>
          )}
        </p>
        <p className="text-sm text-muted-foreground">{sentence}</p>
      </div>
      <MetricChart days={shown} metric="visits" range={range} bare previous={previous} />
      <div className="flex flex-wrap items-center justify-between gap-x-6 text-sm">
        <p className="flex flex-wrap items-center gap-x-4 text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <span aria-hidden="true" className="w-5 border-t-2 border-primary" />This period
          </span>
          {previous && (
            <span className="inline-flex items-center gap-2">
              <span aria-hidden="true" className="w-5 border-t-2 border-dashed border-primary/60" />Period before
            </span>
          )}
        </p>
        {insightsHref && <Link href={insightsHref} className="inline-flex min-h-11 items-center font-medium underline-offset-4 hover:underline">Open Insights</Link>}
      </div>
    </div>
  );
}

// Counts up to the value once on load; shows it at once under reduced motion
// and before the script runs.
export function CountUp({ value }: { value: number }) {
  const [shown, setShown] = useState(value);
  useEffect(() => {
    if (window.matchMedia(REDUCED_QUERY).matches || value <= 0) return;
    const start = performance.now();
    let frame = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / 800);
      setShown(Math.round(value * (1 - (1 - p) ** 3)));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);
  return <>{shown.toLocaleString("en-US")}</>;
}

export function InsightsChart({ days }: { days: SeriesPoint[] }) {
  const [range, setRange] = useState<Range>(30);
  const shown = slice(days, range);
  const rows = tableRows(shown);

  return (
    <div className="space-y-3">
      <div role="group" aria-label="Date range" className="flex gap-2">
        {RANGES.map((r) => (
          <button
            key={r}
            type="button"
            aria-pressed={range === r}
            onClick={() => setRange(r)}
            className="min-h-11 rounded-md border px-4 text-sm aria-pressed:bg-primary aria-pressed:text-primary-foreground"
          >
            Last {r} days
          </button>
        ))}
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        <MetricChart days={shown} metric="visits" range={range} />
        <MetricChart days={shown} metric="views" range={range} />
      </div>
      <details className="rounded-lg border p-3">
        <summary className="min-h-11 cursor-pointer text-sm font-medium">Show the numbers</summary>
        <table className="mt-2 w-full text-left text-sm">
          <thead>
            <tr>
              <th scope="col" className="py-1">Day</th>
              <th scope="col" className="py-1 text-right">{METRIC_TITLES.visits}</th>
              <th scope="col" className="py-1 text-right">{METRIC_TITLES.views}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.day}>
                <th scope="row" className="py-1 font-normal">{r.label}</th>
                <td className="py-1 text-right">{r.visits}</td>
                <td className="py-1 text-right">{r.views}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
