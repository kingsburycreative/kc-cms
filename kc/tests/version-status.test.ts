import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { versionStatus } from "../update/status.ts";
import { getVersionStatus } from "../update/status-fetch.ts";

const fixture = (name: string) =>
  JSON.parse(readFileSync(new URL(`./fixtures/releases/${name}.json`, import.meta.url), "utf8"));

function run(fetchFn: Parameters<typeof getVersionStatus>[0] extends infer D ? (D extends { fetchFn?: infer F } ? F : never) : never) {
  const lines: string[] = [];
  const result = getVersionStatus({
    fetchFn,
    readRunning: async () => "2.1.8",
    warn: (l) => lines.push(l),
  });
  return { result, lines };
}

const ok = (body: unknown) => async () => ({ ok: true, json: async () => body });

test("equal version is current", () => {
  assert.deepEqual(versionStatus("2.1.8", fixture("equal")), { state: "current" });
});

test("newer stable release is behind with that tag", () => {
  assert.deepEqual(versionStatus("2.1.8", fixture("newer")), { state: "behind", tag: "v2.2.0" });
});

test("prereleases and drafts are ignored", () => {
  assert.deepEqual(versionStatus("2.1.8", fixture("unstable-only")), { state: "current" });
});

test("unparseable running version is unknown", () => {
  assert.deepEqual(versionStatus("not-a-version", fixture("newer")), { state: "unknown" });
});

test("fetch passes through to behind", async () => {
  const { result, lines } = run(ok(fixture("newer")));
  assert.deepEqual(await result, { state: "behind", tag: "v2.2.0" });
  assert.equal(lines.length, 0);
});

test("a 403 is unknown with one clean log line", async () => {
  const { result, lines } = run(async () => ({ ok: false, json: async () => ({}) }));
  assert.deepEqual(await result, { state: "unknown" });
  assert.equal(lines.length, 1);
  assert.doesNotMatch(lines[0], /\?|:\/\/|authorization/i);
});

test("a thrown fetch is unknown with one clean log line", async () => {
  const { result, lines } = run(async () => {
    throw new Error("boom ?token=abc");
  });
  assert.deepEqual(await result, { state: "unknown" });
  assert.equal(lines.length, 1);
  assert.doesNotMatch(lines[0], /\?|:\/\/|token/i);
});

test("bad JSON is unknown with one clean log line", async () => {
  const { result, lines } = run(async () => ({
    ok: true,
    json: async () => {
      throw new SyntaxError("Unexpected token");
    },
  }));
  assert.deepEqual(await result, { state: "unknown" });
  assert.equal(lines.length, 1);
  assert.doesNotMatch(lines[0], /\?|:\/\//);
});

test("a non-array body is unknown", async () => {
  const { result, lines } = run(ok({ message: "nope" }));
  assert.deepEqual(await result, { state: "unknown" });
  assert.equal(lines.length, 1);
});

test("an unreadable running version is unknown", async () => {
  const lines: string[] = [];
  const r = await getVersionStatus({
    fetchFn: ok(fixture("newer")),
    readRunning: async () => {
      throw new Error("ENOENT");
    },
    warn: (l) => lines.push(l),
  });
  assert.deepEqual(r, { state: "unknown" });
  assert.equal(lines.length, 1);
});

test("this test file makes no real network call", () => {
  const src = readFileSync(new URL(import.meta.url), "utf8");
  assert.equal(src.includes(":" + "//"), false);
  assert.equal(/(^|[^A-Za-z])fetch\s*\(/.test(src), false);
  assert.equal(src.includes("globalThis" + ".fetch"), false);
});
