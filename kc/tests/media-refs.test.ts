import { test } from "node:test";
import assert from "node:assert/strict";
import { findMediaRefs, assertMediaUnused, MEDIA_IN_USE } from "../media-refs.ts";

const media = { input: "public/images", output: "/images" };
const roots = ["src/content/pages"];

test("finds a reference by input path", () => {
  const files = [{ path: "src/content/pages/a.md", content: "image: public/images/hero.jpg" }];
  assert.deepEqual(findMediaRefs("public/images/hero.jpg", media, files, roots), ["src/content/pages/a.md"]);
});

test("finds a reference by output path, with or without a leading slash", () => {
  const files = [
    { path: "src/content/pages/a.md", content: "![x](/images/hero.jpg)" },
    { path: "src/content/pages/b.md", content: "src: images/hero.jpg" },
  ];
  assert.deepEqual(findMediaRefs("/public/images/hero.jpg", media, files, roots), ["src/content/pages/a.md", "src/content/pages/b.md"]);
});

test("allows an unreferenced file", () => {
  const files = [{ path: "src/content/pages/a.md", content: "image: /images/other.jpg" }];
  assert.deepEqual(findMediaRefs("public/images/hero.jpg", media, files, roots), []);
});

test("ignores a reference in a non-content file (src code)", () => {
  const files = [{ path: "src/components/Hero.astro", content: "import hero from '/images/hero.jpg'" }];
  assert.deepEqual(findMediaRefs("public/images/hero.jpg", media, files, roots), []);
});

test("caps the list at five", () => {
  const files = Array.from({ length: 8 }, (_, i) => ({ path: `src/content/pages/${i}.md`, content: "/images/hero.jpg" }));
  assert.equal(findMediaRefs("public/images/hero.jpg", media, files, roots).length, 5);
});

test("the 409 carries the friendly message naming the pages", async () => {
  const content = [{ type: "collection", path: "src/content/pages" }];
  const readDir = async () => [{ path: "src/content/pages/a.md", content: "/images/hero.jpg" }];
  const make = (message: string, status: number) => Object.assign(new Error(message), { status });
  await assert.rejects(
    assertMediaUnused("public/images/hero.jpg", media, content, readDir, make),
    (error: Error & { status: number }) => {
      assert.equal(error.status, 409);
      assert.equal(error.message, MEDIA_IN_USE(["src/content/pages/a.md"]));
      assert.match(error.message, /still used on these pages: src\/content\/pages\/a\.md\. Remove it/);
      assert.doesNotMatch(error.message, /409|Failed to delete/);
      return true;
    },
  );
});
