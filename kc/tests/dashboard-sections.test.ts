import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// The section guard: every heading in the approved mockup's <main> must exist in
// the dashboard source, every panel must draw its heading, and the old shapes
// must stay gone.
const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");
const mockup = read("../../.claude/work/39-plan-dashboard/mockup/index.html");
const layout = read("../dashboard.tsx");
const server = read("../dashboard-server.tsx");
const page = read("../../app/(main)/[owner]/[repo]/[branch]/page.tsx");

const main = mockup.slice(mockup.indexOf("<main"), mockup.indexOf("</main>"));
// The "Other states" block is the mockup's own key, not a dashboard section.
const sections = main.slice(0, main.indexOf('<section class="states"'));
const strip = (html: string) => html.replace(/<[^>]+>/g, "").trim();
const headings = [...sections.matchAll(/<h([12])[^>]*>([\s\S]*?)<\/h\1>/g)].map((m) => ({ level: m[1], text: strip(m[2]) }));

test("the mockup holds the nine headings the guard expects", () => {
  assert.deepEqual(headings.map((h) => h.text), [
    "BeSciWorks",
    "Add something new",
    "Visits",
    "Last 30 days compared with the 30 before",
    "Recent changes",
    "Search health",
    "Most viewed pages",
    "Where visitors come from",
    "Staff only",
  ]);
  // Every aria-labelledby landmark points at one of them.
  for (const m of sections.matchAll(/aria-labelledby="([^"]+)"/g)) {
    assert.match(sections, new RegExp(`<h[12] id="${m[1]}"`), m[1]);
  }
});

for (const { level, text } of headings) {
  test(`the dashboard draws the "${text}" heading`, () => {
    if (level === "1") {
      assert.match(layout, /<h1[^>]*>\{clientName\(object\.kc, config\.repo\)\}<\/h1>/);
      return;
    }
    const literal = new RegExp(`<h2[^>]*>${text}</h2>`);
    assert.ok(literal.test(layout) || literal.test(server), `missing section: ${text}`);
  });
}

// Each server panel sits in page.tsx inside Suspense with its own skeleton.
const PANELS = [
  ["PublishSkeleton", "PublishLine"],
  ["VisitsSkeleton", "VisitsPanel"],
  ["SearchHealthSkeleton", "SearchHealthPanel"],
  ["TopListsSkeleton", "TopLists"],
  ["VersionSkeleton", "VersionLine"],
  ["StaffSkeleton", "StaffStrip"],
];

test("each section's panel is passed from page.tsx inside Suspense with its skeleton", () => {
  for (const [skeleton, panel] of PANELS) {
    assert.match(page, new RegExp(`<Suspense fallback={<${skeleton} />}><${panel}\\b`), panel);
  }
  for (const prop of ["publish", "visits", "searchHealth", "topLists", "version", "staffStrip"]) {
    assert.match(layout, new RegExp(`\\{(staff && )?${prop}\\}`), prop);
  }
  assert.match(layout, /<RecentChanges /);
  assert.match(server, /<StatTiles /);
});

// Exactly three pieces may draw nothing: no Pages project, no kc.site, a client session.
const MAY_VANISH = ["PublishLine", "LiveSiteLink", "StaffStrip"];

function components(src: string) {
  const out: { name: string; body: string }[] = [];
  const starts = [...src.matchAll(/^(?:export )?(?:async )?function ([A-Z]\w*)\(/gm)];
  starts.forEach((m, i) => out.push({ name: m[1], body: src.slice(m.index, starts[i + 1]?.index) }));
  return out;
}

test("no panel returns null before its heading, except the three allowed", () => {
  const vanishing = [...components(layout), ...components(server)]
    .filter((c) => c.name !== "Dashboard" && /return null\b/.test(c.body))
    .map((c) => c.name)
    .sort();
  assert.deepEqual(vanishing, [...MAY_VANISH].sort());
});

test("search health keeps its heading when nothing could be checked", () => {
  const s = components(server).find((c) => c.name === "SearchHealthPanel")!.body;
  assert.match(s, /health\.checked === 0\s*\? <p[^>]*>\{NO_PAGES\}<\/p>/);
  assert.match(server, /NO_PAGES = "No pages to check yet\."/);
});

test("the old shapes are gone", () => {
  assert.doesNotMatch(layout + server, /by \$\{[^}]*authorName\}/);
  assert.doesNotMatch(layout, /edit\.path/);
  assert.doesNotMatch(layout, /bg-primary\/10 px-3/);
  // The path shows only behind the staff flag.
  assert.match(layout, /\{staff && <span[^>]*>\{item\.path\}<\/span>\}/);
  assert.equal((layout.match(/item\.path/g) ?? []).length, 2);
});

test("quick actions are buttons of one variant around a Link, with no underline", () => {
  const block = layout.slice(layout.indexOf("actions.map("), layout.indexOf("</ul>", layout.indexOf("actions.map(")));
  assert.match(block, /<Button asChild variant="secondary"[^>]*>\s*<Link href=\{action\.href\}>/);
  assert.equal((block.match(/<Button\b/g) ?? []).length, 1);
  assert.equal((block.match(/variant=/g) ?? []).length, 1);
  assert.match(block, /min-h-11/);
  assert.doesNotMatch(block, /underline/);
});

test("the three tiles are Visitors, Pages viewed and Time on site, each with a sparkline", () => {
  const tiles = [...server.matchAll(/<StatTile label="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(tiles, ["Visitors", "Pages viewed", "Time on site"]);
  const tile = components(read("../stat-tile.tsx")).find((c) => c.name === "StatTile")!.body;
  assert.match(tile, /<svg data-spark/);
  assert.doesNotMatch(tile, /\{path && <svg|return null/);
});

test("page.tsx checks repo read access before any panel", () => {
  const check = page.indexOf("await getRepoReadContext(");
  assert.ok(check > 0);
  for (const [, panel] of PANELS) assert.ok(page.indexOf(`<${panel}`) > check, panel);
  assert.equal((page.match(/decodeURIComponent\(/g) ?? []).length, 1);
  assert.doesNotMatch(server, /decodeURIComponent\(/);
});

test("a client's payload never holds the staff strip", () => {
  // Gated on the server twice: page.tsx only builds it for staff, and the strip checks again.
  assert.match(page, /staffStrip=\{hasGithubIdentity\(user\) \? <Suspense fallback=\{<StaffSkeleton \/>\}><StaffStrip /);
  const strip = components(server).find((c) => c.name === "StaffStrip")!.body;
  assert.match(strip.split(/\r?\n/)[1], /^\s*if \(!hasGithubIdentity\(user\)\) return null;$/);
  // The client layout renders what the server built; it holds no second gate that a session shape could trip.
  assert.match(layout, /\{staffStrip\}/);
  assert.doesNotMatch(layout, /staff && staffStrip/);
  // Nothing staff-only lives in the client layout.
  assert.doesNotMatch(layout, /Staff only|Google Analytics|getVersionStatus|insightsSourcesFor/);
});
