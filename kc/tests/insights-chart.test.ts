import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { compact, summarySentence, tableRows, tooltipText, axisLabel } from "../insights/chart-model.ts";

const src = readFileSync(new URL("../insights/chart.tsx", import.meta.url), "utf8");

test("summary sentence handles one, zero and many", () => {
  assert.equal(summarySentence("visits", 1, 7), "1 visit in the last 7 days");
  assert.equal(summarySentence("visits", 0, 7), "No visits in the last 7 days");
  assert.equal(summarySentence("visits", 412, 30), "412 visits in the last 30 days");
  assert.equal(summarySentence("views", 1, 90), "1 page view in the last 90 days");
  assert.equal(summarySentence("views", 0, 90), "No page views in the last 90 days");
});

test("compact numbers", () => {
  assert.equal(compact(950), "950");
  assert.equal(compact(3690), "3.69k");
  assert.equal(compact(1000), "1k");
});

test("labels and tooltip", () => {
  assert.equal(axisLabel("2026-10-26"), "Oct 26");
  assert.equal(tooltipText("2026-10-26", "visits", 1), "Oct 26: 1 visit");
  assert.equal(tooltipText("2026-10-26", "views", 12), "Oct 26: 12 page views");
});

test("table has one row per day, newest first", () => {
  const days = [
    { day: "2026-10-24", visits: 1, views: 2 },
    { day: "2026-10-25", visits: 3, views: 4 },
    { day: "2026-10-26", visits: 5, views: 6 },
  ];
  const rows = tableRows(days);
  assert.equal(rows.length, 3);
  assert.deepEqual(rows.map((r) => r.day), ["2026-10-26", "2026-10-25", "2026-10-24"]);
});

test("chart.tsx loads uplot lazily", () => {
  assert.match(src, /import\("uplot"\)/);
  assert.doesNotMatch(src, /^import\s+(?!type\b)[^;]*from\s+["']uplot["']/m);
  assert.doesNotMatch(src, /^import\s+["']uplot["']/m);
});

test("chart.tsx source markers", () => {
  assert.match(src, /animate-pulse[^"]*motion-reduce:animate-none/);
  assert.match(src, /aria-pressed/);
  assert.match(src, /<details/);
  assert.match(src, /<table/);
});

test("MetricChart is exported with a 72px compact mode", () => {
  assert.match(src, /export function MetricChart\(/);
  assert.match(src, /compact: spark = false/);
  assert.match(src, /SPARK_HEIGHT = 72/);
  assert.match(src, /spark \? SPARK_HEIGHT :/);
  assert.match(src, /h-\[72px\]/);
  assert.match(src, /axes: spark\s*\?\s*\[\{ show: false \}, \{ show: false \}\]/);
});

test("the dashboard chart toggles 7, 30 and 90 days and charts the slice it names", () => {
  const start = src.indexOf("export function DashboardVisits(");
  assert.ok(start > 0);
  const body = src.slice(start, src.indexOf("export function CountUp("));
  assert.match(body, /role="group" aria-label="Date range"/);
  assert.match(body, /aria-pressed=\{range === r\}/);
  assert.match(body, /min-h-11/);
  assert.match(body, /<MetricChart days=\{shown\} metric="visits" range=\{range\} bare previous=\{previous\} \/>/);
  assert.match(body, /const shown = slice\(days, range\)/);
});

test("the visits panel is one frame: bare chart, no nested border box, horizontal gridlines only", () => {
  const chart = src.slice(src.indexOf("export function MetricChart("), src.indexOf("export function DashboardVisits("));
  assert.match(chart, /const Frame = bare \? "div" : "section"/);
  assert.match(chart, /className=\{bare \? undefined : "rounded-lg border p-3 sm:p-4"\}/);
  assert.match(chart, /grid: bare \? \{ show: false \} : \{ stroke: muted \}/);
  const panel = src.slice(src.indexOf("export function DashboardVisits("), src.indexOf("export function CountUp("));
  assert.match(panel, /<MetricChart [^>]*\bbare\b/);
  assert.doesNotMatch(panel, /rounded-lg border|<section/);
});

test("the visits panel draws the period before dashed, with a legend and an Open Insights link", () => {
  assert.match(src, /dash: \[6, 4\]/);
  const panel = src.slice(src.indexOf("export function DashboardVisits("), src.indexOf("export function CountUp("));
  assert.match(panel, /This period/);
  assert.match(panel, /\{previous && \([\s\S]*?Period before/);
  assert.match(panel, /<Link href=\{insightsHref\}[^>]*>Open Insights<\/Link>/);
  assert.match(panel, /before\.length === shown\.length \? before\.map/);
});

test("the figure, change and sentence come from visitsSummary, which wraps rangeChange", () => {
  const panel = src.slice(src.indexOf("export function DashboardVisits("), src.indexOf("export function CountUp("));
  assert.match(panel, /const \{ last, change, sentence \} = visitsSummary\(days, range\)/);
  assert.match(panel, /\{sentence\}/);
  assert.match(panel, /typeof change === "number"/);
  const visits = readFileSync(new URL("../dashboard-visits.ts", import.meta.url), "utf8");
  assert.match(visits, /export function visitsSummary[\s\S]*?rangeChange\(days, n, "visits"\)/);
});

test("count-up shows the value at once under reduced motion", () => {
  const body = src.slice(src.indexOf("export function CountUp("), src.indexOf("export function InsightsChart("));
  assert.match(body, /useState\(value\)/);
  assert.match(body, /if \(window\.matchMedia\(REDUCED_QUERY\)\.matches/);
});

test("range change fades and swaps data only when motion is allowed", () => {
  assert.match(src, /matchMedia\(REDUCED_QUERY\)/);
  assert.match(src, /REDUCED_QUERY = "\(prefers-reduced-motion: reduce\)"/);
  assert.match(src, /plot\.setData\(/);
  assert.match(src, /clip-path[^"]*duration-500[^"]*motion-reduce:transition-none/);
  assert.match(src, /setCursor:/);
  assert.match(src, /style=\{\{ left: tip\.left/);
});
