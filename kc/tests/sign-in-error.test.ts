import { test } from "node:test";
import assert from "node:assert/strict";
import { inlineSignInError } from "../sign-in-error.ts";
import { NOT_INVITED_CODE } from "../invite-gate.ts";

test("EMAIL_NOT_INVITED maps to inline copy with a mailto", () => {
  const e = inlineSignInError(NOT_INVITED_CODE);
  assert.ok(e);
  assert.match(e.message, /no account for this email address/);
  assert.equal(e.helpHref, "mailto:hello@kingsburycreative.com");
});

test("other codes stay toasts", () => {
  assert.equal(inlineSignInError("SOMETHING_ELSE"), null);
  assert.equal(inlineSignInError(undefined), null);
});
