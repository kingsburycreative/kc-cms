import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { generateKeyPairSync } from "node:crypto";
import { CF_GRAPHQL_URL, cloudflareSeries, cloudflareSeriesRequest } from "../insights/cloudflare.ts";
import { dailyReport } from "../insights/reports.ts";
import { RANGES, SERIES_DAYS, ga4Day, slice } from "../insights/series.ts";
import { createCache, loadSeries } from "../insights/route.ts";

const fixture = (name: string) =>
  JSON.parse(readFileSync(new URL(`./fixtures/insights/${name}.json`, import.meta.url), "utf8"));
const NOW = Date.UTC(2026, 9, 23, 12);
const day = <T extends { day: string }>(days: T[], d: string) => days.find((p) => p.day === d);

test("the Cloudflare series request uses datetime filters and hours inside 93 days", () => {
  const r = cloudflareSeriesRequest("acct", "tag", NOW);
  assert.match(r.query, /datetime_geq: \$from/);
  assert.match(r.query, /datetime_lt: \$to/);
  assert.match(r.query, /\$from: Time!/);
  assert.match(r.query, /dimensions \{ datetimeHour \}/);
  const span = Date.parse(r.variables.to) - Date.parse(r.variables.from);
  assert.ok(span < 93 * 86400000 && span >= SERIES_DAYS * 86400000);
  assert.equal(r.variables.to, new Date(NOW).toISOString());
});

test("a day with no rows comes back as zeros, and the list is 90 days ending today", () => {
  const days = cloudflareSeries(fixture("cloudflare-series"), NOW);
  assert.equal(days.length, 90);
  assert.equal(days.at(-1)?.day, "2026-10-23");
  assert.deepEqual(day(days, "2026-10-21"), { day: "2026-10-21", visits: 0, views: 0 });
  assert.deepEqual(day(days, "2026-10-20"), { day: "2026-10-20", visits: 1, views: 3 });
});

test("a late-evening Toronto hour (02:00 UTC) lands on the Toronto day before", () => {
  const days = cloudflareSeries(fixture("cloudflare-series"), NOW);
  assert.deepEqual(day(days, "2026-10-22"), { day: "2026-10-22", visits: 6, views: 15 });
  assert.deepEqual(day(days, "2026-10-23"), { day: "2026-10-23", visits: 0, views: 0 });
});

test("7, 30 and 90 are slices of the same list", () => {
  const days = cloudflareSeries(fixture("cloudflare-series"), NOW);
  assert.deepEqual(RANGES, [7, 30, 90]);
  for (const r of RANGES) {
    const s = slice(days, r);
    assert.equal(s.length, r);
    assert.equal(s[0], days[days.length - r]);
    assert.equal(s.at(-1), days.at(-1));
  }
});

test("GA4 YYYYMMDD parses to the day and the daily report asks for sessions and page views", () => {
  assert.equal(ga4Day("20261021"), "2026-10-21");
  assert.equal(ga4Day("2026-10-21"), null);
  assert.equal(ga4Day(undefined), null);
  const r = dailyReport();
  assert.deepEqual(r.dimensions, [{ name: "date" }]);
  assert.deepEqual(r.metrics, [{ name: "sessions" }, { name: "screenPageViews" }]);
});

const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const key = { client_email: "sa@test.iam", private_key: privateKey.export({ type: "pkcs8", format: "pem" }).toString() };
const CF_TOKEN = "cf-token-value-xyz";

function fakeFetch(cfStatus = 200) {
  const calls: { url: string; body: string }[] = [];
  const fetchFn = async (url: string, init: { headers: Record<string, string>; body: string }) => {
    calls.push({ url, body: init.body });
    if (url.includes("oauth2")) return { ok: true, status: 200, json: async () => ({ access_token: "ga-tok", expires_in: 3600 }) };
    if (url === CF_GRAPHQL_URL) {
      const tag = JSON.parse(init.body).variables.siteTag;
      const data = fixture("cloudflare-series");
      if (tag === "tag2") data.data.viewer.accounts[0].hours = [];
      return { ok: cfStatus < 400, status: cfStatus, json: async () => (cfStatus < 400 ? data : { errors: ["secret"] }) };
    }
    return { ok: true, status: 200, json: async () => fixture("ga4-series") };
  };
  return { calls, fetchFn };
}

const cf = (siteTag = "tag1") => ({ siteTag, accountId: "acct", token: CF_TOKEN });
const base = { now: () => NOW, log: () => {} };

test("with both sources the series comes from Cloudflare", async () => {
  const { calls, fetchFn } = fakeFetch();
  const s = await loadSeries({ ...base, site: "a/one", propertyId: "123", key, cloudflare: cf(), fetchFn, cache: createCache() });
  assert.equal(s?.from, "cloudflare");
  assert.equal(day(s!.days, "2026-10-22")?.visits, 6);
  assert.ok(calls.every((c) => c.url === CF_GRAPHQL_URL));
});

test("with only GA4 the series comes from GA4", async () => {
  const { fetchFn } = fakeFetch();
  const s = await loadSeries({ ...base, site: "a/one", propertyId: "123", key, cloudflare: null, fetchFn, cache: createCache() });
  assert.equal(s?.from, "ga4");
  assert.equal(s?.days.length, 90);
  assert.deepEqual(day(s!.days, "2026-10-21"), { day: "2026-10-21", visits: 7, views: 9 });
  assert.deepEqual(day(s!.days, "2026-10-22"), { day: "2026-10-22", visits: 0, views: 0 });
});

test("a 500 from Cloudflare falls back to GA4 and logs the status, no token", async () => {
  const { fetchFn } = fakeFetch(500);
  const lines: string[] = [];
  const s = await loadSeries({
    site: "a/one", propertyId: "123", key, cloudflare: cf(), fetchFn, cache: createCache(),
    now: () => NOW, log: (l) => lines.push(l),
  });
  assert.equal(s?.from, "ga4");
  assert.deepEqual(lines, ["Insights: Cloudflare series request failed with status 500"]);
  assert.doesNotMatch(lines.join("\n"), new RegExp(`${CF_TOKEN}|acct|tag1|https?:`));
});

test("both failing gives no series, never a throw", async () => {
  const { fetchFn } = fakeFetch(500);
  const s = await loadSeries({ ...base, site: "a/one", propertyId: null, key: null, cloudflare: cf(), fetchFn, cache: createCache() });
  assert.equal(s, null);
});

test("the cache is keyed by site", async () => {
  const { calls, fetchFn } = fakeFetch();
  const cache = createCache<any>(() => 0);
  const one = await loadSeries({ ...base, site: "a/one", propertyId: null, key: null, cloudflare: cf("tag1"), fetchFn, cache });
  const two = await loadSeries({ ...base, site: "a/two", propertyId: null, key: null, cloudflare: cf("tag2"), fetchFn, cache });
  await loadSeries({ ...base, site: "a/one", propertyId: null, key: null, cloudflare: cf("tag1"), fetchFn, cache });
  assert.equal(calls.length, 2);
  assert.equal(day(one!.days, "2026-10-22")?.visits, 6);
  assert.equal(day(two!.days, "2026-10-22")?.visits, 0);
});
