import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { isClaimWindowOver, pickWorkflowRun } from "../action-run-claim.ts";

const read = (path: string) => readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");

const row = Date.parse("2026-10-23T12:00:00Z");
const at = (offsetMs: number) => new Date(row + offsetMs).toISOString();

test("takes a run 10s after the row", () => {
  assert.equal(pickWorkflowRun([{ id: 1, created_at: at(10_000) }], row, [])?.id, 1);
});

test("skips a run 10 minutes after the row", () => {
  assert.equal(pickWorkflowRun([{ id: 2, created_at: at(600_000) }], row, []), null);
});

test("skips a claimed id", () => {
  assert.equal(pickWorkflowRun([{ id: 3, created_at: at(5_000) }], row, [3]), null);
});

test("takes the newest of two in the window", () => {
  const runs = [{ id: 4, created_at: at(5_000) }, { id: 5, created_at: at(60_000) }];
  assert.equal(pickWorkflowRun(runs, row, [])?.id, 5);
});

test("returns null on none", () => {
  assert.equal(pickWorkflowRun([], row, []), null);
});

test("the claim window is open at +60s and over at +10 minutes", () => {
  assert.equal(isClaimWindowOver(row, row + 60_000), false);
  assert.equal(isClaimWindowOver(row, row + 600_000), true);
});

for (const path of [
  "app/api/[owner]/[repo]/[branch]/actions/route.ts",
  "app/api/[owner]/[repo]/[branch]/actions/[runId]/route.ts",
]) {
  test(`${path} picks with pickWorkflowRun and checks the window before looking up`, () => {
    const source = read(path);
    assert.match(source, /pickWorkflowRun\(/);
    const check = source.indexOf("isClaimWindowOver(");
    assert.ok(check > 0);
    const lookup = source.indexOf("findWorkflowRun(", source.indexOf("!row.workflowRunId"));
    assert.ok(check < lookup, "window check comes before the lookup");
  });
}
