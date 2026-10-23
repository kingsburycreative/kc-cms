import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { isBranchAllowed, visibleBranches } from "../branch-lock.ts";

const read = (path: string) => readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
const api = "app/api/[owner]/[repo]/[branch]/";

// Every route.ts under the [branch] API folder, relative to the project root.
const routes = (dir: string): string[] =>
  readdirSync(new URL(`../../${dir}`, import.meta.url), { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? routes(`${dir}${entry.name}/`) : entry.name === "route.ts" ? [`${dir}${entry.name}`] : [],
  );

const lockCall = "await assertBranchAllowed(source, token, params.owner, params.repo, params.branch);";

test("a client may use the default branch only", () => {
  assert.equal(isBranchAllowed({ source: "installation", branch: "main", defaultBranch: "main" }), true);
  assert.equal(isBranchAllowed({ source: "installation", branch: "draft", defaultBranch: "main" }), false);
  assert.equal(isBranchAllowed({ source: "installation", branch: "feat%2Fx", defaultBranch: "feat/x" }), true);
});

test("a user token may use any branch", () => {
  assert.equal(isBranchAllowed({ source: "user", branch: "draft", defaultBranch: "main" }), true);
});

test("a client sees no branches, staff see them all", () => {
  assert.deepEqual(visibleBranches("installation", ["main", "draft"]), []);
  assert.deepEqual(visibleBranches("user", ["main", "draft"]), ["main", "draft"]);
});

test("the server helper denies with 403 and skips staff", () => {
  const source = read("kc/branch-lock-server.ts");
  assert.match(source, /if \(source === "user"\) return;/);
  assert.match(source, /isBranchAllowed\(\{ source, branch, defaultBranch \}\)/);
  assert.match(source, /createHttpError\([^;]*, 403\)/);
});

test("every [branch] API route that gets a token applies the lock after each getToken", () => {
  const found = routes(api);
  assert.ok(found.length > 5, "route walk found nothing");
  for (const path of found) {
    const source = read(path);
    const tokens = source.match(/await getToken\(/g)?.length ?? 0;
    if (tokens === 0) continue;
    const locked = source.match(/const \{ token, source \} = await getToken\([^;]*\);\s*await assertBranchAllowed\(source, token, params\.owner, params\.repo, params\.branch\);/g)?.length ?? 0;
    assert.equal(locked, tokens, `${path}: every getToken must be followed by the lock`);
    assert.ok(source.includes(lockCall));
  }
});

test("getRepoReadContext applies the lock, so its routes are covered", () => {
  const source = read("lib/api-repo-context.ts");
  assert.match(source, /if \(!token\) throw createHttpError\("Token not found", 401\);\s*await assertBranchAllowed\(source, token, owner, repo, branch\);/);
  for (const path of routes(api)) {
    const route = read(path);
    if (!route.includes("getToken(") && !route.includes("getRepoReadContext(")) continue;
    assert.ok(route.includes("getRepoReadContext(") || route.includes(lockCall), path);
  }
});

test("branches POST refuses a user without a GitHub username before getting a token", () => {
  const source = read(`${api}branches/route.ts`);
  const gate = source.search(/if \(!user\.githubUsername\) throw createHttpError\([^;]*, 403\);/);
  assert.ok(gate !== -1 && gate < source.indexOf("getToken("));
});

test("the repo layout gives a client an empty branch list", () => {
  const source = read("app/(main)/[owner]/[repo]/layout.tsx");
  assert.match(source, /const \{ token, source \} = await getToken\(user, owner, repo\);/);
  assert.match(source, /<RepoProvider repo=\{\{ \.\.\.repoInfo, branches: visibleBranches\(source, repoInfo\.branches\) \}\}>/);
});

test("the branch layout refuses a client on another branch", () => {
  const source = read("app/(main)/[owner]/[repo]/[branch]/layout.tsx");
  assert.match(source, /const \{ token, source \} = await getToken\(user, owner, repo\);\s*await assertBranchAllowed\(source, token, owner, repo, decodedBranch\);/);
  assert.match(source, /error\.status === 403/);
});
