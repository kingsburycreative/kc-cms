import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { forSource, nameFromAuthor, redactActionRun, redactHistory } from "../redact.ts";

const read = (path: string) => readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
const api = "app/api/[owner]/[repo]/[branch]/";

const commit = {
  sha: "abc",
  html_url: "https://github.com/o/r/commit/abc",
  parents: [{ sha: "par" }],
  author: { login: "octo", avatar_url: "https://avatars/x" },
  commit: { author: { name: "jane@example.com", email: "jane@example.com", date: "2026-10-01T00:00:00Z" } },
};

test("history keeps only sha, parentSha, date and authorName", () => {
  assert.deepEqual(redactHistory([commit]), [{ sha: "abc", parentSha: "par", date: "2026-10-01T00:00:00Z", authorName: "jane" }]);
  assert.deepEqual(redactHistory([{ sha: "x", commit: { author: { name: "Jane Doe" } } }]), [{ sha: "x", parentSha: null, date: null, authorName: "Jane Doe" }]);
});

test("an email-shaped name keeps the part before @", () => {
  assert.equal(nameFromAuthor("rob@kc.com"), "rob");
  assert.equal(nameFromAuthor("Rob K"), "Rob K");
  assert.equal(nameFromAuthor(null), "");
});

test("an action run loses email, GitHub username, avatar and run link", () => {
  const run = { id: 1, htmlUrl: "https://github.com/run", triggeredByName: "Jane", triggeredByEmail: "j@x.com", triggeredByGithubUsername: "octo", triggeredByImage: "img", status: "completed" };
  assert.deepEqual(redactActionRun(run), { id: 1, htmlUrl: null, triggeredByName: "Jane", triggeredByEmail: null, triggeredByGithubUsername: null, triggeredByImage: null, status: "completed" });
  assert.deepEqual(forSource("user", run), run);
  assert.equal(forSource("installation", run).triggeredByEmail, null);
});

test("the history route redacts for clients", () => {
  const source = read(`${api}entries/[path]/history/route.ts`);
  assert.match(source, /data: source === "installation" \? redactHistory\(response\.data\) : response\.data/);
});

test("the actions list refuses all=1 for clients and redacts every row", () => {
  const source = read(`${api}actions/route.ts`);
  assert.match(source, /if \(listAll && source === "installation"\) throw createHttpError\([^;]*, 403\);/);
  assert.equal(source.match(/\.map\(\(row\) => forSource\(source, \{/g)?.length, 2);
  assert.ok(!/\.map\(\(row\) => \(\{/.test(source));
});

test("the single run route redacts every summary it returns", () => {
  const source = read(`${api}actions/[runId]/route.ts`);
  const summaries = source.match(/toSummary\(/g)?.length ?? 0;
  const wrapped = source.match(/forSource\(source, toSummary\(/g)?.length ?? 0;
  assert.equal(wrapped, summaries);
  assert.ok(wrapped >= 2);
});
