import { test } from "node:test";
import assert from "node:assert/strict";
import { weekSummary } from "../dashboard-visits.ts";

const days = (visits: number[]) => visits.map((v, i) => ({ day: `2026-10-${String(i + 1).padStart(2, "0")}`, visits: v, views: v }));

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
