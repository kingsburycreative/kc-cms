import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { adminPageGate } from "../admin-gate.ts";

const read = (path: string) =>
  readFileSync(new URL(`../../${path}`, import.meta.url), "utf8").replace(/\r\n/g, "\n");

const admins = new Set(["boss@example.test"]);
// Mirrors hasAdminAccess in lib/admin.ts, which tests cannot load (server-only).
const isAdmin = (user: { email: string; emailVerified: boolean } | null) =>
  Boolean(user && user.emailVerified === true && admins.has(user.email.trim().toLowerCase()));

const gate = (user: { email: string; emailVerified: boolean } | null) => adminPageGate(user, isAdmin(user));

test("signed out goes to sign-in with a return to /admin", () => {
  assert.deepEqual(gate(null), { kind: "redirect", to: "/sign-in?redirect=%2Fadmin" });
});

test("a signed-in non-admin goes home, not to sign-in", () => {
  assert.deepEqual(gate({ email: "someone@example.test", emailVerified: true }), { kind: "redirect", to: "/" });
  assert.deepEqual(gate({ email: "boss@example.test", emailVerified: false }), { kind: "redirect", to: "/" });
});

test("an admin, with odd case and spacing, gets the page", () => {
  assert.deepEqual(gate({ email: "  Boss@Example.TEST ", emailVerified: true }), { kind: "ok" });
});

test("hasAdminAccess still trims, lowercases and needs a verified email", () => {
  const admin = read("lib/admin.ts");
  assert.match(admin, /email\.trim\(\)\.toLowerCase\(\)/);
  assert.match(admin, /user\.emailVerified === true && isBootstrapAdminEmail\(user\.email\)/);
});

test("the admin page uses requireAdminPage; server actions keep the throw", () => {
  const page = read("app/(main)/admin/page.tsx");
  assert.match(page, /await requireAdminPage\(\);/);
  assert.doesNotMatch(page, /requireAdminSession/);
  assert.match(read("lib/actions/admin.ts"), /requireAdminSession\(\)/);
  const admin = read("lib/admin.ts");
  assert.match(admin, /createHttpError\("Not signed in\.", 401\)/);
  assert.match(admin, /createHttpError\("Admin access required\.", 403\)/);
  assert.match(admin, /const gate = adminPageGate\(user, hasAdminAccess\(user\)\);/);
});
