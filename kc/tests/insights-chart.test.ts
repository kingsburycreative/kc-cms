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
