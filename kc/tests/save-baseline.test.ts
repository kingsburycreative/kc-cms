import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { nextBaseline } from "../save-baseline.ts";

const read = (path: string) => readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");

const old = { title: "Before" };
const submitted = { title: "After" };

test("the baseline after a successful save is the submitted values", () => {
  assert.equal(nextBaseline(old, submitted, true), submitted);
  assert.equal(nextBaseline(old, submitted, undefined), submitted);
});

test("the baseline is unchanged after a failed save", () => {
  assert.equal(nextBaseline(old, submitted, false), old);
});

test("entry-form resets the baseline after onSubmit and keeps in-flight edits", () => {
  const source = read("components/entry/entry-form.tsx");
  const submit = source.indexOf("await onSubmit(latestValues)");
  const reset = source.indexOf("form.reset(nextBaseline(");
  assert.ok(submit > 0 && reset > submit);
  assert.match(source, /nextBaseline\(defaultValues, latestValues, saved\), \{ keepValues: true \}/);
  assert.doesNotMatch(source.slice(submit, reset), /catch/);
});

test("entry.tsx reports success and failure of the save to the form", () => {
  const source = read("components/entry/entry.tsx");
  assert.match(source, /return true;\s*\} catch \(error: unknown\) \{[\s\S]*?return false;\s*\} finally/);
});
