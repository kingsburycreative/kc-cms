import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { AUTH_DISABLED_PATHS } from "../auth-disabled-paths.ts";
import { createOtpGuard, ipKey, emailKey, OTP_WINDOW_MS } from "../otp-limit.ts";

const read = (path: string) =>
  readFileSync(new URL(`../../${path}`, import.meta.url), "utf8").replace(/\r\n/g, "\n");

const SEND = "/email-otp/send-verification-otp";

test("ten sends at one instant from one IP pass and the eleventh is refused", () => {
  const guard = createOtpGuard();
  for (let i = 0; i < 10; i++) {
    assert.equal(guard({ path: SEND, ip: "1.2.3.4", email: `u${i}@x.com`, now: 0 }), "allow");
  }
  assert.equal(guard({ path: SEND, ip: "1.2.3.4", email: "new@x.com", now: 0 }), 429);
});

test("two IPv6 addresses in one /64 share a bucket, another /64 does not", () => {
  assert.equal(ipKey("2001:db8:0:1::5"), ipKey("2001:0db8:0000:0001:ffff:1:2:3"));
  assert.notEqual(ipKey("2001:db8:0:1::5"), ipKey("2001:db8:0:2::5"));
  const guard = createOtpGuard(1, 100);
  assert.equal(guard({ path: SEND, ip: "2001:db8:0:1::5", email: "a@x.com", now: 0 }), "allow");
  assert.equal(guard({ path: SEND, ip: "2001:db8:0:1::6", email: "b@x.com", now: 0 }), 429);
  assert.equal(guard({ path: SEND, ip: "2001:db8:0:2::5", email: "c@x.com", now: 0 }), "allow");
});

test("one email from many IPs is refused past its limit, matched case-blind", () => {
  assert.equal(emailKey("  A@X.com "), "a@x.com");
  const guard = createOtpGuard();
  for (let i = 0; i < 5; i++) {
    assert.equal(guard({ path: "/sign-in/email-otp", ip: `10.0.0.${i}`, email: "A@x.com", now: 0 }), "allow");
  }
  assert.equal(guard({ path: SEND, ip: "10.0.1.1", email: " a@X.COM", now: 0 }), 429);
});

test("an IP over its limit does not consume any email's count", () => {
  const guard = createOtpGuard(1, 1);
  assert.equal(guard({ path: SEND, ip: "6.6.6.6", email: "a@x.com", now: 0 }), "allow");
  for (let i = 0; i < 5; i++) {
    assert.equal(guard({ path: SEND, ip: "6.6.6.6", email: "victim@x.com", now: 0 }), 429);
  }
  assert.equal(guard({ path: SEND, ip: "7.7.7.7", email: "victim@x.com", now: 0 }), "allow");
});

test("the window resets after it passes", () => {
  const guard = createOtpGuard(1, 1);
  assert.equal(guard({ path: SEND, ip: "1.1.1.1", email: "a@x.com", now: 0 }), "allow");
  assert.equal(guard({ path: SEND, ip: "1.1.1.1", email: "a@x.com", now: OTP_WINDOW_MS - 1 }), 429);
  assert.equal(guard({ path: SEND, ip: "1.1.1.1", email: "a@x.com", now: OTP_WINDOW_MS }), "allow");
});

test("every disabled path is a 404 and other paths are not limited", () => {
  const guard = createOtpGuard(0, 0);
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
