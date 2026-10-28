import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { insightsPropertyFor, insightsSourcesFor, parseInsightsMap, type InsightsSources } from "../insights/map.ts";
import {
  BAD_ID, NOT_ADMIN, NOT_STAFF, TAKEN, fileReposUsing, saveInsightsKeys, rowSources, type KeysRow, type SaveDeps,
} from "../insights/keys.ts";

process.env.KC_INSIGHTS_MAP = "/fake/insights.json";
const file = () => JSON.stringify({ "kc/site": { ga: "111", cf: "filetag" }, "kc/fileonly": "222" });

// An in-memory table, and a fake GitHub that knows who is admin of what.
function fakes(admins: Record<string, string[]> = {}, staffIds = ["u1"]) {
  const rows = new Map<string, KeysRow>();
  const lookup = async (repo: string): Promise<InsightsSources | null> => (rows.has(repo) ? rowSources(rows.get(repo)!) : null);
  const deps = (user: SaveDeps["user"]): SaveDeps => ({
    user,
    isStaff: () => staffIds.includes(user?.id ?? ""),
    userToken: async (id) => `token-${id}`,
    isAdmin: async (token, owner, repo) => (admins[token] ?? []).includes(`${owner}/${repo}`),
    reposUsing: async (field, value) => [
      ...[...rows].filter(([, row]) => row[field] === value).map(([repo]) => repo),
      ...fileReposUsing(parseInsightsMap(file()), field, value),
    ],
    save: async (repo, row) => void rows.set(repo, row),
  });
  return { rows, lookup, deps };
}
const staff = { id: "u1", githubUsername: "rob" };

test("a table row wins over the file", async () => {
  const { rows, lookup } = fakes();
  rows.set("kc/site", { ga: "999", cf: null, pages: "site" });
  assert.deepEqual(await insightsSourcesFor("kc", "site", file, lookup), { ga: "999", pages: "site" });
  assert.equal(await insightsPropertyFor("kc", "site", file, lookup), "999");
});

test("no row falls back to the file, and so does a table that throws", async () => {
  const { lookup } = fakes();
  assert.deepEqual(await insightsSourcesFor("kc", "site", file, lookup), { ga: "111", cf: "filetag" });
  assert.deepEqual(await insightsSourcesFor("kc", "fileonly", file, async () => { throw new Error("db down"); }), { ga: "222" });
});

test("each ID refuses a bad value and nothing is saved", async () => {
  const { rows, deps } = fakes({ "token-u1": ["kc/site"] });
  for (const [field, bad] of [["ga", "G-123"], ["cf", "tag with space"], ["pages", "Bad_Name"]] as const) {
    const result = await saveInsightsKeys({ owner: "kc", repo: "site", ga: "1", [field]: bad }, deps(staff));
    assert.deepEqual(result, { status: 400, message: BAD_ID[field], field });
  }
  assert.equal(rows.size, 0);
});

test("the Cloudflare tag message names underscores, which the validator accepts", () => {
  assert.match(BAD_ID.cf, /underscores/);
});

test("a GitHub user without admin on the repo is refused 403", async () => {
  const { rows, deps } = fakes({ "token-u1": ["kc/other"] });
  assert.deepEqual(await saveInsightsKeys({ owner: "kc", repo: "site", ga: "5" }, deps(staff)), { status: 403, message: NOT_ADMIN });
  assert.equal(rows.size, 0);
});

test("a GitHub repo admin who is not KC staff is refused 403", async () => {
  const { rows, deps } = fakes({ "token-u2": ["kc/site"] });
  assert.deepEqual(await saveInsightsKeys({ owner: "kc", repo: "site", ga: "5" }, deps({ id: "u2", githubUsername: "eve" })),
    { status: 403, message: NOT_STAFF });
  assert.equal(rows.size, 0);
});

test("an ID another repo has in the table is refused", async () => {
  const { rows, deps } = fakes({ "token-u1": ["kc/site"] });
  rows.set("kc/other", { ga: "777", cf: "othertag", pages: "other" });
  for (const [field, value] of [["ga", "777"], ["cf", "othertag"], ["pages", "other"]] as const) {
    assert.deepEqual(await saveInsightsKeys({ owner: "kc", repo: "site", [field]: value }, deps(staff)),
      { status: 400, message: TAKEN[field], field });
  }
  assert.deepEqual([...rows.keys()], ["kc/other"]);
});

test("an ID another repo has in the file is refused", async () => {
  const { rows, deps } = fakes({ "token-u1": ["kc/new"] });
  assert.deepEqual(await saveInsightsKeys({ owner: "kc", repo: "new", ga: "222" }, deps(staff)), { status: 400, message: TAKEN.ga, field: "ga" });
  assert.deepEqual(await saveInsightsKeys({ owner: "kc", repo: "new", cf: "filetag" }, deps(staff)), { status: 400, message: TAKEN.cf, field: "cf" });
  assert.equal(rows.size, 0);
});

test("a repo can re-save its own IDs from the file and the table", async () => {
  const { rows, deps } = fakes({ "token-u1": ["kc/site"] });
  assert.equal((await saveInsightsKeys({ owner: "kc", repo: "site", ga: "111", cf: "filetag", pages: "site" }, deps(staff))).status, 200);
  assert.equal((await saveInsightsKeys({ owner: "kc", repo: "site", ga: "111", cf: "filetag", pages: "site" }, deps(staff))).status, 200);
  assert.deepEqual(rows.get("kc/site"), { ga: "111", cf: "filetag", pages: "site" });
});

test("an email client user is refused, even when GitHub would say admin", async () => {
  const { rows, deps } = fakes({ "token-c1": ["kc/site"] });
  assert.equal((await saveInsightsKeys({ owner: "kc", repo: "site", ga: "5" }, deps({ id: "c1", githubUsername: null }))).status, 403);
  assert.equal((await saveInsightsKeys({ owner: "kc", repo: "site", ga: "5" }, deps(null))).status, 403);
  assert.equal(rows.size, 0);
});

test("an admin saves and the next read returns the saved IDs, lower-cased by repo", async () => {
  const { rows, lookup, deps } = fakes({ "token-u1": ["KC/Site"] });
  const result = await saveInsightsKeys({ owner: "KC", repo: "Site", ga: " 42 ", cf: "abc123", pages: "" }, deps(staff));
  assert.equal(result.status, 200);
  assert.equal(result.message, "Saved. GA4: 42, Cloudflare: abc123, Pages: none.");
  assert.deepEqual([...rows.keys()], ["kc/site"]);
  assert.deepEqual(await insightsSourcesFor("Kc", "SITE", file, lookup), { ga: "42", cf: "abc123" });
  assert.deepEqual(result.saved, { ga: "42", cf: "abc123", pages: null });
});

// Source level: the action and the form load Next and React, which this runner cannot.
const source = (name: string) => readFileSync(new URL(`../insights/${name}`, import.meta.url), "utf8");

test("after a save the form's fields hold the saved IDs, not the old or empty ones", () => {
  const form = source("keys-form.tsx");
  assert.match(form, /const values[^=]*= result\?\.saved \?\? sources/);
  assert.match(form, /defaultValue=\{values\[field\.name\] \?\? ""\}/);
  assert.doesNotMatch(form, /defaultValue=\{sources/);
});

test("the action revalidates the repo's dashboards only on a successful save", () => {
  const action = source("keys-action.ts");
  assert.match(action, /import \{ revalidatePath \} from "next\/cache"/);
  assert.match(action, /if \(result\.status === 200\) revalidatePath\(\["", text\("owner"\), text\("repo"\)\]\.join\("\/"\), "layout"\)/);
});
