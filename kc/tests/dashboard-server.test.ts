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
  assert.match(v, /if \(!ctx \|\| !\(await getInsightsAccess\(/);
  assert.ok(gate < v.indexOf("insightsSourcesFor("));
  assert.ok(gate < v.indexOf("loadSeries("));
});

test("the series cache key is the site, not the user", () => {
  const v = body("VisitsPanel");
  assert.match(v, /site: seriesSiteKey\(ref\.owner, ref\.repo\)/);
  assert.match(v, /cache: defaultSeriesCache/);
  assert.match(server, /seriesSiteKey = \(owner: string, repo: string\) => `\$\{owner\}\/\$\{repo\}`/);
  assert.doesNotMatch(v, /site:[^\n]*user/);
});

test("no sources returns null and a null series renders the fallback, not a throw", () => {
  const v = body("VisitsPanel");
  assert.match(v, /if \(!sources\) return null;/);
  assert.match(v, /\.catch\(\(\) => null\)/);
  assert.match(server, /visitsView\(series: Series \| null\)[\s\S]*?ok: false as const, sentence: VISITS_FALLBACK/);
  assert.match(server, /VISITS_FALLBACK = "Visit numbers aren't available right now\."/);
});

test("search health reads each collection through the cache and parse into siteHealth", () => {
  const s = body("SearchHealthPanel");
  assert.match(s, /getCollectionCache\(/);
  assert.match(s, /parse\(file\.content/);
  assert.match(s, /siteHealth\(entries/);
});

test("each skeleton has animate-pulse and motion-reduce:animate-none", () => {
  assert.match(skeleton, /BLOCK = "[^"]*animate-pulse motion-reduce:animate-none/);
  for (const name of ["VisitsSkeleton", "SearchHealthSkeleton", "VersionSkeleton"]) {
    const start = skeleton.indexOf(`export function ${name}`);
    assert.ok(start >= 0, name);
    const next = skeleton.indexOf("export function", start + 1);
    assert.match(skeleton.slice(start, next === -1 ? undefined : next), /\$\{BLOCK\}/, name);
  }
});

test("no token, account id or key file name appears in any prop", () => {
  for (const name of ["VisitsPanel", "SearchHealthPanel", "VersionLine"]) {
    const signature = body(name).split("\n")[0];
    assert.doesNotMatch(signature, /token|account|key/i, name);
  }
  // JSX props in the rendered output.
  for (const tag of server.match(/<[A-Z]\w*[^>]*>/g) ?? []) {
    assert.doesNotMatch(tag, /token|accountId|KEY_FILE|process\.env/i, tag);
  }
});
