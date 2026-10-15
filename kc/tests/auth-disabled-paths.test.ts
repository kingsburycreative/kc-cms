import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { AUTH_DISABLED_PATHS } from "../auth-disabled-paths.ts";

const read = (path: string) =>
  readFileSync(new URL(`../../${path}`, import.meta.url), "utf8").replace(/\r\n/g, "\n");

test("the unused email-OTP endpoints are disabled", () => {
  assert.deepEqual(AUTH_DISABLED_PATHS, [
    "/email-otp/check-verification-otp",
    "/email-otp/verify-email",
    "/email-otp/request-password-reset",
    "/forget-password/email-otp",
    "/email-otp/reset-password",
  ]);
});

test("sending a sign-in code and signing in with it stay open", () => {
  assert.ok(!AUTH_DISABLED_PATHS.includes("/email-otp/send-verification-otp"));
  assert.ok(!AUTH_DISABLED_PATHS.includes("/sign-in/email-otp"));
});

test("every disabled path is a real better-auth email-OTP endpoint", () => {
  const routes = read("node_modules/better-auth/dist/plugins/email-otp/routes.mjs");
  for (const path of AUTH_DISABLED_PATHS) {
    assert.ok(routes.includes(`createAuthEndpoint("${path}"`), `${path} is not an endpoint in routes.mjs`);
  }
});

test("lib/auth.ts passes the kc constant as the top-level disabledPaths option", () => {
  const auth = read("lib/auth.ts");
  assert.match(auth, /^import \{ AUTH_DISABLED_PATHS \} from "@\/kc\/auth-disabled-paths";$/m);
  assert.match(auth, /\nexport const auth = betterAuth\(\{\n(?: {2}\S.*\n| {4,}.*\n|\n)*? {2}disabledPaths: AUTH_DISABLED_PATHS,\n/);
});
