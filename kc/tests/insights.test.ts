import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { generateKeyPairSync, createVerify } from "node:crypto";
import * as reports from "../insights/reports.ts";
import * as cards from "../insights/cards.ts";
import { fetchAccessToken, SCOPE, TOKEN_URL } from "../insights/token.ts";

const fixture = (name: string) =>
  JSON.parse(readFileSync(new URL(`./fixtures/insights/${name}.json`, import.meta.url), "utf8"));

test("visitors report compares the last 28 days with the 28 before", () => {
  const r = reports.visitorsReport();
  assert.equal(r.dateRanges.length, 2);
  assert.deepEqual(r.metrics, [{ name: "activeUsers" }]);
  assert.equal(r.dateRanges[1].endDate, "29daysAgo");
});

test("top pages and cities ask for 5 rows, biggest first", () => {
  for (const [r, dim] of [[reports.topPagesReport(), "pagePath"], [reports.topCitiesReport(), "city"]] as const) {
    assert.equal(r.limit, 5);
    assert.deepEqual(r.dimensions, [{ name: dim }]);
    assert.equal(r.orderBys?.[0].desc, true);
  }
  assert.deepEqual(reports.channelsReport().dimensions, [{ name: "sessionDefaultChannelGroup" }]);
});

test("visitors card says the change on the month before", () => {
  const c = cards.visitorsCard(fixture("visitors"));
  assert.equal(c.current, 412);
  assert.equal(c.changePercent, 18);
  assert.equal(c.sentence, "412 visitors in the last 28 days, up 18% on the month before.");
});

test("zero previous visitors says new this month, no Infinity", () => {
  const c = cards.visitorsCard(fixture("visitors-no-previous"));
  assert.equal(c.changePercent, null);
  assert.equal(c.sentence, "57 visitors in the last 28 days, new this month.");
  assert.doesNotMatch(c.sentence, /Infinity|NaN/);
});

test("a property with no data gives plain empty cards", () => {
  const empty = fixture("empty");
  assert.equal(cards.visitorsCard(empty).sentence, "No visitors yet in the last 28 days.");
  assert.deepEqual(cards.topPagesCard(empty).items, []);
  assert.equal(cards.topCitiesCard(empty).sentence, "No visitor locations yet.");
  assert.equal(cards.channelsCard(empty).sentence, "No traffic sources yet.");
  assert.deepEqual(cards.engagementCard(empty), { averageSeconds: 0, sentence: "No engagement time yet." });
});

test("list and engagement cards read their fixtures", () => {
  const pages = cards.topPagesCard(fixture("top-pages"));
  assert.deepEqual(pages.items[1], { label: "/contact", value: 80 });
  assert.equal(cards.channelsCard(fixture("channels")).sentence, "Most visitors arrive through Organic Search.");
  assert.deepEqual(cards.engagementCard(fixture("engagement")), {
    averageSeconds: 150,
    sentence: "Visitors spend about 2 min 30 s on the site.",
  });
});

const { privateKey, publicKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
  privateKeyEncoding: { type: "pkcs8", format: "pem" },
  publicKeyEncoding: { type: "spki", format: "pem" },
});
const key = { client_email: "kc@test.iam.gserviceaccount.com", private_key: privateKey };

test("token request posts a verifiable RS256 JWT", async () => {
  let sent: { url: string; body: string } | undefined;
  const fakeFetch = async (url: string, init: { body: string }) => {
    sent = { url, body: init.body };
    return { ok: true, status: 200, json: async () => ({ access_token: "ya29.x", expires_in: 3599 }) };
  };
  const tok = await fetchAccessToken(key, fakeFetch, () => 1_700_000_000_000);
  assert.equal(tok.accessToken, "ya29.x");
  assert.equal(sent?.url, TOKEN_URL);
  const params = new URLSearchParams(sent!.body);
  assert.equal(params.get("grant_type"), "urn:ietf:params:oauth:grant-type:jwt-bearer");
  const [h, c, sig] = params.get("assertion")!.split(".");
  assert.deepEqual(JSON.parse(Buffer.from(h, "base64url").toString()), { alg: "RS256", typ: "JWT" });
  const claims = JSON.parse(Buffer.from(c, "base64url").toString());
  assert.deepEqual(claims, {
    iss: key.client_email, scope: SCOPE, aud: TOKEN_URL, iat: 1_700_000_000, exp: 1_700_003_600,
  });
  const v = createVerify("RSA-SHA256");
  v.update(`${h}.${c}`);
  assert.ok(v.verify(publicKey, Buffer.from(sig, "base64url")));
});

test("a failed token request never shows the key", async () => {
  const fakeFetch = async () => ({ ok: false, status: 400, json: async () => ({}) });
  await assert.rejects(fetchAccessToken(key, fakeFetch, () => 0), (err: Error) => {
    assert.match(err.message, /400/);
    assert.ok(!err.message.includes("PRIVATE KEY"));
    return true;
  });
});

const placeholderCards = [
  { name: "pages", card: cards.topPagesCard, real: "/about", sentence: "Your most visited page is /about.", none: "Your most visited pages aren't known yet." },
  { name: "cities", card: cards.topCitiesCard, real: "Ottawa", sentence: "Most visitors come from Ottawa.", none: "Most visitors' towns aren't known yet." },
  { name: "channels", card: cards.channelsCard, real: "Direct", sentence: "Most visitors arrive through Direct.", none: "Most visitors' traffic sources aren't known yet." },
];
const row = (label: string | undefined, value: string) => ({
  dimensionValues: label === undefined ? [] : [{ value: label }],
  metricValues: [{ value }],
});
for (const { name, card, real, sentence, none } of placeholderCards) {
  for (const placeholder of ["(not set)", "(other)", "", "  "]) {
    test(`${name} card shows ${JSON.stringify(placeholder)} as Unknown and skips it in the sentence`, () => {
      const out = card({ rows: [row(placeholder, "9"), row(real, "5")] });
      assert.deepEqual(out.items, [{ label: "Unknown", value: 9 }, { label: real, value: 5 }]);
      assert.equal(out.sentence, sentence);
    });
    test(`${name} card with only ${JSON.stringify(placeholder)} says it is not known yet`, () => {
      const out = card({ rows: [row(placeholder, "3"), row(undefined, "2")] });
      assert.deepEqual(out.items, [{ label: "Unknown", value: 3 }, { label: "Unknown", value: 2 }]);
      assert.equal(out.sentence, none);
    });
  }
}
