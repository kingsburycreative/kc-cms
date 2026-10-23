import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { isStaffParam, signInMethods } from "../sign-in-methods.ts";

const read = (p: string) => readFileSync(new URL(`../../${p}`, import.meta.url), "utf8");

test("email only by default, GitHub for staff", () => {
  assert.deepEqual(signInMethods({ staff: false }), ["email"]);
  assert.deepEqual(signInMethods({ staff: true }), ["email", "github"]);
});

test("only staff=1 turns the staff view on", () => {
  assert.equal(isStaffParam(new URLSearchParams("staff=1")), true);
  assert.equal(isStaffParam(new URLSearchParams("staff=0")), false);
  assert.equal(isStaffParam(new URLSearchParams("")), false);
});

test("sign-in renders the GitHub button only through signInMethods", () => {
  const src = read("components/sign-in.tsx");
  assert.match(src, /signInMethods\(/);
  assert.match(src, /methods\.includes\("github"\) && \(/);
  assert.equal(src.match(/handleGithubSignIn/g)?.length, 2);
});

test("settings identities read connectGithub", () => {
  assert.match(read("components/settings/identities.tsx"), /connectGithub/);
});
