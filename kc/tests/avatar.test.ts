import { test } from "node:test";
import assert from "node:assert/strict";
import { initialFor } from "../avatar.ts";

test("a set name gives its initials", () => {
  assert.equal(initialFor({ name: "Kim Lee", email: "z@example.com" }), "KL");
  assert.equal(initialFor({ name: "kim", email: "z@example.com" }), "KI");
});

test("an empty name gives the email's first letter, upper-cased", () => {
  assert.equal(initialFor({ name: "", email: "kim@example.com" }), "K");
  assert.equal(initialFor({ name: "  ", email: "kim@example.com" }), "K");
  assert.equal(initialFor({ name: null, email: "kim@example.com" }), "K");
});

test("it never returns U for nothing", () => {
  assert.notEqual(initialFor({ name: "", email: "" }), "U");
  assert.notEqual(initialFor({ name: undefined, email: undefined }), "U");
});
