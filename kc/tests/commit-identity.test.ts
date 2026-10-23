import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { kcCommitIdentity, KC_DEFAULT_COMMIT_IDENTITY } from "../commit-identity.ts";

const source = readFileSync(new URL("../../lib/commit-message.ts", import.meta.url), "utf8");

test("default is user", () => {
  assert.equal(KC_DEFAULT_COMMIT_IDENTITY, "user");
});

test("unset or unknown values give user", () => {
  for (const v of [undefined, null, "", "bogus"]) {
    assert.equal(kcCommitIdentity(v), "user");
  }
});

test("explicit app and user are kept", () => {
  assert.equal(kcCommitIdentity("app"), "app");
  assert.equal(kcCommitIdentity("user"), "user");
});

test("commit-message imports the kc module", () => {
  assert.match(source, /from "@\/kc\/commit-identity"/);
});

test("resolveCommitIdentity defaults through kcCommitIdentity", () => {
  assert.match(source, /return kcCommitIdentity\(configObject\?\.settings\?\.commit\?\.identity\)/);
});

test("override branch is kept and old app fallback is gone", () => {
  assert.match(source, /identityOverride === "app" \|\| identityOverride === "user"/);
  assert.doesNotMatch(source, /: "app";/);
});
