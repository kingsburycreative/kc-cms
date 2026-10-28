import { test } from "node:test";
import assert from "node:assert/strict";
import { stringify, parse } from "../../lib/serialization.ts";

const obj = { title: "Home", n: 2, list: ["a", "b"] };

test("json ends with exactly one newline and round-trips", () => {
  const out = stringify(obj, { format: "json" });
  assert.equal(out, JSON.stringify(obj, null, 2) + "\n");
  assert.ok(out.endsWith("}\n") && !out.endsWith("\n\n"));
  assert.deepEqual(parse(out, { format: "json" }), obj);
});

test("an empty object stays empty", () => {
  assert.equal(stringify({}, { format: "json" }), "");
});

test("json-frontmatter output is unchanged", () => {
  const out = stringify({ title: "Home", body: "Hi\n" }, { format: "json-frontmatter" });
  assert.equal(out, '{\n  "title": "Home"\n}\nHi\n');
});
