import { test } from "node:test";
import assert from "node:assert/strict";
import { classifySaveError, SAVE_ERROR_MESSAGES } from "../save-error.ts";

// Messages GitHub returns on a 409 from PUT /repos/{owner}/{repo}/contents/{path}.
const RULESET = "Repository rule violations found\n\nChanges must be made through a pull request.\n\n";
const CLASSIC = "Protected branch update failed for refs/heads/main.";
const CLASSIC_PR = "Changes must be made through a pull request.";
const CONFLICT = "main does not match 3f0f1de";

test("ruleset 409 is protected", () => {
  assert.equal(classifySaveError(409, RULESET, true), "protected");
});

test("classic protected-branch 409 is protected, never conflict", () => {
  assert.equal(classifySaveError(409, CLASSIC, true), "protected");
  assert.equal(classifySaveError(409, CLASSIC_PR, true), "protected");
  assert.equal(classifySaveError(409, CLASSIC, false), "protected");
});

test("409 with sha and a plain conflict message is conflict", () => {
  assert.equal(classifySaveError(409, CONFLICT, true), "conflict");
});

test("no sha falls through to other", () => {
  assert.equal(classifySaveError(409, CONFLICT, false), "other");
  assert.equal(classifySaveError(422, CLASSIC, true), "other");
});

test("protected message names the help address and keeps the text", () => {
  assert.match(SAVE_ERROR_MESSAGES.protected, /hello@kingsburycreative\.com/);
  assert.match(SAVE_ERROR_MESSAGES.protected, /text is still on screen/);
  assert.doesNotMatch(SAVE_ERROR_MESSAGES.protected, /File has changed/);
});

test("only the stale-version 409 counts as mergeable in the browser", async () => {
  const { isStaleShaResponse } = await import("../save-error.ts");
  assert.equal(isStaleShaResponse(409, SAVE_ERROR_MESSAGES.conflict), true);
  assert.equal(isStaleShaResponse(409, SAVE_ERROR_MESSAGES.protected), false);
  assert.equal(isStaleShaResponse(401, SAVE_ERROR_MESSAGES.conflict), false);
});
