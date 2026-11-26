import { test } from "node:test";
import assert from "node:assert/strict";
import { normaliseEmail, sameInbox } from "../email-normalise.ts";

test("Gmail spellings of one inbox all match one invite", () => {
  const invite = "firstlast@gmail.com";
  for (const typed of ["first.last@gmail.com", "firstlast+x@googlemail.com", "FirstLast@gmail.com"]) {
    assert.equal(sameInbox(typed, invite), true, typed);
    assert.equal(sameInbox(invite, typed), true, typed);
  }
});

test("non-Gmail addresses keep their dots and plus parts", () => {
  assert.equal(normaliseEmail("First.Last@henike.ca"), "first.last@henike.ca");
  assert.equal(sameInbox("first.last@henike.ca", "firstlast@henike.ca"), false);
  assert.equal(normaliseEmail("a+b@henike.ca"), "a+b@henike.ca");
});
