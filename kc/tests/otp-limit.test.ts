import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { AUTH_DISABLED_PATHS } from "../auth-disabled-paths.ts";
import { createOtpGuard, ipKey, emailKey, OTP_WINDOW_MS } from "../otp-limit.ts";

const read = (path: string) =>
  readFileSync(new URL(`../../${path}`, import.meta.url), "utf8").replace(/\r\n/g, "\n");

const SEND = "/email-otp/send-verification-otp";
const SIGN_IN = "/sign-in/email-otp";

test("the sixth request from one IP for one email is refused, counted before the verdict", () => {
  const guard = createOtpGuard();
  const verdicts = Array.from({ length: 6 }, () => guard({ path: SEND, ip: "1.2.3.4", email: "a@x.com", now: 0 }));
  assert.deepEqual(verdicts.filter((v) => v === "allow").length, 5);
  assert.equal(verdicts[5], 429);
  assert.equal(guard.byPair.buckets.get("a@x.com|1.2.3.4")?.count, 6);
});

test("an IP's burst of n+1 synchronous calls gives exactly n allows", () => {
  const guard = createOtpGuard();
  const verdicts = Array.from({ length: 11 }, (_, i) => guard({ path: SEND, ip: "1.2.3.4", email: `u${i}@x.com`, now: 0 }));
  assert.equal(verdicts.filter((v) => v === "allow").length, 10);
  assert.equal(verdicts[10], 429);
});

test("one IP spending its budgets cannot stop an email getting through from another IP", () => {
  const guard = createOtpGuard();
  for (let i = 0; i < 4; i++) guard({ path: SEND, ip: "6.6.6.6", email: `u${i}@x.com`, now: 0 });
  for (let i = 0; i < 10; i++) guard({ path: SIGN_IN, ip: "6.6.6.6", email: "victim@x.com", now: 0 });
  assert.equal(guard({ path: SEND, ip: "6.6.6.6", email: "victim@x.com", now: 0 }), 429);
  assert.equal(guard({ path: SEND, ip: "7.7.7.7", email: "victim@x.com", now: 0 }), "allow");
});

test("one email from 31 IPs is refused on the 31st, matched case-blind", () => {
  assert.equal(emailKey("  A@X.com "), "a@x.com");
  const guard = createOtpGuard();
  for (let i = 0; i < 30; i++) {
    assert.equal(guard({ path: SIGN_IN, ip: `10.0.0.${i}`, email: "A@x.com", now: 0 }), "allow");
  }
  assert.equal(guard({ path: SEND, ip: "10.0.1.1", email: " a@X.COM", now: 0 }), 429);
});

test("a request refused by IP does not change the email counters", () => {
  const guard = createOtpGuard(1);
  guard({ path: SEND, ip: "6.6.6.6", email: "a@x.com", now: 0 });
  const pair = guard.byPair.buckets.get("a@x.com|6.6.6.6")?.count;
  for (let i = 0; i < 5; i++) {
    assert.equal(guard({ path: SEND, ip: "6.6.6.6", email: "victim@x.com", now: 0 }), 429);
  }
  assert.equal(guard.byEmail.buckets.has("victim@x.com"), false);
  assert.equal(guard.byPair.buckets.has("victim@x.com|6.6.6.6"), false);
  assert.equal(guard.byPair.buckets.get("a@x.com|6.6.6.6")?.count, pair);
});

test("a request with no email only counts its IP", () => {
  const guard = createOtpGuard(2);
  assert.equal(guard({ path: SEND, ip: "1.1.1.1", email: undefined, now: 0 }), "allow");
  assert.equal(guard({ path: SEND, ip: "1.1.1.1", email: "  ", now: 0 }), "allow");
  assert.equal(guard({ path: SEND, ip: "1.1.1.1", email: undefined, now: 0 }), 429);
  assert.equal(guard.byPair.buckets.size + guard.byEmail.buckets.size, 0);
});

test("two IPv6 addresses in one /64 share a key, another /64 does not", () => {
  assert.equal(ipKey("2001:db8:0:1::5"), ipKey("2001:0db8:0000:0001:ffff:1:2:3"));
  assert.notEqual(ipKey("2001:db8:0:1::5"), ipKey("2001:db8:0:2::5"));
  const guard = createOtpGuard(1);
  assert.equal(guard({ path: SEND, ip: "2001:db8:0:1::5", email: "a@x.com", now: 0 }), "allow");
  assert.equal(guard({ path: SEND, ip: "2001:db8:0:1::6", email: "b@x.com", now: 0 }), 429);
  assert.equal(guard({ path: SEND, ip: "2001:db8:0:2::5", email: "c@x.com", now: 0 }), "allow");
});

test("the window resets after it passes", () => {
  const guard = createOtpGuard(10, 1);
  assert.equal(guard({ path: SEND, ip: "1.1.1.1", email: "a@x.com", now: 0 }), "allow");
  assert.equal(guard({ path: SEND, ip: "1.1.1.1", email: "a@x.com", now: OTP_WINDOW_MS - 1 }), 429);
  assert.equal(guard({ path: SEND, ip: "1.1.1.1", email: "a@x.com", now: OTP_WINDOW_MS }), "allow");
});

test("every disabled path is a 404 and other paths are not limited", () => {
  const guard = createOtpGuard(0, 0, 0);
  for (const path of AUTH_DISABLED_PATHS) {
    assert.equal(guard({ path, ip: "1.1.1.1", email: "a@x.com", now: 0 }), 404);
  }
  assert.equal(guard({ path: "/get-session", ip: "1.1.1.1", email: "a@x.com", now: 0 }), "allow");
});

test("lib/auth.ts wires hooks.before to the kc module", () => {
  const auth = read("lib/auth.ts");
  assert.match(auth, /^import \{ kcAuthBefore \} from "@\/kc\/otp-limit";$/m);
  assert.match(auth, /\n {2}hooks: \{\n {4}before: createAuthMiddleware\(async \(ctx\) => \{\n {6}const verdict = kcAuthBefore\(\{/);
  assert.match(auth, /throw new APIError\("TOO_MANY_REQUESTS"\)/);
  assert.match(auth, /throw new APIError\("NOT_FOUND"\)/);
});
