import { test } from "node:test";
import assert from "node:assert/strict";
import { createCache } from "../insights/route.ts";
import { reviewsLine, validateReviewsStatus, type ReviewsStatus } from "../reviews/status.ts";
import { fetchReviewsStatus, MAX_BYTES, reviewsUrl, WARN_LINE } from "../reviews/status-fetch.ts";

const NOW = new Date("2026-10-28T12:00:00Z");
const good = { source: "typed", rating: 4.8, count: 37, asOf: "2026-09-01" };

function stream(text: string, chunk = 1024) {
  const bytes = new TextEncoder().encode(text);
  return new ReadableStream<Uint8Array>({
    start(c) {
      for (let i = 0; i < bytes.length; i += chunk) c.enqueue(bytes.slice(i, i + chunk));
      c.close();
    },
  });
}

function fake(body: unknown = good, opts: { ok?: boolean; length?: string; raw?: string; throws?: boolean } = {}) {
  const calls: { url: string; init: any }[] = [];
  const fetchImpl = async (url: string, init: any) => {
    calls.push({ url, init });
    if (opts.throws) throw new Error("boom https://secret.example/x");
    const text = opts.raw ?? JSON.stringify(body);
    return {
      ok: opts.ok ?? true,
      headers: { get: (n: string) => (n === "content-length" ? (opts.length ?? null) : null) },
      body: stream(text),
    };
  };
  return { calls, fetchImpl };
}

const run = (site: string, f: ReturnType<typeof fake>, lines: string[] = []) =>
  fetchReviewsStatus(site, { fetchImpl: f.fetchImpl, cache: createCache<ReviewsStatus>(), now: () => NOW, warn: (l) => lines.push(l) });

test("the URL is the origin plus the fixed path, whatever kc.site carries", async () => {
  for (const site of ["https://henike.ca", "https://henike.ca/about?x=1#top", "https://user:pw@henike.ca/a/b"]) {
    const f = fake();
    await run(site, f);
    assert.equal(f.calls.length, 1);
    assert.equal(f.calls[0].url, "https://henike.ca/reviews-status.json");
  }
});

test("http, IP literals, localhost, single-label and private names make no fetch", async () => {
  const bad = [
    "http://henike.ca", "https://127.0.0.1", "https://[::1]", "https://10.0.0.5/x", "https://0x7f.1",
    "https://localhost", "https://foo.localhost", "https://intranet", "https://box.local", "https://db.internal",
    "https://henike.ca:8443", "not a url",
  ];
  for (const site of bad) {
    const f = fake();
    assert.deepEqual(await run(site, f), { state: "unknown" }, site);
    assert.equal(f.calls.length, 0, site);
    assert.equal(reviewsUrl(site), null, site);
  }
});

test("the call carries an AbortSignal and refuses redirects", async () => {
  const f = fake();
  await run("https://henike.ca", f);
  assert.ok(f.calls[0].init.signal instanceof AbortSignal);
  assert.equal(f.calls[0].init.redirect, "error");
});

test("a body over the cap is refused, declared or streamed", async () => {
  const lines: string[] = [];
  const declared = fake(good, { length: String(MAX_BYTES + 1) });
  assert.deepEqual(await run("https://henike.ca", declared, lines), { state: "unknown" });
  const big = JSON.stringify({ ...good, error: "x".repeat(MAX_BYTES) });
  const streamed = fake(good, { raw: big });
  assert.deepEqual(await run("https://henike.ca", streamed, lines), { state: "unknown" });
  assert.deepEqual(lines, [WARN_LINE, WARN_LINE]);
  const atCap = fake(good, { length: String(MAX_BYTES) });
  assert.equal((await run("https://henike.ca", atCap)).state, "known");
});

test("the validator takes exactly the five keys and refuses the rest", () => {
  assert.deepEqual(validateReviewsStatus(good, NOW), good);
  assert.deepEqual(validateReviewsStatus({ ...good, error: "fetch failed" }, NOW), { ...good, error: "fetch failed" });
  for (const s of ["typed", "hidden", "live"]) assert.ok(validateReviewsStatus({ ...good, source: s }, NOW));
  const bad = [
    { ...good, extra: 1 }, { ...good, rating: 5.1 }, { ...good, rating: -0.1 }, { ...good, count: -1 },
    { ...good, count: 1.5 }, { ...good, asOf: "yesterday" }, { ...good, asOf: "2026-13-45" },
    { ...good, asOf: "2026-10-29" }, { ...good, source: "google" }, { ...good, error: 3 },
    { source: "typed", rating: 4, count: 1 }, null, [], "x",
  ];
  for (const b of bad) assert.equal(validateReviewsStatus(b, NOW), null, JSON.stringify(b));
});

test("every failure is unknown with one fixed warn line and no URL", async () => {
  const cases = [fake(good, { ok: false }), fake(good, { throws: true }), fake(good, { raw: "{not json" }), fake({ ...good, source: "google" })];
  for (const f of cases) {
    const lines: string[] = [];
    assert.deepEqual(await run("https://henike.ca/p", f, lines), { state: "unknown" });
    assert.deepEqual(lines, [WARN_LINE]);
    assert.doesNotMatch(lines[0], /https?:|henike|secret/);
  }
});

test("a second call inside the TTL does not refetch, and a failure is not cached", async () => {
  const cache = createCache<ReviewsStatus>(() => 0);
  const f = fake();
  const opts = { fetchImpl: f.fetchImpl, cache, now: () => NOW, warn: () => {} };
  await fetchReviewsStatus("https://henike.ca/a", opts);
  await fetchReviewsStatus("https://henike.ca/b", opts);
  assert.equal(f.calls.length, 1);
  const failing = fake(good, { ok: false });
  const opts2 = { ...opts, fetchImpl: failing.fetchImpl };
  await fetchReviewsStatus("https://other.ca", opts2);
  await fetchReviewsStatus("https://other.ca", opts2);
  assert.equal(failing.calls.length, 2);
});

test("each source maps to its key; stale only for typed past six months", () => {
  const at = (source: any, asOf: string) => reviewsLine({ source, rating: 4, count: 3, asOf }, NOW);
  assert.deepEqual(at("typed", "2026-09-01"), { state: "known", key: "reviews-typed", stale: false });
  assert.deepEqual(at("hidden", "2020-01-01"), { state: "known", key: "reviews-hidden", stale: false });
  assert.deepEqual(at("live", "2020-01-01"), { state: "known", key: "reviews-live", stale: false });
  const edge = at("typed", "2026-04-28T12:00:00Z");
  assert.ok(edge.state === "known");
  assert.equal(edge.stale, false);
  const past = at("typed", "2026-04-28T11:59:59Z");
  assert.ok(past.state === "known");
  assert.equal(past.stale, true);
  assert.deepEqual(reviewsLine(null, NOW), { state: "unknown" });
});
