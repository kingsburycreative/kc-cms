import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dashboardTiles, recentEdits } from "../dashboard.ts";

const ctx = { owner: "kc", repo: "henike", branch: "main" };
const config = {
  content: [
    { type: "file", name: "home", label: "Home page", path: "content/home.md" },
    { type: "collection", name: "posts", label: "Posts", path: "content/posts" },
    { type: "group", name: "more", items: [{ type: "file", name: "about", label: "About", path: "content/about.md" }] },
  ],
  media: [{ name: "images" }],
};

test("tiles follow the config, then Media and History", () => {
  const tiles = dashboardTiles(config, ctx);
  assert.deepEqual(tiles.map((t) => t.key), ["file-home", "collection-posts", "file-about", "media", "history"]);
  assert.equal(tiles[1].href, "/kc/henike/main/collection/posts");
  assert.equal(tiles[3].href, "/kc/henike/main/media/images");
  assert.equal(tiles[4].href, "/kc/henike/main/history");
});

test("no media and no content gives History only", () => {
  assert.deepEqual(dashboardTiles({}, ctx).map((t) => t.key), ["history"]);
});

test("Insights tile only with access", () => {
  assert.equal(dashboardTiles(config, ctx).some((t) => t.key === "insights"), false);
  assert.equal(dashboardTiles(config, { ...ctx, hasInsights: false }).some((t) => t.key === "insights"), false);
  const tiles = dashboardTiles(config, { ...ctx, hasInsights: true });
  assert.equal(tiles.at(-1)?.href, "/kc/henike/main/insights");
});

test("recent edits keep title, date, author name and path only, capped", () => {
  const items = [
    { sha: "a", parentSha: "p", date: "2026-10-01T10:00:00Z", authorName: "Sam", path: "content/home.md", email: "s@x.com", avatar: "u" },
    { sha: "b", commit: { author: { name: "Rob", date: "2026-09-01T10:00:00Z" } }, path: "content/posts" },
    { sha: "c", date: "2026-08-01T10:00:00Z", authorName: "Sam", path: "content/notes/odd.md" },
  ];
  const edits = recentEdits(items, 2, config);
  assert.equal(edits.length, 2);
  assert.deepEqual(edits[0], { title: "Home page", date: "2026-10-01T10:00:00Z", authorName: "Sam", path: "content/home.md" });
  assert.deepEqual(Object.keys(edits[1]).sort(), ["authorName", "date", "path", "title"]);
  assert.equal(edits[1].authorName, "Rob");
  assert.equal(recentEdits(items, 3, config)[2].title, "odd");
});

test("the branch page no longer redirects to the first content item", () => {
  const src = readFileSync(new URL("../../app/(main)/[owner]/[repo]/[branch]/page.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(src, /router\.replace/);
  assert.match(src, /Dashboard/);
});
