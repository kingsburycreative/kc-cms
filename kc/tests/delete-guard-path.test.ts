import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { isSingleFilePath } from "../content-ops.ts";

const read = (path: string) => readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");

const content = [
  { name: "home", type: "file", path: "src/content/home.md" },
  { name: "pages", type: "collection", path: "src/content" },
  { name: "posts", type: "collection", path: "src/content/posts" },
];

test("a file schema's path is a single-file path, slashes at the ends ignored", () => {
  assert.equal(isSingleFilePath(content, "src/content/home.md"), true);
  assert.equal(isSingleFilePath(content, "/src/content/home.md"), true);
  assert.equal(isSingleFilePath(content, "src/content/home.md/"), true);
});

test("a collection entry in the same folder and an unrelated path are not", () => {
  assert.equal(isSingleFilePath(content, "src/content/about.md"), false);
  assert.equal(isSingleFilePath(content, "src/content"), false);
  assert.equal(isSingleFilePath(content, "other/home.md"), false);
  assert.equal(isSingleFilePath(undefined, "src/content/home.md"), false);
});

const filesRoute = read("app/api/[owner]/[repo]/[branch]/files/[path]/route.ts");
const deleteHandler = filesRoute.slice(filesRoute.indexOf("export async function DELETE("));

test("DELETE content refuses a single-file path for installation tokens", () => {
  assert.match(deleteHandler, /source === "installation" && isSingleFilePath\(config\.object\.content, normalizedPath\)\) \{\s*throw createHttpError\([^;]*, 403\);/);
});

test("DELETE media checks isMediaPathAllowed", () => {
  const media = deleteHandler.slice(deleteHandler.indexOf('case "media":'));
  assert.match(media, /if \(!isMediaPathAllowed\(normalizedPath, schema\.extensions\)\) throw/);
});

test("rename content refuses when either path is a single-file path", () => {
  const rename = read("app/api/[owner]/[repo]/[branch]/files/[path]/rename/route.ts");
  assert.match(rename, /isSingleFilePath\(config\.object\.content, normalizedPath\) \|\| isSingleFilePath\(config\.object\.content, normalizedNewPath\)\) throw new Error\(`Renaming content of type "file" isn't allowed\.`\);/);
});
