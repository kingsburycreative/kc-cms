import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { generateKeyPairSync } from "node:crypto";
import { loadInsightsMap, parseInsightsMap, propertyFor, sourcesFor } from "../insights/map.ts";
import { CACHE_MAX, createCache, LOAD_FAILED, loadInsights, readKey, seriesSiteKey, trimPagePath, TTL_MS } from "../insights/route.ts";

const path = (name: string) => new URL(`./fixtures/insights-route/${name}`, import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const fixture = (name: string) =>
  JSON.parse(readFileSync(new URL(`./fixtures/insights/${name}.json`, import.meta.url), "utf8"));

test("a good map keeps numeric IDs and drops the rest", () => {
  assert.deepEqual(loadInsightsMap(path("map-good.json")), {
    "kingsburycreative/site": "532281228",
    "acme/web": "123",
  });
});

test("malformed, non-numeric, missing file and no env all mean not set up", () => {
  assert.deepEqual(loadInsightsMap(path("map-malformed.json")), {});
  assert.deepEqual(loadInsightsMap(path("map-non-numeric.json")), {});
  assert.deepEqual(loadInsightsMap(path("no-such-file.json")), {});
  assert.deepEqual(loadInsightsMap(undefined), {});
  assert.deepEqual(parseInsightsMap("[1,2]"), {});
});

test("lookup by owner/repo ignores case and misses cleanly", () => {
  const map = loadInsightsMap(path("map-good.json"));
  assert.equal(propertyFor(map, "kingsburycreative", "SITE"), "532281228");
  assert.equal(propertyFor(map, "acme", "other"), null);
  assert.equal(propertyFor(map, "bad", "text"), null);
});

test("the cache holds a report for one hour, then reloads", async () => {
  let now = 1_000_000;
  let loads = 0;
  const cache = createCache<number>(() => now);
  const load = async () => ++loads;
  assert.equal(await cache("123", load), 1);
  now += TTL_MS - 1;
  assert.equal(await cache("123", load), 1);
  assert.equal(await cache("456", load), 2);
  now += 1;
  assert.equal(await cache("123", load), 3);
});

test("the cache drops its oldest entry past the cap", async () => {
  let loads = 0;
  const cache = createCache<number>(() => 0, 2);
  const load = async () => ++loads;
  await cache("a", load);
  await cache("b", load);
  await cache("c", load);
  assert.equal(await cache("b", load), 2);
  assert.equal(await cache("c", load), 3);
  assert.equal(await cache("a", load), 4);
  assert.equal(CACHE_MAX, 500);
});

test("seriesSiteKey lowercases owner and repo", () => {
  assert.equal(seriesSiteKey("KingsburyCreative", "BeSciWorks"), "kingsburycreative/besciworks");
});

test("the map reads a valid pages project beside ga or cf", () => {
  const map = parseInsightsMap(JSON.stringify({
    "Kc/One": { ga: "1", pages: "besciworks" },
    "kc/two": { cf: "tag", pages: "Bad Name" },
    "kc/three": { pages: "alone" },
  }));
  assert.deepEqual(sourcesFor(map, "kc", "one"), { ga: "1", pages: "besciworks" });
  assert.deepEqual(sourcesFor(map, "kc", "two"), { cf: "tag" });
  assert.equal(sourcesFor(map, "kc", "three"), null);
});

test("pagePath is cut to 80 characters", () => {
  assert.equal(trimPagePath("/short"), "/short");
  const long = "/" + "a".repeat(120);
  assert.equal(trimPagePath(long).length, 80);
  assert.equal(trimPagePath("/" + "b".repeat(79)), "/" + "b".repeat(79));
});

const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const key = { client_email: "sa@test.iam", private_key: privateKey.export({ type: "pkcs8", format: "pem" }).toString() };

function fakeFetch(reportStatus = 200) {
  const calls: string[] = [];
  const fetchFn = async (url: string, init: { body: string }) => {
    calls.push(url);
    if (url.includes("oauth2")) return { ok: true, status: 200, json: async () => ({ access_token: "tok-secret", expires_in: 3600 }) };
    const body = JSON.parse(init.body);
    const dim = body.dimensions?.[0]?.name;
    const data =
      dim === "pagePath" ? { rows: [{ dimensionValues: [{ value: "/" + "p".repeat(200) }], metricValues: [{ value: "9" }] }] }
        : dim ? fixture("channels")
          : body.dateRanges.length === 2 ? fixture("visitors") : fixture("engagement");
    return { ok: reportStatus < 400, status: reportStatus, json: async () => (reportStatus < 400 ? data : { error: "secret body" }) };
  };
  return { calls, fetchFn };
}

test("cards load, the top page is trimmed, and a second load is cached", async () => {
  const { calls, fetchFn } = fakeFetch();
  const cache = createCache<any>(() => 0);
  const r = await loadInsights({ propertyId: "123", key, fetchFn, cache, now: () => 0 });
  assert.equal(r.ok, true);
  if (!r.ok) return;
  assert.equal(r.cards.visitors.current, 412);
  assert.equal(r.cards.pages.items[0].label.length, 80);
  assert.ok(r.cards.pages.sentence.length < 120);
  assert.ok(calls.some((u) => u.endsWith("/properties/123:runReport")));
  const n = calls.length;
  await loadInsights({ propertyId: "123", key, fetchFn, cache, now: () => 0 });
  assert.equal(calls.length, n);
});

test("a failed Google call shows the message and logs the status only", async () => {
  const lines: string[] = [];
  const { fetchFn } = fakeFetch(503);
  const r = await loadInsights({ propertyId: "532281228", key, fetchFn, cache: createCache<any>(), log: (l) => lines.push(l) });
  assert.deepEqual(r, { ok: false, message: LOAD_FAILED });
  assert.equal(lines.length, 1);
  assert.match(lines[0], /status 503$/);
  assert.doesNotMatch(lines[0], /532281228|tok-secret|secret body|https?:|PRIVATE KEY/);
});

test("a failed token call logs its status, and a missing key is not set up", async () => {
  const lines: string[] = [];
  const fetchFn = async () => ({ ok: false, status: 401, json: async () => ({}) });
  const r = await loadInsights({ propertyId: "1", key, fetchFn, cache: createCache<any>(), log: (l) => lines.push(l) });
  assert.equal(r.ok, false);
  assert.deepEqual(lines, ["Insights: Google request failed with status 401"]);
  assert.equal(readKey(undefined), null);
  assert.equal(readKey(path("map-malformed.json")), null);
});

test("cities, channel labels and page paths are each cut to 80 characters", async () => {
  const fetchFn = async (url: string, init: { body: string }) => {
    if (url.includes("oauth2")) return { ok: true, status: 200, json: async () => ({ access_token: "t", expires_in: 3600 }) };
    const body = JSON.parse(init.body);
    const dim = body.dimensions?.[0]?.name;
    const data = dim
      ? { rows: [{ dimensionValues: [{ value: dim + "x".repeat(200) }], metricValues: [{ value: "9" }] }] }
      : body.dateRanges.length === 2 ? fixture("visitors") : fixture("engagement");
    return { ok: true, status: 200, json: async () => data };
  };
  const r = await loadInsights({ propertyId: "9", key, fetchFn, cache: createCache<any>(), now: () => 0 });
  assert.equal(r.ok, true);
  if (!r.ok) return;
  for (const card of [r.cards.cities, r.cards.channels, r.cards.pages]) {
    assert.equal(card.items.length, 1);
    assert.equal(card.items[0].label.length, 80);
  }
});
