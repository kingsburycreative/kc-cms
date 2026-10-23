import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../../app/api/[owner]/[repo]/[branch]/branches/route.ts", import.meta.url), "utf8");
const at = (pattern: RegExp) => source.search(pattern);

const sourceGate = at(/if \(source !== "user"\) throw createHttpError\("Only KC staff can create branches\.", 403\);/);
const pushGate = at(/await requireOwnRepoPush\(user, params\.owner, params\.repo, "Only KC staff can create branches\."\);/);
const body = source.indexOf("request.json()");
const octokit = source.indexOf("createOctokitInstance(token)");

test("branches POST refuses a non-user token before reading the body or calling GitHub", () => {
  assert.ok(sourceGate !== -1, "source gate missing");
  assert.ok(sourceGate < body && sourceGate < octokit);
});

test("branches POST requires push on the route's own repo before reading the body or calling GitHub", () => {
  assert.ok(pushGate !== -1, "push gate missing");
  assert.ok(pushGate < body && pushGate < octokit);
  assert.match(source, /import \{ requireOwnRepoPush \} from "@\/kc\/settings-gate-server";/);
});

test("the githubUsername gate still comes before getToken", () => {
  const gate = at(/if \(!user\.githubUsername\) throw createHttpError\([^;]*, 403\);/);
  assert.ok(gate !== -1 && gate < source.indexOf("getToken("));
});
