import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { AUTH_IP_HEADERS } from "../auth-ip.ts";
import { getIP as getIp } from "../../node_modules/better-auth/node_modules/@better-auth/core/dist/utils/ip.mjs";

const read = (path: string) =>
  readFileSync(new URL(`../../${path}`, import.meta.url), "utf8").replace(/\r\n/g, "\n");

test("the client IP comes only from x-real-ip", () => {
  assert.deepEqual(AUTH_IP_HEADERS, ["x-real-ip"]);
});

test("lib/auth.ts passes the kc constant as advanced.ipAddress.ipAddressHeaders", () => {
  const auth = read("lib/auth.ts");
  assert.match(auth, /^import \{ AUTH_IP_HEADERS \} from "@\/kc\/auth-ip";$/m);
  assert.match(auth, /\n {2}advanced: \{\n {4}ipAddress: \{\n {6}ipAddressHeaders: AUTH_IP_HEADERS,\n/);
});

test("better-auth's getIp ignores a spoofed x-forwarded-for", () => {
  const headers = new Headers({
    "x-forwarded-for": "198.51.100.7, 203.0.113.9",
    "x-real-ip": "203.0.113.9",
  });
  const ip = getIp(headers, { advanced: { ipAddress: { ipAddressHeaders: AUTH_IP_HEADERS } } });
  assert.equal(ip, "203.0.113.9");
});
