import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { isSettingsPath, pushDenial } from "../settings-gate.ts";
import { normalizePath } from "../../lib/utils/file.ts";

const read = (path: string) => readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
const api = "app/api/[owner]/[repo]/[branch]/";

// The part of `source` from `start` up to `end` (or the end of the file).
const slice = (source: string, start: string, end?: string) => {
  const from = source.indexOf(start);
  assert.notEqual(from, -1, `missing ${start}`);
  const to = end ? source.indexOf(end, from) : source.length;
  assert.notEqual(to, -1, `missing ${end}`);
  return source.slice(from, to);
};

// `gate` matches before the first `sink`, so the sink cannot run without it.
const gatedBefore = (source: string, gate: RegExp, sink: string) => {
  const gateAt = source.search(gate);
  const sinkAt = source.indexOf(sink);
  assert.notEqual(sinkAt, -1, `missing ${sink}`);
  assert.ok(gateAt !== -1 && gateAt < sinkAt, `${gate} must come before ${sink}`);
};

const push = (cond: string) =>
  new RegExp(`if \\(${cond}\\)\\s*\\{?\\s*await requireOwnRepoPush\\(user, params\\.owner, params\\.repo, `);

test("no GitHub identity is denied, even with push", () => {
  assert.equal(pushDenial({ githubIdentity: false, push: false }), "identity");
  assert.equal(pushDenial({ githubIdentity: false, push: true }), "identity");
});

test("a GitHub identity without push on its own token is denied", () => {
  assert.equal(pushDenial({ githubIdentity: true, push: false }), "push");
});

test("a GitHub identity with push is allowed", () => {
  assert.equal(pushDenial({ githubIdentity: true, push: true }), null);
});

test("every spelling of the root settings file counts, other files do not", () => {
  for (const path of [".pages.yml", "/.pages.yml", "./.pages.yml", "a/../.pages.yml", "%2Epages.yml", ".%2F.pages.yml"]) {
    assert.equal(isSettingsPath(path), true, path);
  }
  for (const path of ["content/.pages.yml", ".pages.yaml", "pages.yml", "", null, undefined, "%E0%A4%A"]) {
    assert.equal(isSettingsPath(path), false, String(path));
  }
});

test("the server wrapper proves push with the user's own token and denies with 403", () => {
  const source = read("kc/settings-gate-server.ts");
  assert.match(source, /await requireGithubRepoWriteAccess\(user, owner, repo, identityMessage\)/);
  assert.doesNotMatch(source, /getToken\b/);
  assert.match(source, /pushDenial\(\{ githubIdentity, push \}\)/);
  assert.equal(source.match(/createHttpError\([^;]*, 403\)/g)?.length, 2);
});

test("files POST: the settings branch and any write to .pages.yml go through the gate", () => {
  const source = slice(read(`${api}files/[path]/route.ts`), "export async function POST", "const githubSaveFile");
  gatedBefore(source, push(`data\\.type === "settings" \\|\\| isSettingsPath\\(normalizedPath\\)`), "switch (data.type)");
  assert.doesNotMatch(source, /assertGithubIdentity/);
});

test("a path that only normalises to .pages.yml counts once normalised", () => {
  for (const path of ["a\\b/../.pages.yml", "a%2Fb/../.pages.yml"]) {
    assert.equal(isSettingsPath(normalizePath(path)), true, path);
  }
});

// The settings check judges the normalised path, the one GitHub receives.
const settingsPath = /const normalizedPath = normalizePath\(params\.path\);\s*const settingsPath = isSettingsPath\(params\.path\) \|\| isSettingsPath\(normalizedPath\);/;

test("files DELETE: .pages.yml is gated and still refused before the delete", () => {
  const source = slice(read(`${api}files/[path]/route.ts`), "export async function DELETE");
  gatedBefore(source, settingsPath, "if (settingsPath)");
  gatedBefore(source, push(`settingsPath`), "deleteFile(");
  gatedBefore(source, /!isContentOperationAllowed\("delete", \{ scope: "settings" \}\) && settingsPath\)/, "deleteFile(");
  assert.match(source, /deleteFile\(\{[^}]*path: normalizedPath,/);
});

test("rename: .pages.yml is gated and refused as source, and refused as destination", () => {
  const source = read(`${api}files/[path]/rename/route.ts`);
  const post = slice(source, "export async function POST", "const githubRenameFile");
  gatedBefore(post, settingsPath, "if (settingsPath)");
  gatedBefore(post, push(`settingsPath`), "githubRenameFile(");
  gatedBefore(post, /!isContentOperationAllowed\("rename", \{ scope: "settings" \}\) && settingsPath\)/, "githubRenameFile(");
  gatedBefore(post, /const normalizedNewPath = normalizePath\(data\.newPath\);\s*if \(isSettingsPath\(data\.newPath\) \|\| isSettingsPath\(normalizedNewPath\)\) throw createHttpError\([^;]*, 403\)/, "githubRenameFile(");
  assert.match(post, /githubRenameFile\([^)]*normalizedPath,\s*normalizedNewPath,/);
});

test("entries GET: reading .pages.yml goes through the gate", () => {
  const source = read(`${api}entries/[path]/route.ts`);
  gatedBefore(source, push(`isSettingsPath\\(normalizedPath\\)`), "metaOnly) {");
  gatedBefore(source, push(`isSettingsPath\\(normalizedPath\\)`), "getContent(");
  assert.doesNotMatch(source, /assertGithubIdentity/);
});

test("history GET: reading .pages.yml history goes through the gate", () => {
  const source = read(`${api}entries/[path]/history/route.ts`);
  gatedBefore(source, push(`isSettingsPath\\(normalizedPath\\)`), "listCommits(");
  assert.doesNotMatch(source, /assertGithubIdentity/);
});

test("actions POST: dispatching a workflow goes through the gate first", () => {
  const source = slice(read(`${api}actions/route.ts`), "export async function POST");
  gatedBefore(source, /await requireOwnRepoPush\(user, params\.owner, params\.repo, /, "getToken(");
  gatedBefore(source, /await requireOwnRepoPush\(user, params\.owner, params\.repo, /, "createWorkflowDispatch(");
});

test("action run POST: a rerun, or cancelling someone else's run, goes through the gate first", () => {
  const source = slice(read(`${api}actions/[runId]/route.ts`), "export async function POST");
  const gate = push(`body\\.intent === "rerun" \\|\\| !isOwnRun`);
  gatedBefore(source, gate, "getToken(");
  gatedBefore(source, gate, "cancelWorkflowRun(");
  gatedBefore(source, gate, "createWorkflowDispatch(");
});
