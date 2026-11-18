import { test } from "node:test";
import assert from "node:assert/strict";
import { EMPTY_HOME_HINT, EMPTY_HOME_SIGN_OUT, signedInAsLine } from "../empty-home-copy.ts";

test("the line names the signed-in email", () => {
  assert.equal(signedInAsLine({ email: "kirk@example.com", name: "Kirk" }), "You're signed in as kirk@example.com.");
});

test("a missing name still shows the email", () => {
  assert.equal(signedInAsLine({ email: "kirk@example.com", name: null }), "You're signed in as kirk@example.com.");
  assert.equal(signedInAsLine({ email: "kirk@example.com" }), "You're signed in as kirk@example.com.");
  assert.equal(signedInAsLine({ email: " kirk@example.com ", name: "  " }), "You're signed in as kirk@example.com.");
});

test("a missing email falls back to the name", () => {
  assert.equal(signedInAsLine({ email: "", name: "Kirk" }), "You're signed in as Kirk.");
});

test("it never shows an empty signed in as", () => {
  assert.equal(signedInAsLine(null), null);
  assert.equal(signedInAsLine(undefined), null);
  assert.equal(signedInAsLine({ email: "", name: "" }), null);
  assert.equal(signedInAsLine({ email: "  ", name: null }), null);
});

test("the hint and button say what to do", () => {
  assert.match(EMPTY_HOME_HINT, /sign out and sign in/);
  assert.equal(EMPTY_HOME_SIGN_OUT, "Sign out");
});
