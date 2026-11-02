import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { interpolate } from "../interpolate.ts";

const read = (path: string) =>
  readFileSync(new URL(`../../${path}`, import.meta.url), "utf8").replace(/\r\n/g, "\n");

const item = {
  name: "deck-permit-ottawa.md",
  path: "src/content/posts/deck-permit-ottawa.md",
  primary: "Deck permits in Ottawa",
  fields: { title: "Deck permits in Ottawa" },
};

test("{stem} is the file name without its extension", () => {
  assert.equal(interpolate("{stem}", { ...item, fields: {} }, "fields"), "deck-permit-ottawa");
});

test("{stem} removes only the final extension", () => {
  assert.equal(interpolate("{stem}", { name: "a.b.md", fields: {} }, "fields"), "a.b");
});

test("{stem} keeps a name with no dot or a leading dot whole", () => {
  assert.equal(interpolate("{stem}", { name: "README", fields: {} }, "fields"), "README");
  assert.equal(interpolate("{stem}", { name: ".pages", fields: {} }, "fields"), ".pages");
});

test("{stem} falls back to the last path segment", () => {
  assert.equal(interpolate("{stem}", { path: "src/content/posts/x.y.md", fields: {} }, "fields"), "x.y");
});

test("{stem} with no name or path is empty", () => {
  assert.equal(interpolate("{stem}", { index: 0, fields: {} }, "fields"), "");
});

test("a real stem value wins over the built-in", () => {
  assert.equal(interpolate("{stem}", { ...item, stem: "own" }, "fields"), "own");
});

test("existing tokens are unchanged", () => {
  assert.equal(interpolate("{path}", item, "fields"), item.path);
  assert.equal(interpolate("{name}", item, "fields"), "deck-permit-ottawa.md");
  assert.equal(interpolate("{primary}", item, "fields"), item.primary);
  assert.equal(interpolate("{fields.title}", item, "fields"), item.fields.title);
  assert.equal(interpolate("{title}", item, "fields"), item.fields.title);
  assert.equal(interpolate("\\{name\\}", item, "fields"), "{name}");
  assert.equal(interpolate("a{missing}b", item, "fields"), "ab");
});

test("lib/schema re-exports interpolate and the route imports it from there", () => {
  const schema = read("lib/schema.ts");
  assert.match(schema, /^import \{ safeAccess, interpolate \} from "\.\.\/kc\/interpolate";$/m);
  assert.match(schema, /\n {2}interpolate\n/);
  const route = read("app/api/[owner]/[repo]/[branch]/references/[name]/route.ts");
  assert.match(route, /import \{[^}]*\binterpolate\b[^}]*\} from "@\/lib\/schema";/);
});
