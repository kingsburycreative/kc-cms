import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { activitySentence, changeVerb, dashboardTiles, healthEntries, initials, quickActions, recentActivity, recentEdits } from "../dashboard.ts";

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

test("hrefs use the short address for owner kingsburycreative on main only", () => {
  const short = { owner: "kingsburycreative", repo: "besciworks", branch: "main", hasInsights: true };
  const hrefs = [...dashboardTiles(config, short), ...quickActions(config, short)].map((t) => t.href);
  assert.ok(hrefs.length > 5);
  for (const href of hrefs) assert.ok(href.startsWith("/besciworks/"), href);
  for (const other of [{ ...short, owner: "acme" }, { ...short, branch: "dev" }]) {
    const full = [...dashboardTiles(config, other), ...quickActions(config, other)].map((t) => t.href);
    for (const href of full) assert.ok(href.startsWith(`/${other.owner}/besciworks/${other.branch}/`), href);
  }
});

test("the /api/ literals in the touched files are unchanged", () => {
  const files = [
    "kc/client-view.ts", "kc/dashboard.ts", "kc/dashboard.tsx", "kc/history/history-view.tsx",
    "components/repo/repo-nav.tsx", "components/repo/repo-sidebar.tsx", "components/repo/repo-dropdown.tsx",
    "components/repo/repo-branches.tsx", "components/repo/repo-latest.tsx",
    "components/repo/repo-action-buttons.tsx", "components/repo/repo-templates.tsx",
  ];
  const count = files.reduce((n, f) => n + (readFileSync(f, "utf8").match(/\/api\//g) ?? []).length, 0);
  assert.equal(count, 8);
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

const besci = {
  kc: { actions: { weekly: "New Weekly post", papers: "New paper", briefs: "New Insight Brief" } },
  content: [
    { type: "file", name: "home", label: "Home" },
    { type: "collection", name: "weekly", label: "Weekly" },
    { type: "group", name: "g", items: [{ type: "collection", name: "papers", label: "Papers" }] },
    { type: "collection", name: "what works", label: "What Works" },
    { type: "collection", name: "briefs", label: "Briefs" },
  ],
  media: [{ name: "files", extensions: ["pdf"] }],
};

test("quick actions: labelled collections in config order, then Upload a PDF", () => {
  const actions = quickActions(besci, ctx);
  assert.deepEqual(actions.map((a) => a.label), ["New Weekly post", "New paper", "New Insight Brief", "Upload a PDF"]);
  assert.equal(actions[0].href, "/kc/henike/main/collection/weekly/new");
  assert.equal(actions[3].href, "/kc/henike/main/media/files");
  assert.equal(quickActions({ ...besci, content: [{ type: "collection", name: "what works" }], kc: {} }, ctx)[0].href, "/kc/henike/main/collection/what%20works/new");
});

test("quick actions fall back to Add to <label>", () => {
  const labels = quickActions({ ...config, media: [] }, ctx).map((a) => a.label);
  assert.deepEqual(labels, ["Add to Posts"]);
});

test("quick actions skip file nodes and need a collection", () => {
  const onlyFiles = { content: [{ type: "file", name: "home", label: "Home" }] };
  assert.deepEqual(quickActions(onlyFiles, ctx), []);
  assert.deepEqual(quickActions({}, ctx), []);
});

test("no Upload a PDF when the media folder is images only", () => {
  const images = { content: [], media: [{ name: "images", extensions: ["png", "jpg"] }] };
  assert.deepEqual(quickActions(images, ctx), []);
});

test("initials take the first and last name", () => {
  assert.equal(initials("David Mills"), "DM");
  assert.equal(initials("rob de kingsbury"), "RK");
  assert.equal(initials("sam"), "S");
  assert.equal(initials("  "), "?");
  assert.equal(initials(null), "?");
});

test("the verb comes from the commit message, else changed", () => {
  assert.equal(changeVerb("Create content/weekly/a.md (via Pages CMS)"), "added");
  assert.equal(changeVerb("Update content/home.json (via Pages CMS)"), "updated");
  assert.equal(changeVerb("Upload files/report.pdf"), "uploaded");
  assert.equal(changeVerb("Merge branch"), "changed");
  assert.equal(changeVerb(undefined), "changed");
});

test("activity sentences read plainly with first names", () => {
  assert.equal(activitySentence("David Mills", "updated", "Home page", "file"), "David updated Home page");
  assert.equal(activitySentence("David", "added", "Posts", "collection"), "David added an entry in Posts");
  assert.equal(activitySentence("", "changed", "odd", null), "Someone changed odd");
});

test("recent activity gives initials, a sentence, the date and the path from a fixture feed", () => {
  const items = [
    { sha: "a", date: "2026-10-01T10:00:00Z", authorName: "Sam Lee", path: "content/home.md" },
    { sha: "b", commit: { message: "Create content/posts/x.md", author: { name: "Rob Kingsbury", date: "2026-09-01T10:00:00Z" } }, path: "content/posts" },
  ];
  assert.deepEqual(recentActivity(items, 5, config), [
    { initials: "SL", sentence: "Sam changed Home page", date: "2026-10-01T10:00:00Z", path: "content/home.md" },
    { initials: "RK", sentence: "Rob added an entry in Posts", date: "2026-09-01T10:00:00Z", path: "content/posts" },
  ]);
});

test("a file-type schema goes through the health loop beside collections", async () => {
  const content = [
    { type: "file", name: "home", path: "src/content/pages/home.json", format: "json", fields: [{ name: "title" }, { name: "description" }] },
    { type: "file", name: "nav", path: "src/nav.json", fields: [{ name: "items" }] },
    { type: "file", name: "list", path: "src/list.json", list: true, fields: [{ name: "title" }, { name: "description" }] },
    { type: "collection", name: "weekly", path: "src/content/weekly", fields: [{ name: "title" }, { name: "description" }] },
    { type: "collection", name: "papers", path: "src/content/papers", fields: [{ name: "title" }] },
  ];
  const read: string[] = [];
  const entries = await healthEntries(content, {
    file: async (schema) => (read.push(schema.path!), '{"title":"Home","description":"Hello"}'),
    collection: async (schema) => (read.push(schema.path!), [
      { type: "file", path: "src/content/weekly/a.md", content: "---\ntitle: A\n---" },
      { type: "dir", path: "src/content/weekly/sub" },
      { type: "file", path: "src/content/weekly/bad.md", content: "bad" },
    ]),
    parse: (text) => {
      if (text === "bad") throw new Error("parse");
      return text.startsWith("{") ? JSON.parse(text) : { title: "A" };
    },
  });
  assert.deepEqual(read, ["src/content/pages/home.json", "src/content/weekly"]);
  assert.deepEqual(entries, [
    { name: "home", path: "src/content/pages/home.json", values: { title: "Home", description: "Hello" } },
    { name: "weekly", path: "src/content/weekly/a.md", values: { title: "A" } },
  ]);
});

test("a failed read skips that schema, not the rest", async () => {
  const content = [
    { type: "file", name: "a", path: "a.json", fields: [{ name: "title" }, { name: "description" }] },
    { type: "file", name: "b", path: "b.json", fields: [{ name: "title" }, { name: "description" }] },
  ];
  const entries = await healthEntries(content, {
    file: async (schema) => { if (schema.name === "a") throw new Error("404"); return "{}"; },
    collection: async () => [],
    parse: () => ({}),
  });
  assert.deepEqual(entries.map((e) => e.name), ["b"]);
});

test("the branch page no longer redirects to the first content item", () => {
  const src = readFileSync(new URL("../../app/(main)/[owner]/[repo]/[branch]/page.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(src, /router\.replace/);
  assert.match(src, /Dashboard/);
});

const pageSrc = () => readFileSync(new URL("../../app/(main)/[owner]/[repo]/[branch]/page.tsx", import.meta.url), "utf8");
const layoutSrc = () => readFileSync(new URL("../dashboard.tsx", import.meta.url), "utf8");

test("the branch page runs getRepoReadContext before any panel", () => {
  const src = pageSrc();
  const check = src.indexOf("await getRepoReadContext(");
  assert.ok(check > 0);
  for (const panel of ["<VisitsPanel", "<SearchHealthPanel", "<VersionLine"]) {
    assert.ok(src.indexOf(panel) > check, panel);
  }
});

test("each panel sits in Suspense with its skeleton", () => {
  const src = pageSrc();
  for (const [skeleton, panel] of [["VisitsSkeleton", "VisitsPanel"], ["SearchHealthSkeleton", "SearchHealthPanel"], ["VersionSkeleton", "VersionLine"]]) {
    assert.match(src, new RegExp(`<Suspense fallback={<${skeleton} />}><${panel}\\b`), panel);
  }
});

test("the layout is mobile first with no tile grid", () => {
  const src = layoutSrc();
  assert.doesNotMatch(src, /max-width|max-\[|uppercase/);
  assert.doesNotMatch(src, /dashboardTiles|lg:grid-cols-3/);
  assert.doesNotMatch(src, /—/);
  assert.match(src, /@container/);
  assert.match(src, /history\?limit=/);
});

test("quick actions render before the visits panel", () => {
  const src = layoutSrc();
  const actions = src.indexOf("actions.map(");
  assert.ok(actions > 0 && actions < src.indexOf("{visits}"));
});

test("See live site only from an https kc.site", () => {
  const src = layoutSrc();
  assert.match(src, /siteUrl\(object\.kc\)/);
  assert.match(src, /<LiveSiteLink site=\{site\} \/>/);
  assert.match(src, /if \(!site\) return null;/);
});

test("recent changes load behind pulsing skeleton rows, not text", () => {
  const src = layoutSrc();
  assert.doesNotMatch(src, /Loading recent edits/);
  const loading = src.slice(src.indexOf("items === null"), src.indexOf("items.length === 0"));
  assert.match(loading, /Array\.from\(\{ length: LIMIT \}/);
  assert.match(loading, /animate-pulse[^"]*motion-reduce:animate-none/);
});
