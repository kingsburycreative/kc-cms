import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";

// dashboard-server.tsx imports "@/" server modules and JSX, which the runner
// cannot load, so the pure helpers are cut out of the source and run on their own.
const server = readFileSync(new URL("../dashboard-server.tsx", import.meta.url), "utf8");
const skeleton = readFileSync(new URL("../dashboard-skeleton.tsx", import.meta.url), "utf8");

const between = (from: string, to: string) => server.slice(server.indexOf(from), server.indexOf(to));
const helpers = stripTypeScriptTypes(between("export function versionFor", "export function visitsView").replace(/export /g, ""));
const { versionFor, versionText } = new Function(`${helpers}; return { versionFor, versionText };`)();

const body = (name: string) => {
  const start = server.indexOf(`export async function ${name}`);
  const next = server.indexOf("\nexport ", start + 1);
  return server.slice(start, next === -1 ? undefined : next);
};

test("a client's version props hold no tag, url or version string", () => {
  const client = versionFor({ state: "behind", tag: "v2.4.0", url: "https://x" }, false);
  assert.deepEqual(client, { state: "behind" });
  assert.doesNotMatch(JSON.stringify(client), /tag|url|\d+\.\d+/);
  assert.equal(versionText(client), "A CMS update is available.");
});

test("staff get the full version status", () => {
  assert.deepEqual(versionFor({ state: "behind", tag: "v2.4.0" }, true), { state: "behind", tag: "v2.4.0" });
  assert.equal(versionText({ state: "behind", tag: "v2.4.0" }), "Pages CMS v2.4.0 is out.");
});

test("VersionLine decides staff on the server from the user", () => {
  assert.match(body("VersionLine"), /versionFor\(await getVersionStatus\(\), hasGithubIdentity\(user\)\)/);
});

test("the visits panel is only built behind getInsightsAccess", () => {
  const v = body("VisitsPanel");
  const gate = v.indexOf("getInsightsAccess(");
  assert.ok(gate > 0);
  assert.match(v, /const allowed = !!ctx && \(await getInsightsAccess\(/);
  assert.match(v, /const sources = allowed \? await insightsSourcesFor\(/);
  assert.ok(gate < v.indexOf("insightsSourcesFor("));
  assert.ok(gate < v.indexOf("loadSeries("));
  assert.match(v, /= sources\s*\? await Promise\.all/);
});

test("the series cache key is the site, not the user", () => {
  const v = body("VisitsPanel");
  assert.match(v, /site: seriesSiteKey\(ref\.owner, ref\.repo\)/);
  assert.match(v, /cache: defaultSeriesCache/);
  assert.match(server, /import \{[^}]*seriesSiteKey[^}]*\} from "\.\/insights\/route\.ts"/);
  assert.doesNotMatch(v, /site:[^\n]*user/);
});

test("no sources keeps the heading and a null series renders the fallback, not a throw", () => {
  const v = body("VisitsPanel");
  assert.doesNotMatch(v, /return null/);
  assert.match(v, /\.catch\(\(\) => null\)/);
  assert.match(server, /visitsView\(series: Series \| null\)[\s\S]*?ok: false as const, sentence: VISITS_FALLBACK/);
  assert.match(server, /VISITS_FALLBACK = "Visit numbers aren't available right now\."/);
});

test("the visits panel and every stat box use the panel state, with the staff link for staff only", () => {
  const v = body("VisitsPanel");
  assert.match(v, /panelState\(\{ configured: !!sources, ok: view\.ok, staff: !!ctx && hasGithubIdentity\(ctx\.user as User\) \}\)/);
  assert.match(v, /\{COULD_NOT_LOAD\}/);
  assert.match(v, /<StatTiles [^>]*state=\{state\}/);
  const tiles = server.slice(server.indexOf("export function StatTiles"), server.indexOf("export async function VisitsPanel"));
  assert.equal((tiles.match(/<Tile [^\n]*state=\{state\} \/>/g) ?? []).length, 3);
  const tile = server.slice(server.indexOf("function Tile("), server.indexOf("export function duration"));
  assert.match(tile, /\{TILE_COULD_NOT_LOAD\}/);
  assert.doesNotMatch(tile, /not-set-up|StaffLink/);
  assert.match(server, /<aside id="analytics-ids"/);
});

test("not set up renders one banner with the staff link once, and returns before the tiles", () => {
  const v = body("VisitsPanel");
  const banner = v.slice(v.indexOf('if (state.kind === "not-set-up")'), v.indexOf('<div className="grid grid-cols-1'));
  assert.match(banner, /\{NOT_SET_UP\}/);
  assert.equal((banner.match(/<StaffLink \/>/g) ?? []).length, 1);
  assert.match(banner, /\{state\.staffLink && <StaffLink \/>\}/);
  assert.doesNotMatch(banner, /StatTiles/);
  assert.equal((v.match(/<StaffLink \/>/g) ?? []).length, 1);
  assert.equal((v.match(/<StatTiles /g) ?? []).length, 1);
  assert.ok(v.indexOf("<StatTiles ") > v.indexOf('<div className="grid grid-cols-1'));
  assert.doesNotMatch(server, /TILE_NOT_SET_UP/);
});

test("search health reads collections and single pages after the read check into siteHealth", () => {
  const s = body("SearchHealthPanel");
  assert.ok(s.indexOf("readUser(ref)") < s.indexOf("healthEntries("));
  assert.match(s, /getCollectionCache\(/);
  assert.match(s, /rest\.repos\.getContent\(/);
  assert.match(s, /ctx\.token/);
  assert.match(s, /siteHealth\(entries/);
  assert.match(s, /FIX_LIMIT\.staff : FIX_LIMIT\.client/);
  assert.match(server, /FIX_LIMIT = \{ client: 3, staff: 5 \}/);
});

test("the publish line renders only the state text, from the map entry", () => {
  const p = body("PublishLine");
  assert.match(p, /if \(!sources\?\.pages\) return null;/);
  assert.match(p, /project: sources\.pages/);
  assert.match(p, /publishLine\(status, new Date\(\)\)/);
  assert.doesNotMatch(p, /status\.(?!state)\w+|\{status\}/);
});

test("top pages show a name before the muted path when one is known, else the bare path", () => {
  const t = body("TopLists");
  assert.match(t, /const name = pageName\(item\.label, ctx\?\.config\.object\);/);
  assert.match(t, /name \? \{ \.\.\.item, label: name, sub: item\.label \} : item/);
  const bars = server.slice(server.indexOf("function Bars("), server.indexOf("export async function TopLists"));
  assert.ok(bars.indexOf("{item.label}") < bars.indexOf("{item.sub &&"));
  assert.match(bars, /\{item\.sub && <span className="ml-2 text-muted-foreground">\{item\.sub\}<\/span>\}/);
  assert.ok(t.indexOf("readUser(ref)") < t.indexOf("getInsightsAccess("));
});

test("the visits panel links to Insights", () => {
  assert.match(body("VisitsPanel"), /<DashboardVisits days=\{view\.days\} insightsHref=\{shortHref\(`\/\$\{ref\.owner\}\/\$\{ref\.repo\}\/\$\{encodeURIComponent\(ref\.branch\)\}\/insights`\)\}/);
});

test("each skeleton uses the kc-shimmer block", () => {
  assert.match(skeleton, /BLOCK = "[^"]*kc-shimmer/);
  for (const name of ["VisitsSkeleton", "SearchHealthSkeleton", "TopListsSkeleton", "PublishSkeleton", "StaffSkeleton", "VersionSkeleton"]) {
    const start = skeleton.indexOf(`export function ${name}`);
    assert.ok(start >= 0, name);
    const next = skeleton.indexOf("export function", start + 1);
    assert.match(skeleton.slice(start, next === -1 ? undefined : next), /\$\{BLOCK\}/, name);
  }
});

test("no token, account id or key file name appears in any prop", () => {
  for (const name of ["VisitsPanel", "SearchHealthPanel", "VersionLine", "PublishLine", "TopLists", "StaffStrip"]) {
    const signature = body(name).split("\n")[0];
    assert.doesNotMatch(signature, /token|account|key/i, name);
  }
  // JSX props in the rendered output.
  for (const tag of server.match(/<[A-Z]\w*[^>]*>/g) ?? []) {
    assert.doesNotMatch(tag, /token|accountId|KEY_FILE|process\.env/i, tag);
  }
});
