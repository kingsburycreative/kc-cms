import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");
const auth = read("../../lib/auth.ts");
const access = read("../../lib/collaborator-access.ts");
const admin = read("../../lib/admin.ts");

test("github is not a trusted provider for implicit account linking", () => {
  const list = auth.match(/trustedProviders:\s*\[([^\]]*)\]/);
  assert.ok(list, "trustedProviders list missing");
  assert.doesNotMatch(list[1], /github/);
});

test("collaboratorMatchesUser matches by email only for a verified email", () => {
  const start = access.indexOf("const collaboratorMatchesUser =");
  const body = access.slice(start, access.indexOf("const collaboratorMatchesUserForRepo", start));
  const guard = body.search(/if \(user\.emailVerified !== true\) return eq\(collaboratorTable\.userId, user\.id\);/);
  assert.ok(guard !== -1, "emailVerified guard missing");
  assert.ok(guard < body.indexOf("isNull(collaboratorTable.userId)"));
});

test("hasAdminAccess requires a verified email", () => {
  assert.match(admin, /const hasAdminAccess = [^\n]*\n\s*return Boolean\(user && user\.emailVerified === true && isBootstrapAdminEmail\(user\.email\)\);/);
});
