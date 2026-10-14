import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { pickBanner } from "../update/banner.ts";
import { fetchBanner } from "../update/banner-fetch.ts";

const fixture = (name: string) =>
  JSON.parse(readFileSync(new URL(`./fixtures/pulls/${name}.json`, import.meta.url), "utf8"));

test("none open gives null", () => {
  assert.equal(pickBanner(fixture("none")), null);
});

test("one upstream PR gives its tag and url", () => {
  assert.deepEqual(pickBanner(fixture("one-upstream")), {
    tag: "v2.2.0",
    url: "https://github.com/kingsburycreative/kc-cms/pull/7",
  });
});

test("non-upstream branches are ignored", () => {
  assert.equal(pickBanner(fixture("non-upstream")), null);
});

test("foreign urls are rejected", () => {
  assert.equal(pickBanner(fixture("foreign-url")), null);
});

test("several PRs: the highest version wins, numerically", () => {
  assert.equal(pickBanner(fixture("several"))?.tag, "v2.2.10");
});

test("garbage input gives null", () => {
  assert.equal(pickBanner({ nope: 1 }), null);
  assert.equal(pickBanner([null, { head: {} }, { head: { ref: "upstream/" }, html_url: "x" }]), null);
});

test("fetch success parses the list", async () => {
  const body = fixture("one-upstream");
  const b = await fetchBanner(async () => ({ ok: true, status: 200, json: async () => body }));
  assert.equal(b?.tag, "v2.2.0");
});

test("fetch failures return null", async () => {
  const warn = console.warn;
  const lines: string[] = [];
  console.warn = (m: string) => void lines.push(m);
  try {
    assert.equal(await fetchBanner(async () => { throw new Error("offline"); }), null);
    assert.equal(await fetchBanner(async () => ({ ok: false, status: 403, json: async () => [] })), null);
    assert.equal(await fetchBanner(async () => ({ ok: true, status: 200, json: async () => { throw new Error("bad json"); } })), null);
  } finally {
    console.warn = warn;
  }
  assert.equal(lines.length, 3);
});
