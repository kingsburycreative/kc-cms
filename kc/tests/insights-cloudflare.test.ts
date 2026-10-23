import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { generateKeyPairSync } from "node:crypto";
import { CF_GRAPHQL_URL, cloudflareCards, cloudflareRequest } from "../insights/cloudflare.ts";
import { parseInsightsMap, propertyFor, sourcesFor } from "../insights/map.ts";
import { createCache, loadSiteInsights } from "../insights/route.ts";

const fixture = (name: string) =>
  JSON.parse(readFileSync(new URL(`./fixtures/insights/${name}.json`, import.meta.url), "utf8"));
const NOW = Date.UTC(2026, 9, 23, 12);

test("the request names the account, the site tag and both 28-day ranges", () => {
  const r = cloudflareRequest("acct-1", "tag-abc", NOW);
  assert.deepEqual(r.variables, {
    accountTag: "acct-1",
    siteTag: "tag-abc",
    start: "2026-09-25",
    end: "2026-10-22",
    prevStart: "2026-08-28",
    prevEnd: "2026-09-24",
  });
  assert.match(r.query, /rumPageloadEventsAdaptiveGroups/);
  assert.match(r.query, /accountTag: \$accountTag/);
  assert.match(r.query, /siteTag: \$siteTag/);
  assert.match(r.query, /sum \{ visits \}/);
  assert.match(r.query, /requestPath/);
});

test("the parser makes a visits card and a top pages card with the GA4 sentences", () => {
  const c = cloudflareCards(fixture("cloudflare"));
  assert.equal(c.visitors.current, 600);
  assert.equal(c.visitors.sentence, "600 visitors in the last 28 days, up 20% on the month before.");
  assert.deepEqual(c.pages.items, [{ label: "/services", value: 700 }, { label: "/", value: 300 }]);
  assert.equal(c.pages.sentence, "Your most visited page is /services.");
  assert.equal(cloudflareCards({ data: null }).visitors.sentence, "No visitors yet in the last 28 days.");
  assert.equal(cloudflareCards({}).pages.sentence, "No page views yet.");
});

test("the map takes both value shapes and drops a bad GA id or an empty site tag", () => {
  const map = parseInsightsMap(JSON.stringify({
    "a/plain": "123",
    "a/both": { ga: "456", cf: "tag1" },
    "a/cf": { cf: "tag2" },
    "a/badga": { ga: "G-XYZ", cf: "tag3" },
    "a/emptycf": { ga: "789", cf: "  " },
    "a/nothing": { ga: "G-1", cf: "" },
  }));
  assert.deepEqual(sourcesFor(map, "a", "plain"), { ga: "123" });
  assert.deepEqual(sourcesFor(map, "A", "Both"), { ga: "456", cf: "tag1" });
  assert.deepEqual(sourcesFor(map, "a", "cf"), { cf: "tag2" });
  assert.deepEqual(sourcesFor(map, "a", "badga"), { cf: "tag3" });
  assert.deepEqual(sourcesFor(map, "a", "emptycf"), { ga: "789" });
  assert.equal(sourcesFor(map, "a", "nothing"), null);
  assert.equal(propertyFor(map, "a", "both"), "456");
  assert.equal(propertyFor(map, "a", "cf"), null);
});

const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const key = { client_email: "sa@test.iam", private_key: privateKey.export({ type: "pkcs8", format: "pem" }).toString() };
const CF_TOKEN = "cf-token-value-xyz";

function fakeFetch(cfStatus = 200) {
  const calls: { url: string; auth?: string }[] = [];
  const fetchFn = async (url: string, init: { headers: Record<string, string>; body: string }) => {
    calls.push({ url, auth: init.headers.authorization });
    if (url.includes("oauth2")) return { ok: true, status: 200, json: async () => ({ access_token: "ga-tok", expires_in: 3600 }) };
    if (url === CF_GRAPHQL_URL) {
      return { ok: cfStatus < 400, status: cfStatus, json: async () => (cfStatus < 400 ? fixture("cloudflare") : { errors: ["secret"] }) };
    }
    const body = JSON.parse(init.body);
    const dim = body.dimensions?.[0]?.name;
    const data = dim === "pagePath" ? fixture("top-pages")
      : dim ? fixture("channels")
        : body.dateRanges.length === 2 ? fixture("visitors") : fixture("engagement");
    return { ok: true, status: 200, json: async () => data };
  };
  return { calls, fetchFn };
}

const cloudflare = (cache = createCache<any>(() => 0)) => ({ siteTag: "tag1", accountId: "acct", token: CF_TOKEN, cache });

test("with both sources, totals come from Cloudflare and detail from GA4", async () => {
  const { calls, fetchFn } = fakeFetch();
  const r = await loadSiteInsights({
    propertyId: "123", key, fetchFn, cache: createCache<any>(() => 0), cloudflare: cloudflare(), now: () => NOW,
  });
  assert.equal(r.ok, true);
  if (!r.ok) return;
  assert.equal(r.totalsFrom, "cloudflare");
  assert.equal(r.visitors.current, 600);
  assert.equal(r.pages.items[0].label, "/services");
  assert.equal(r.detail?.channels.sentence, "Most visitors arrive through Organic Search.");
  assert.equal(r.detail?.engagement.averageSeconds, 150);
  assert.ok(r.detail?.cities);
  assert.equal(calls.find((c) => c.url === CF_GRAPHQL_URL)?.auth, `Bearer ${CF_TOKEN}`);
});

test("Cloudflare only gives totals and no detail, and is cached by site tag", async () => {
  const { calls, fetchFn } = fakeFetch();
  const cfCache = createCache<any>(() => 0);
  const opts = { propertyId: null, key: null, fetchFn, cache: createCache<any>(), cloudflare: cloudflare(cfCache), now: () => NOW };
  const r = await loadSiteInsights(opts);
  assert.equal(r.ok && r.totalsFrom, "cloudflare");
  assert.equal(r.ok && r.detail, null);
  await loadSiteInsights(opts);
  assert.equal(calls.length, 1);
});

for (const status of [503, 200]) {
  test(`a Cloudflare failure (${status}) leaves the GA4 cards and logs the status only`, async () => {
    const { fetchFn: base } = fakeFetch(status === 200 ? 200 : status);
    // A 200 carrying GraphQL errors is a failure too.
    const fetchFn: typeof base = async (url, init) =>
      url === CF_GRAPHQL_URL && status === 200
        ? { ok: true, status: 200, json: async () => ({ data: null, errors: [{ message: "bad" }] }) }
        : base(url, init);
    const lines: string[] = [];
    const r = await loadSiteInsights({
      propertyId: "123", key, fetchFn, cache: createCache<any>(), cloudflare: cloudflare(createCache<any>()),
      now: () => NOW, log: (l) => lines.push(l),
    });
    assert.equal(r.ok, true);
    if (!r.ok) return;
    assert.equal(r.totalsFrom, "ga4");
    assert.equal(r.visitors.current, 412);
    assert.ok(r.detail);
    assert.deepEqual(lines, [`Insights: Cloudflare request failed with status ${status}`]);
    assert.doesNotMatch(lines.join("\n"), new RegExp(`${CF_TOKEN}|acct|tag1|https?:`));
  });
}

test("GA4 only looks as before", async () => {
  const { fetchFn } = fakeFetch();
  const r = await loadSiteInsights({ propertyId: "123", key, fetchFn, cache: createCache<any>(), cloudflare: null });
  assert.equal(r.ok && r.totalsFrom, "ga4");
  assert.equal(r.ok && r.visitors.current, 412);
});

test("the page labels GA4 cards only when Cloudflare totals are shown, and logs no token", () => {
  const page = readFileSync(new URL("../../app/(main)/[owner]/[repo]/[branch]/insights/page.tsx", import.meta.url), "utf8");
  assert.match(page, /"From visitors who allowed analytics"/);
  assert.match(page, /totalsFrom === "cloudflare" \? CONSENT_LABEL : undefined/);
  for (const title of ["Average time on site", "Top towns", "How people found the site"]) {
    assert.match(page, new RegExp(`title="${title}"[^\\n]*note=\\{note\\}`));
  }
  for (const title of ["Visitors", "Top pages"]) assert.doesNotMatch(page, new RegExp(`title="${title}"[^\\n]*note=`));
  assert.match(page, /token: process\.env\.CLOUDFLARE_ANALYTICS_TOKEN/);
  assert.doesNotMatch(page, /console\./);
  const route = readFileSync(new URL("../insights/route.ts", import.meta.url), "utf8");
  assert.doesNotMatch(route, /log\([^)]*token/i);
});
