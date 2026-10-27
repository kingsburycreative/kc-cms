import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { loadRegister, unclaimed } from "../register/customizations.ts";

const root = fileURLToPath(new URL("../../", import.meta.url));
const register = loadRegister();
const git = (...args: string[]) =>
  execFileSync("git", ["-c", "core.quotepath=off", ...args], { cwd: root, encoding: "utf8" })
    .split("\n")
    .filter(Boolean);
const outsideKc = (f: string) => !f.startsWith("kc/") && !f.startsWith(".github/workflows/kc-");

test("upstreamBase is a full sha", () => {
  assert.match(register.upstreamBase, /^[0-9a-f]{40}$/);
});

test("every entry has a unique id and its files and tests exist", () => {
  const ids = register.entries.map((e) => e.id);
  assert.equal(new Set(ids).size, ids.length);
  const missing = register.entries.flatMap((e) =>
    [...e.files, ...e.tests].filter((f) => !existsSync(root + f)).map((f) => `${e.id}: ${f}`),
  );
  assert.deepEqual(missing, []);
});

test("every upstream file the fork changed is claimed", () => {
  const changed = git("diff", "--name-only", register.upstreamBase, "HEAD").filter(outsideKc);
  assert.ok(changed.length > 0);
  const left = unclaimed(changed, register.entries);
  assert.deepEqual(left, [], `unclaimed: ${left.join(", ")}`);
});

test("every upstream file importing kc/ is claimed", () => {
  const importers = git("grep", "-lE", "(@/kc/|\\.\\./kc/)", "--", ".", ":!kc", ":!.claude");
  assert.ok(importers.length > 0);
  const left = unclaimed(importers, register.entries);
  assert.deepEqual(left, [], `unclaimed: ${left.join(", ")}`);
});
