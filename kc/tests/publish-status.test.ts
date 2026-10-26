import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { publishLine, publishStatus, timeAgo, type Deployment } from "../publish/status.ts";
import { fetchPublishStatus } from "../publish/status-fetch.ts";
import { KcSchema } from "../client-view.ts";

const mixed = JSON.parse(
  readFileSync(new URL("./fixtures/deployments/mixed.json", import.meta.url), "utf8"),
) as { result: Deployment[] };
const NOW = new Date("2026-02-01T00:00:00Z");
const TOKEN = "fake-token-abc123";

const prod = (status: string, created = "2026-01-05T00:00:00Z"): Deployment => ({
  environment: "production",
  created_on: created,
  latest_stage: { status, ended_on: "2026-01-05T00:01:00Z" },
});

test("latest production success gives published with its time, ignoring a newer preview", () => {
  assert.deepEqual(publishStatus(mixed.result, NOW), { state: "published", at: "2026-01-02T10:03:00Z" });
});

test("the result holds only state and time", () => {
  const s = publishStatus(mixed.result, NOW);
  assert.deepEqual(Object.keys(s).sort(), ["at", "state"]);
  assert.ok(!JSON.stringify(s).includes("commit"));
});

test("active, queued and idle give publishing", () => {
  for (const status of ["active", "queued", "idle"]) {
    assert.deepEqual(publishStatus([...mixed.result, prod(status)], NOW), { state: "publishing" });
  }
});

test("failure and canceled give failed with time", () => {
  for (const status of ["failure", "canceled"]) {
    assert.deepEqual(publishStatus([...mixed.result, prod(status)], NOW), {
      state: "failed",
      at: "2026-01-05T00:01:00Z",
    });
  }
});

test("no production deployment gives unknown", () => {
  assert.deepEqual(publishStatus([mixed.result[0]], NOW), { state: "unknown" });
  assert.deepEqual(publishStatus(null, NOW), { state: "unknown" });
});

const target = { accountId: "acct1", token: TOKEN, project: "besciworks" };

function capture() {
  const lines: string[] = [];
  return { lines, warn: (l: string) => lines.push(l) };
}

test("fetch success maps the response and calls the right path with revalidate 30", async () => {
  let seen: { url: string; init: unknown } | null = null;
  const s = await fetchPublishStatus(target, async (url, init) => {
    seen = { url, init };
    return { ok: true, json: async () => mixed };
  });
  assert.equal(s.state, "published");
  assert.equal(
    seen!.url,
    "https://api.cloudflare.com/client/v4/accounts/acct1/pages/projects/besciworks/deployments",
  );
  assert.deepEqual((seen!.init as { next: unknown }).next, { revalidate: 30 });
});

const failures: [string, () => Promise<{ ok: boolean; json: () => Promise<unknown> }>][] = [
  ["a 403", async () => ({ ok: false, json: async () => ({}) })],
  ["a thrown fetch", async () => { throw new Error(`boom ${TOKEN} https://api.cloudflare.com`); }],
  ["bad JSON", async () => ({ ok: true, json: async () => { throw new SyntaxError("bad"); } })],
];

for (const [name, impl] of failures) {
  test(`${name} gives unknown and one clean warn line`, async () => {
    const c = capture();
    const s = await fetchPublishStatus(target, impl, c.warn);
    assert.deepEqual(s, { state: "unknown" });
    assert.equal(c.lines.length, 1);
    assert.ok(!c.lines[0].includes(TOKEN));
    assert.ok(!/https?:|cloudflare|acct1|Bearer/i.test(c.lines[0]));
  });
}

test("a bad or missing project, token or account makes no call", async () => {
  let calls = 0;
  const impl = async () => {
    calls++;
    return { ok: true, json: async () => mixed };
  };
  for (const t of [
    { ...target, project: "../evil" },
    { ...target, project: "Bad Name" },
    { ...target, project: "" },
    { ...target, token: "" },
    { ...target, accountId: null },
  ]) {
    assert.deepEqual(await fetchPublishStatus(t, impl, () => {}), { state: "unknown" });
  }
  assert.equal(calls, 0);
});

test("an unparseable ended_on falls back to the created time", () => {
  const d = { ...prod("success"), latest_stage: { status: "success", ended_on: "not a date" } };
  assert.deepEqual(publishStatus([d], NOW), { state: "published", at: "2026-01-05T00:00:00Z" });
});

test("the publish line for published, publishing, failed and unknown", () => {
  const now = new Date("2026-01-05T00:03:00Z");
  assert.deepEqual(publishLine({ state: "published", at: "2026-01-05T00:01:00Z" }, now), { text: "Published 2 minutes ago", busy: false, failed: false });
  assert.deepEqual(publishLine({ state: "publishing" }, now), { text: "Publishing your change...", busy: true, failed: false });
  assert.deepEqual(publishLine({ state: "failed", at: "2026-01-05T00:01:00Z" }, now), {
    text: "Your last change didn't publish. Your site still shows the version before it.",
    busy: false,
    failed: true,
  });
  assert.equal(publishLine({ state: "unknown" }, now), null);
});

test("a failed fetch never reads as published", async () => {
  for (const [, impl] of failures) {
    const line = publishLine(await fetchPublishStatus(target, impl, () => {}), NOW);
    assert.equal(line, null);
  }
});

test("timeAgo steps from minutes to dates", () => {
  const now = new Date("2026-10-26T12:00:00Z");
  const ago = (ms: number) => new Date(now.getTime() - ms).toISOString();
  assert.equal(timeAgo(ago(10_000), now), "just now");
  assert.equal(timeAgo(ago(60_000), now), "1 minute ago");
  assert.equal(timeAgo(ago(3 * 3_600_000), now), "3 hours ago");
  assert.equal(timeAgo(ago(30 * 3_600_000), now), "yesterday");
  assert.equal(timeAgo(ago(3 * 86_400_000), now), "3 days ago");
  assert.equal(timeAgo(ago(9 * 86_400_000), now), "last week");
  assert.equal(timeAgo("2026-10-03T12:00:00Z", now), "on 3 Oct");
  assert.equal(timeAgo(null, now), "");
});

test("KcSchema accepts pagesProject", () => {
  assert.equal(KcSchema.safeParse({ pagesProject: "besciworks" }).success, true);
  assert.equal(KcSchema.safeParse({ pagesProject: 3 }).success, false);
});
