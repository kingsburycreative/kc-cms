import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { addedSubject, inviteSubject, withSenderName } from "../email.ts";

const read = (path: string) =>
  readFileSync(new URL(`../../${path}`, import.meta.url), "utf8").replace(/\s+/g, " ");

test("a bare address gets the Kingsbury Creative name", () => {
  assert.equal(
    withSenderName("noreply@kingsburycreative.com"),
    "Kingsbury Creative <noreply@kingsburycreative.com>",
  );
});

test("a From with a display name is unchanged", () => {
  assert.equal(withSenderName("Someone <a@b.c>"), "Someone <a@b.c>");
});

test("subjects use the client name and no owner/repo", () => {
  for (const subject of [inviteSubject("Henike Tree Service"), addedSubject("Henike Tree Service")]) {
    assert.ok(subject.includes("Henike Tree Service"));
    assert.ok(!/\w+\/\w+/.test(subject));
  }
});

test("collaborator.ts uses the subject helpers and mailer.ts the sender name", () => {
  const actions = read("lib/actions/collaborator.ts");
  assert.match(actions, /inviteSubject\(/);
  assert.match(actions, /addedSubject\(/);
  assert.match(read("lib/mailer.ts"), /withSenderName\(/);
});

test("the email templates have no invitedByUrl, github.com or Pages CMS", () => {
  for (const file of ["invite", "login", "collaborator-added"]) {
    const src = read(`components/email/${file}.tsx`);
    for (const banned of ["invitedByUrl", "github.com", "Pages CMS"]) {
      assert.ok(!src.includes(banned), `${file} contains ${banned}`);
    }
  }
});
