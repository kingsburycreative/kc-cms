import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DEFAULT_MEDIA_EXTENSIONS, isMediaPathAllowed } from "../media-types.ts";

const read = (path: string) => readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
const api = "app/api/[owner]/[repo]/[branch]/";

test("the default list is exactly the safe image and pdf types", () => {
  assert.deepEqual([...DEFAULT_MEDIA_EXTENSIONS], ["jpg", "jpeg", "png", "webp", "avif", "gif", "pdf"]);
});

for (const [label, list] of [["no list", undefined], ["an empty list", []]] as const) {
  test(`with ${label}, each safe type passes, in any case`, () => {
    for (const extension of ["jpg", "jpeg", "png", "webp", "avif", "gif", "pdf"]) {
      assert.equal(isMediaPathAllowed(`public/media/photo.${extension}`, list), true, extension);
    }
    assert.equal(isMediaPathAllowed("public/media/PHOTO.JPG", list), true);
  });

  test(`with ${label}, svg, html, js, a double extension and no extension are refused`, () => {
    for (const path of ["public/media/logo.svg", "public/media/page.html", "public/media/app.js", "public/media/photo.jpg.html", "public/media/photo", "public/media/.gitkeep", "public/media/photo."]) {
      assert.equal(isMediaPathAllowed(path, list), false, path);
    }
  });
}

test("a config's own list is honoured, not merged with the default", () => {
  assert.equal(isMediaPathAllowed("public/media/logo.svg", ["svg"]), true);
  assert.equal(isMediaPathAllowed("public/media/photo.jpg", ["svg"]), false);
});

test("a config's own list keeps its exact, case-sensitive match", () => {
  assert.equal(isMediaPathAllowed("public/media/LOGO.SVG", ["svg"]), false);
});

test("a path holding a control character is refused, under the default list and a config's own", () => {
  for (const list of [undefined, [], ["jpg"], ["jpg", "html"]]) {
    for (const path of ["public/media/photo.html\u0000.jpg", "public/media/photo\n.jpg", "public/media/photo.jpg\u007F"]) {
      assert.equal(isMediaPathAllowed(path, list), false, `${JSON.stringify(path)} with ${JSON.stringify(list)}`);
    }
  }
});

// Only the POST handler writes; DELETE keeps upstream's check so an existing
// file of any type can still be removed.
test("the upload route checks media through the helper", () => {
  const source = read(`${api}files/[path]/route.ts`);
  const from = source.indexOf("export async function POST");
  const to = source.indexOf("export async function DELETE");
  assert.ok(from !== -1 && to > from, "missing the POST or DELETE handler");
  const post = source.slice(from, to);
  assert.match(source, /import \{ isMediaPathAllowed \} from "@\/kc\/media-types";/);
  assert.match(post, /if \(!isMediaPathAllowed\(normalizedPath, schema\.extensions\)\) throw /);
  assert.doesNotMatch(post, /schema\.extensions\?\.length > 0/);
});

test("the rename route checks both the old and the new media path through the helper", () => {
  const source = read(`${api}files/[path]/rename/route.ts`);
  assert.match(source, /import \{ isMediaPathAllowed \} from "@\/kc\/media-types";/);
  assert.match(source, /if \(!isMediaPathAllowed\(normalizedPath, schema\.extensions\)\) throw /);
  assert.match(source, /if \(!isMediaPathAllowed\(normalizedNewPath, schema\.extensions\)\) throw /);
  assert.doesNotMatch(source, /schema\.extensions\?\.length > 0/);
});
