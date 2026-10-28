import { test } from "node:test";
import assert from "node:assert/strict";
import { findMediaRefs, assertMediaUnused, githubRepoReader, MEDIA_IN_USE, type RepoReader } from "../media-refs.ts";

const media = { input: "public/images", output: "/images" };
const roots = ["src/content/pages"];
const make = (message: string, status: number) => Object.assign(new Error(message), { status });

/** A repo of text files; `big` and `read` let tests check skipping and reads. */
function fakeRepo(files: Record<string, string>, sizes: Record<string, number> = {}) {
  const read: string[] = [];
  const repo: RepoReader & { read: string[] } = {
    read,
    tree: async () => Object.keys(files).map((path) => ({ path, type: "blob", sha: path, size: sizes[path] ?? files[path].length })),
    blob: async (sha) => { read.push(sha); return files[sha]; },
  };
  return repo;
}

const config = [
  { type: "file", path: "src/data/site.json" },
  { type: "collection", path: "src/content/posts" },
];

async function refsFor(files: Record<string, string>, mediaPath = "public/images/hero.jpg", m: { input: string; output?: string } = media) {
  try {
    await assertMediaUnused(mediaPath, m, config, fakeRepo(files), make);
    return [];
  } catch (error) {
    return [(error as Error).message];
  }
}

test("blocks on a type: file JSON entry", async () => {
  assert.deepEqual(await refsFor({ "src/data/site.json": '{"logo":"/images/hero.jpg"}' }), [MEDIA_IN_USE(["src/data/site.json"])]);
});

test("blocks on a file in a nested collection subfolder", async () => {
  assert.deepEqual(await refsFor({ "src/content/posts/2026/10/a.md": "image: images/hero.jpg" }), [MEDIA_IN_USE(["src/content/posts/2026/10/a.md"])]);
});

test("blocks on a src import by relative path", async () => {
  const m = { input: "src/assets", output: "" };
  const files = { "src/components/home/Hero.astro": 'import hero from "../../assets/hero.jpg";\n<Image src={hero} />' };
  assert.deepEqual(await refsFor(files, "src/assets/hero.jpg", m), [MEDIA_IN_USE(["src/components/home/Hero.astro"])]);
});

test("a relative import of a different file does not block", async () => {
  const m = { input: "src/assets", output: "" };
  assert.deepEqual(await refsFor({ "src/components/Hero.astro": 'import x from "../assets/other.jpg"' }, "src/assets/hero.jpg", m), []);
});

test("blocks on the public output path in src code", async () => {
  assert.deepEqual(await refsFor({ "src/layouts/Base.astro": '<img src="/images/hero.jpg">' }), [MEDIA_IN_USE(["src/layouts/Base.astro"])]);
});

test("allows a file nothing references", async () => {
  assert.deepEqual(await refsFor({ "src/data/site.json": '{"logo":"/images/logo.png"}', "src/pages/index.astro": "<h1>Hi</h1>" }), []);
});

test("skips blobs over 1 MB and binary files without reading them", async () => {
  const files = { "src/content/posts/huge.md": "/images/hero.jpg", "src/assets/icon.svg": "/images/hero.jpg", "src/content/posts/a.md": "nothing" };
  const repo = fakeRepo(files, { "src/content/posts/huge.md": 1024 * 1024 + 1 });
  await assertMediaUnused("public/images/hero.jpg", media, config, repo, make);
  assert.deepEqual(repo.read, ["src/content/posts/a.md"]);
});

test("the GitHub reader makes one recursive tree call per delete", async () => {
  const calls = { tree: 0, blob: 0 };
  const octokit = {
    rest: {
      git: {
        getTree: async (args: { recursive: string; tree_sha: string }) => {
          calls.tree++;
          assert.equal(args.recursive, "1");
          assert.equal(args.tree_sha, "main");
          return { data: { tree: [
            { path: "src/content/posts/a.md", type: "blob", sha: "s1", size: 10 },
            { path: "src/content/posts/b.md", type: "blob", sha: "s2", size: 10 },
            { path: "src/content/posts", type: "tree", sha: "t1" },
          ] } };
        },
        getBlob: async () => {
          calls.blob++;
          return { data: { content: Buffer.from("hello").toString("base64"), encoding: "base64" } };
        },
      },
    },
  };
  await assertMediaUnused("public/images/hero.jpg", media, config, githubRepoReader(octokit, "o", "r", "main"), make);
  assert.deepEqual(calls, { tree: 1, blob: 2 });
});

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

test("ignores a file outside every root", () => {
  const files = [{ path: "scripts/build.mjs", content: "/images/hero.jpg" }];
  assert.deepEqual(findMediaRefs("public/images/hero.jpg", media, files, roots), []);
});

test("caps the list at five", () => {
  const files = Array.from({ length: 8 }, (_, i) => ({ path: `src/content/pages/${i}.md`, content: "/images/hero.jpg" }));
  assert.equal(findMediaRefs("public/images/hero.jpg", media, files, roots).length, 5);
});

test("the 409 carries the friendly message naming the pages", async () => {
  const content = [{ type: "collection", path: "src/content/pages" }];
  const repo = fakeRepo({ "src/content/pages/a.md": "/images/hero.jpg" });
  await assert.rejects(
    assertMediaUnused("public/images/hero.jpg", media, content, repo, make),
    (error: Error & { status: number }) => {
      assert.equal(error.status, 409);
      assert.equal(error.message, MEDIA_IN_USE(["src/content/pages/a.md"]));
      assert.match(error.message, /still used on these pages: src\/content\/pages\/a\.md\. Remove it/);
      assert.doesNotMatch(error.message, /409|Failed to delete/);
      return true;
    },
  );
});
