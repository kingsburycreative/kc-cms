"use client";

import { useEffect, useRef, useState } from "react";
import type uPlot from "uplot";
import "uplot/dist/uPlot.min.css";
import { RANGES, slice, type Range, type SeriesPoint } from "./series.ts";
import { METRIC_TITLES, axisLabel, compact, summarySentence, tableRows, tooltipText, total, type Metric } from "./chart-model.ts";

const SM_QUERY = "(min-width: 640px)";
const heightNow = () => (window.matchMedia(SM_QUERY).matches ? 200 : 170);
const toSeconds = (day: string) => Date.parse(`${day}T12:00:00Z`) / 1000;

function MetricChart({ days, metric, range }: { days: SeriesPoint[]; metric: Metric; range: Range }) {
  const box = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [hint, setHint] = useState("");
  const sum = total(days, metric);
  const summary = summarySentence(metric, sum, range);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    let plot: uPlot | undefined;
    let observer: ResizeObserver | undefined;
    let cancelled = false;

    (async () => {
      const { default: UPlot } = await import("uplot");
      if (cancelled) return;
      const colour = getComputedStyle(el).color;
      const muted = getComputedStyle(el).getPropertyValue("--chart-grid") || "rgba(128,128,128,0.25)";
      plot = new UPlot(
        {
          width: el.clientWidth,
          height: heightNow(),
          legend: { show: false },
          cursor: { drag: { x: false, y: false }, points: { size: 9 } },
          scales: { x: { time: false }, y: { range: (_u, _min, max) => [0, Math.max(max, 1)] } },
          axes: [
            { stroke: colour, grid: { stroke: muted }, ticks: { show: false }, values: (_u, splits) => splits.map((s) => axisLabel(new Date(s * 1000).toISOString().slice(0, 10))) },
            { stroke: colour, grid: { stroke: muted }, ticks: { show: false }, size: 44, values: (_u, splits) => splits.map((s) => compact(Math.round(s))) },
          ],
          series: [{}, { stroke: colour, width: 2, fill: `color-mix(in srgb, ${colour} 15%, transparent)`, points: { show: false } }],
          hooks: {
            setCursor: [
              (u) => {
                const i = u.cursor.idx;
                setHint(i == null ? "" : tooltipText(days[i].day, metric, days[i][metric]));
              },
            ],
          },
        },
        [days.map((p) => toSeconds(p.day)), days.map((p) => p[metric])],
        el,
      );
      observer = new ResizeObserver(() => plot?.setSize({ width: el.clientWidth, height: heightNow() }));
      observer.observe(el);
      setReady(true);
    })();

    return () => {
      cancelled = true;
      observer?.disconnect();
      plot?.destroy();
      setReady(false);
    };
  }, [days, metric]);

  return (
    <section className="rounded-lg border p-3 sm:p-4">
      <h3 className="text-sm font-medium">{METRIC_TITLES[metric]}</h3>
      <p className="text-2xl font-semibold">{compact(sum)}</p>
      <p className="min-h-5 text-sm text-muted-foreground" aria-hidden="true">
        {hint || "Touch or hover the chart for a day."}
      </p>
      <div role="img" aria-label={summary} className="relative mt-2 h-[170px] text-primary sm:h-[200px]">
        {!ready && <div className="absolute inset-0 animate-pulse rounded bg-current opacity-10 motion-reduce:animate-none" />}
        <div ref={box} className="h-full w-full" />
      </div>
      <p className="mt-2 text-sm">{summary}</p>
    </section>
  );
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
