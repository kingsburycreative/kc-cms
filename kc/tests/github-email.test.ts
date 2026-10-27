import { test } from "node:test";
import assert from "node:assert/strict";
import { pickVerifiedGithubEmail } from "../github-email.ts";

const entry = (email: string, primary: boolean, verified: boolean) => ({ email, primary, verified });

test("verified matching email passes", () => {
  assert.equal(pickVerifiedGithubEmail("a@x.test", [entry("a@x.test", false, true), entry("p@x.test", true, true)]), "a@x.test");
});

test("unverified matching email is refused", () => {
  assert.equal(pickVerifiedGithubEmail("a@x.test", [entry("a@x.test", false, false), entry("p@x.test", true, true)]), null);
});

test("unverified primary is refused", () => {
  assert.equal(pickVerifiedGithubEmail(null, [entry("p@x.test", true, false)]), null);
});

test("emails list undefined is refused", () => {
  assert.equal(pickVerifiedGithubEmail("a@x.test", undefined), null);
});

test("emails list not an array is refused", () => {
  assert.equal(pickVerifiedGithubEmail("a@x.test", { message: "Bad credentials" }), null);
});

test("empty list is refused", () => {
  assert.equal(pickVerifiedGithubEmail("a@x.test", []), null);
});

test("missing profile email uses a verified primary", () => {
  assert.equal(pickVerifiedGithubEmail(null, [entry("o@x.test", false, true), entry("p@x.test", true, true)]), "p@x.test");
});
