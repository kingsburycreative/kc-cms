import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { inviteGate, inviteGateVerdict, isKnownEmail, type KnownEmailLookups } from "../invite-gate.ts";
import { OTP_PATHS } from "../otp-limit.ts";

const read = (path: string) =>
  readFileSync(new URL(`../../${path}`, import.meta.url), "utf8").replace(/\r\n/g, "\n");

// Fake tables: each lookup matches only the exact lower-cased address, as lower() does in SQL.
const lookups = (rows: { user?: string[]; pending?: string[]; invite?: string[] }): KnownEmailLookups => ({
  user: async (e) => (rows.user ?? []).includes(e),
  pendingCollaborator: async (e) => (rows.pending ?? []).includes(e),
  invite: async (e) => (rows.invite ?? []).includes(e),
});

test("an unknown email is refused on both OTP paths", async () => {
  for (const path of OTP_PATHS) {
    assert.equal(await inviteGate({ path, email: "stranger@x.com" }, lookups({ user: ["a@x.com"] })), "unknown");
    assert.equal(inviteGateVerdict({ path, email: "stranger@x.com", knownEmail: false }), "unknown");
  }
});

test("an existing user, a pending collaborator row and an invite row are each allowed", async () => {
  for (const path of OTP_PATHS) {
    assert.equal(await inviteGate({ path, email: "u@x.com" }, lookups({ user: ["u@x.com"] })), "allow");
    assert.equal(await inviteGate({ path, email: "p@x.com" }, lookups({ pending: ["p@x.com"] })), "allow");
    assert.equal(await inviteGate({ path, email: "i@x.com" }, lookups({ invite: ["i@x.com"] })), "allow");
  }
});

test("a mixed-case email with spaces matches a lower-case row", async () => {
  assert.equal(await isKnownEmail("  Kirk@Henike.CA ", lookups({ invite: ["kirk@henike.ca"] })), true);
  assert.equal(await inviteGate({ path: OTP_PATHS[0], email: "KIRK@henike.ca" }, lookups({ pending: ["kirk@henike.ca"] })), "allow");
});

test("a missing or blank email is refused on OTP paths", async () => {
  assert.equal(await isKnownEmail(undefined, lookups({ user: [""] })), false);
  assert.equal(await inviteGate({ path: OTP_PATHS[1], email: "  " }, lookups({ user: [""] })), "unknown");
});

test("non-OTP paths are untouched and never hit the database", async () => {
  const boom: KnownEmailLookups = { user: async () => { throw new Error("db"); }, pendingCollaborator: async () => false, invite: async () => false };
  for (const path of ["/get-session", "/sign-in/social", "/callback/github"]) {
    assert.equal(await inviteGate({ path, email: "stranger@x.com" }, boom), "allow");
    assert.equal(inviteGateVerdict({ path, email: "stranger@x.com", knownEmail: false }), "allow");
  }
});

test("lib/auth.ts refuses unknown emails after the rate limit", () => {
  const auth = read("lib/auth.ts");
  const limit = auth.indexOf('throw new APIError("TOO_MANY_REQUESTS")');
  const gate = auth.indexOf("await inviteGate(");
  assert.ok(limit > 0 && gate > limit);
  assert.match(auth, /throw new APIError\("FORBIDDEN", \{ message: NOT_INVITED_MESSAGE, code: NOT_INVITED_CODE \}\)/);
});
