import { test } from "node:test";
import assert from "node:assert/strict";
import { keepUnlisted } from "../keep-unlisted.ts";

const fields = [
  { name: "title", type: "string" },
  { name: "hero", type: "object", fields: [{ name: "heading", type: "string" }] },
  { name: "items", type: "object", list: true, fields: [{ name: "label", type: "string" }] },
  {
    name: "blocks", type: "block", list: true,
    blocks: [{ name: "text", fields: [{ name: "body", type: "string" }] }],
  },
];

test("unlisted keys come back at the top, in objects, list items and blocks", () => {
  const raw = {
    title: "T", faq: [{ q: "a" }],
    hero: { heading: "H", note: "n" },
    items: [{ label: "one", extra: 1 }, { label: "two" }],
    blocks: [{ _block: "text", body: "b", source: "s" }],
  };
  const kept = {
    title: "T",
    hero: { heading: "H" },
    items: [{ label: "one" }, { label: "two" }],
    blocks: [{ _block: "text", body: "b" }],
  };
  assert.deepEqual(keepUnlisted(fields, raw, kept), raw);
});

test("a listed field is never overridden by the raw value", () => {
  const raw = { title: "old", hero: { heading: "old" }, items: [{ label: "old" }] };
  const kept = { title: "new", hero: { heading: "new" }, items: [{ label: "new" }] };
  assert.deepEqual(keepUnlisted(fields, raw, kept), kept);
});

test("non-object input is left alone", () => {
  assert.equal(keepUnlisted(fields, null, "x"), "x");
  const kept = { title: "T" };
  assert.deepEqual(keepUnlisted(fields, [1], kept), kept);
});
