import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { cleanInviteName, nameToApply } from "../invite-name.ts";

const read = (path: string) => readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");

test("nameToApply fills a blank or whitespace name", () => {
  assert.equal(nameToApply("", "Jane Smith"), "Jane Smith");
  assert.equal(nameToApply("   ", " Jane Smith "), "Jane Smith");
  assert.equal(nameToApply(null, "Jane Smith"), "Jane Smith");
});

test("nameToApply leaves a set name alone", () => {
  assert.equal(nameToApply("Jane", "Jane Smith"), null);
});

test("nameToApply gives null when the invite has no name", () => {
  assert.equal(nameToApply("", null), null);
});

test("cleanInviteName trims and empties to null", () => {
  assert.equal(cleanInviteName("  Jane  "), "Jane");
  assert.equal(cleanInviteName("   "), null);
  assert.equal(cleanInviteName(null), null);
});

test("cleanInviteName accepts 80 and refuses 81 characters", () => {
  assert.equal(cleanInviteName("a".repeat(80)), "a".repeat(80));
  assert.throws(() => cleanInviteName("a".repeat(81)));
});

test("cleanInviteName refuses control characters", () => {
  assert.throws(() => cleanInviteName("Jane\nSmith"));
  assert.throws(() => cleanInviteName("Jane\u0000"));
});

test("sign-in sets the user name only through nameToApply", () => {
  const src = read("lib/collaborator-access.ts");
  assert.match(src, /const newName = nameToApply\(user\.name, invite\?\.name\);/);
  assert.deepEqual(src.match(/\bname: \w+/g), ["name: newName"]);
});

test("the invite action stores the name only through cleanInviteName", () => {
  const src = read("lib/actions/collaborator.ts");
  assert.match(src, /const inviteName = cleanInviteName\(formData\.get\("name"\)\);/);
  assert.deepEqual(src.match(/\bname: \w+/g), ["name: inviteName"]);
});

test("the migration adds one nullable name column to collaborator_invite", () => {
  const dir = new URL("../../db/migrations/", import.meta.url);
  const file = readdirSync(dir).filter((f) => f.endsWith("_invite_name.sql"));
  assert.equal(file.length, 1);
  const sql = readFileSync(new URL(file[0], dir), "utf8").trim();
  assert.equal(sql, 'ALTER TABLE "collaborator_invite" ADD COLUMN "name" text;');
});
