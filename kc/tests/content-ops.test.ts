import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { clientMayDelete } from "../content-ops.ts";

const read = (path: string) => readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");

test("a client may not delete a single-file entry", () => {
  assert.equal(clientMayDelete({ source: "installation", schemaType: "file" }), false);
});

test("a client may delete collection entries and media", () => {
  assert.equal(clientMayDelete({ source: "installation", schemaType: "collection" }), true);
  assert.equal(clientMayDelete({ source: "installation", schemaType: "media" }), true);
  assert.equal(clientMayDelete({ source: "installation" }), true);
});

test("a user token may delete a single-file entry", () => {
  assert.equal(clientMayDelete({ source: "user", schemaType: "file" }), true);
});

test("DELETE checks clientMayDelete after the schema lookup and before the GitHub delete", () => {
  const source = read("app/api/[owner]/[repo]/[branch]/files/[path]/route.ts");
  const handler = source.slice(source.indexOf("export async function DELETE("));
  const lookup = handler.indexOf("schema = getSchemaByName(config.object, name);");
  const gate = handler.search(/if \(!clientMayDelete\(\{ source, schemaType: schema\.type \}\)\) \{\s*throw createHttpError\([^;]*, 403\);/);
  const remove = handler.indexOf("octokit.rest.repos.deleteFile(");
  assert.ok(lookup !== -1 && gate > lookup && remove > gate);
});

test("the entry editor folds clientMayDelete into canDelete", () => {
  const source = read("components/entry/entry.tsx");
  assert.match(source, /const canDelete = operations\.delete && clientMayDelete\(\{ source: hasGithubIdentity\(user\) \? "user" : "installation", schemaType \}\);/);
});
