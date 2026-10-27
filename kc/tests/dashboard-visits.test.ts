import { test } from "node:test";
import assert from "node:assert/strict";
import { rangeChange, sparkPath, visitsSummary, weekSummary } from "../dashboard-visits.ts";

const days = (visits: number[]) => visits.map((v, i) => ({ day: `2026-10-${String(i + 1).padStart(2, "0")}`, visits: v, views: v }));

test("rangeChange compares the last n days with the n before, exactly", () => {
  const list = [...Array(30).fill(10), ...Array(30).fill(12)].map((v, i) => ({ day: `d${i}`, visits: v, views: v * 3 }));
  assert.deepEqual(rangeChange(list, 30), { last: 360, previous: 300, change: 20 });
  assert.deepEqual(rangeChange(list, 30, "views"), { last: 1080, previous: 900, change: 20 });
  assert.deepEqual(rangeChange(days([4, 4, 2, 3]), 2), { last: 5, previous: 8, change: -37 });
});

test("rangeChange: previous zero is new, all zeros is none", () => {
  assert.deepEqual(rangeChange(days([0, 0, 3, 1]), 2), { last: 4, previous: 0, change: "new" });
  assert.deepEqual(rangeChange(days([0, 0, 0, 0]), 2), { last: 0, previous: 0, change: null });
  assert.deepEqual(rangeChange([], 30), { last: 0, previous: 0, change: null });
});

test("visitsSummary gives the figure, the change and the sentence for the chosen range", () => {
  const list = [...Array(30).fill(10), ...Array(30).fill(12)].map((v, i) => ({ day: `d${i}`, visits: v, views: v }));
  assert.deepEqual(visitsSummary(list, 30), { last: 360, change: 20, hasPrevious: true, sentence: "Last 30 days. 300 the 30 days before." });
  assert.equal(visitsSummary(list, 7).sentence, "Last 7 days. 84 the 7 days before.");
  const big = [...Array(60).fill(11), ...Array(30).fill(14)].map((v, i) => ({ day: `d${i}`, visits: v, views: v }));
  assert.equal(visitsSummary(big, 30).sentence, "Last 30 days. 330 the 30 days before.");
});

test("visitsSummary has no change and no tail without earlier data", () => {
  const thirty = days(Array(30).fill(5));
  assert.deepEqual(visitsSummary(thirty, 30), { last: 150, change: null, hasPrevious: false, sentence: "Last 30 days." });
  assert.deepEqual(visitsSummary([], 7), { last: 0, change: null, hasPrevious: false, sentence: "Last 7 days." });
});

test("sparkPath spans the box and needs two points", () => {
  assert.equal(sparkPath([0, 10], 120, 36), "M0 34 L120 2");
  assert.equal(sparkPath([5]), "");
});

test("14 known days give exact totals, percent and sentence", () => {
  const s = weekSummary(days([5, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6]));
  assert.equal(s.previous, 35);
  assert.equal(s.last, 42);
  assert.equal(s.change, 20);
  assert.equal(s.sentence, "42 visits in the last 7 days, up 20% on the week before.");
});

test("a drop reads as down", () => {
  const s = weekSummary(days([10, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0]));
  assert.equal(s.change, -50);
  assert.equal(s.sentence, "5 visits in the last 7 days, down 50% on the week before.");
});

test("an unchanged week says so", () => {
  const s = weekSummary(days([1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]));
  assert.equal(s.change, 0);
  assert.equal(s.sentence, "7 visits in the last 7 days, the same as the week before.");
});

test("a zero previous week is new, with no divide error", () => {
  const s = weekSummary(days([0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0]));
  assert.equal(s.change, "new");
  assert.equal(s.sentence, "3 visits in the last 7 days. None the week before.");
});

test("all zeros says no visits yet", () => {
  const s = weekSummary(days(new Array(14).fill(0)));
  assert.equal(s.change, null);
  assert.equal(s.sentence, "No visits yet this week");
  assert.equal(weekSummary([]).sentence, "No visits yet this week");
});

test("one visit is singular", () => {
  const s = weekSummary(days([0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1]));
  assert.equal(s.sentence, "1 visit in the last 7 days, the same as the week before.");
});
