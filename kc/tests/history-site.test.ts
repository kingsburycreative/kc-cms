import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { contentPaths, mergeSiteFeed } from "../history/site.ts";
import { refIsOnBranch, refOnBranch } from "../history/ref-check.ts";

const read = (path: string) => readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
const lists = JSON.parse(read("kc/tests/fixtures/history/site-lists.json"));
const api = "app/api/[owner]/[repo]/[branch]/";

test("content paths are the collection and file schema paths, once each", () => {
  const config = { content: [
    { type: "collection", path: "content/posts" },
    { type: "file", path: "data/site.yml" },
    { type: "collection", path: "content/posts" },
    { type: "media", path: "images" },
  ] };
  assert.deepEqual(contentPaths(config), ["content/posts", "data/site.yml"]);
  assert.deepEqual(contentPaths(null), []);
});

test("staff feed merges newest first, drops duplicate shas, keeps settings", () => {
  const feed = mergeSiteFeed(lists, { limit: 10, source: "user" });
  assert.deepEqual(feed.map((item) => item.sha), ["s9", "c4", "c3", "c2", "c1"]);
});

test("the feed caps at the limit", () => {
  assert.deepEqual(mergeSiteFeed(lists, { limit: 2, source: "user" }).map((item) => item.sha), ["s9", "c4"]);
});

test("client feed drops .pages.yml and redacts every item", () => {
  const feed = mergeSiteFeed(lists, { limit: 10, source: "installation" });
  assert.deepEqual(feed.map((item) => item.sha), ["c4", "c3", "c2", "c1"]);
  for (const item of feed) {
    assert.deepEqual(Object.keys(item).sort(), ["authorName", "date", "parentSha", "path", "sha"]);
  }
  assert.equal((feed[1] as { authorName: string }).authorName, "ann");
  assert.doesNotMatch(JSON.stringify(feed), /@|github\.com|avatar/);
});

test("a ref is readable only when the branch is ahead of it or identical", () => {
  assert.equal(refIsOnBranch("ahead"), true);
  assert.equal(refIsOnBranch("identical"), true);
  for (const status of ["behind", "diverged", "", null, undefined]) {
    assert.equal(refIsOnBranch(status), false, String(status));
  }
});

const fakeCompare = (status: string | Error) => {
  const calls: unknown[] = [];
  const octokit = { rest: { repos: { compareCommits: async (args: unknown) => {
    calls.push(args);
    if (status instanceof Error) throw status;
    return { data: { status } };
  } } } };
  return { octokit, calls };
};

test("the compare helper puts the ref as base and the branch as head", async () => {
  const { octokit, calls } = fakeCompare("ahead");
  assert.equal(await refOnBranch(octokit, "o", "r", "main", "abc"), true);
  assert.deepEqual(calls, [{ owner: "o", repo: "r", base: "abc", head: "main" }]);
  assert.equal(await refOnBranch(fakeCompare("diverged").octokit, "o", "r", "main", "abc"), false);
  assert.equal(await refOnBranch(fakeCompare(new Error("404")).octokit, "o", "r", "main", "abc"), false);
});

test("site history route takes the branch lock before listing commits", () => {
  const source = read(`${api}history/route.ts`);
  const lock = source.indexOf("await assertBranchAllowed(source, token, params.owner, params.repo, params.branch)");
  assert.ok(lock !== -1 && lock < source.indexOf("listCommits("));
  assert.match(source, /mergeSiteFeed\(lists, \{ limit, source \}\)/);
});

test("entries route checks ref against the branch before getContent", () => {
  const source = read(`${api}entries/[path]/route.ts`);
  const check = source.search(/if \(ref && !\(await refOnBranch\(octokit, params\.owner, params\.repo, params\.branch, ref\)\)\)/);
  assert.ok(check !== -1 && check < source.indexOf("getContent("));
  assert.match(source, /ref: ref \|\| params\.branch/);
});
