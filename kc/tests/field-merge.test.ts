import { test } from "node:test";
import assert from "node:assert/strict";
import { keepUnknownFields, mergeFields } from "../field-merge.ts";

const base = { title: "Old", intro: "Hi", seo: { description: "d", image: "a.jpg" } };

test("different fields changed on each side are both kept", () => {
  const theirs = { ...base, intro: "Hello from GitHub" };
  const mine = { ...base, title: "Typed title" };
  const { merged, conflicts } = mergeFields(base, theirs, mine);
  assert.deepEqual(merged, { ...base, title: "Typed title", intro: "Hello from GitHub" });
  assert.deepEqual(conflicts, []);
});

test("the same field changed on both sides keeps the typed text and is named", () => {
  const theirs = { ...base, title: "Theirs" };
  const mine = { ...base, title: "Mine" };
  const { merged, conflicts } = mergeFields(base, theirs, mine);
  assert.equal(merged.title, "Mine");
  assert.deepEqual(conflicts, ["title"]);
});

test("nested objects merge field by field and name the dotted path", () => {
  const theirs = { ...base, seo: { description: "theirs", image: "b.jpg" } };
  const mine = { ...base, seo: { description: "mine", image: "a.jpg" } };
  const { merged, conflicts } = mergeFields(base, theirs, mine);
  assert.deepEqual(merged.seo, { description: "mine", image: "b.jpg" });
  assert.deepEqual(conflicts, ["seo.description"]);
});

test("a field added on GitHub that the form does not hold is kept", () => {
  const theirs = { ...base, faq: [{ q: "?" }] };
  const { merged } = mergeFields(base, theirs, base);
  assert.deepEqual(merged.faq, [{ q: "?" }]);
});

test("an old field list keeps the file's fields it does not know", () => {
  const file = { title: "T", faq: [{ q: "?" }], seo: { description: "d", og: "x" } };
  const form = { title: "Typed", seo: { description: "typed" } };
  assert.deepEqual(keepUnknownFields(file, form), { title: "Typed", faq: [{ q: "?" }], seo: { description: "typed", og: "x" } });
});
