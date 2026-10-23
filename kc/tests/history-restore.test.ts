import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { restoreParam, restoreState } from "../history/restore.ts";

const read = (path: string) => readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
const params = (value: string | null) => ({ get: (name: string) => (name === "restore" ? value : null) });

test("restoreState keeps the current sha and returns the old content", () => {
  const state = restoreState(
    { sha: "currentsha", contentObject: { title: "New" } },
    { sha: "oldsha", contentObject: { title: "Old" } },
  );
  assert.equal(state.sha, "currentsha");
  assert.deepEqual(state.values, { title: "Old" });
});

test("restoreParam accepts hex of 7 to 40 characters", () => {
  assert.equal(restoreParam(params("abcdef1")), "abcdef1");
  assert.equal(restoreParam(params("a".repeat(40))), "a".repeat(40));
});

test("restoreParam rejects non-hex, wrong length and missing", () => {
  assert.equal(restoreParam(params("zzzzzzz")), null);
  assert.equal(restoreParam(params("abcdef")), null);
  assert.equal(restoreParam(params("a".repeat(41))), null);
  assert.equal(restoreParam(params("abc/../1")), null);
  assert.equal(restoreParam(params(null)), null);
  assert.equal(restoreParam(null), null);
});

test("entry.tsx reads restore only through the helpers and saves the sha state", () => {
  const source = read("components/entry/entry.tsx");
  assert.match(source, /restoreParam\(/);
  assert.match(source, /restoreState\(/);
  assert.equal(source.match(/get\("restore"\)/g), null);
  assert.match(source, /content: schema\?\.list === true\s*\?\s*contentObject\.listWrapper\s*:\s*contentObject,\s*sha: sha\s*\}/);
});

test("history view links to the editor with ?restore=", () => {
  assert.match(read("kc/history/history-view.tsx"), /\?restore=/);
});
