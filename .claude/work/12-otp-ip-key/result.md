# 12. otp-ip-key: result

**Files changed:** `kc/auth-ip.ts` (new, `AUTH_IP_HEADERS = ["x-real-ip"]`), `lib/auth.ts` (one import, one `advanced.ipAddress.ipAddressHeaders` block), `kc/tests/auth-ip.test.ts` (new).

**Tests added (3):** the constant is exactly `["x-real-ip"]`; `lib/auth.ts` imports it from `@/kc/auth-ip` and sets it under `advanced.ipAddress`; better-auth's real `getIp` with a spoofed `x-forwarded-for` and a real `x-real-ip` returns the `x-real-ip` value. The module imports fine under Node's runner, nothing skipped.

**Mutation:** constant set to `["x-forwarded-for"]`: "the client IP comes only from x-real-ip" and "better-auth's getIp ignores a spoofed x-forwarded-for" failed. Restored, full suite 101/101 green. `tsc --noEmit` and `eslint kc` exit 0.

**Source findings (better-auth 1.5.6):**
- (a) Option path: `dist/utils/get-request-ip.mjs:9` reads `options.advanced?.ipAddress?.ipAddressHeaders`, default `["x-forwarded-for"]`.
- (b) On in production: `dist/context/create-context.mjs:168` `enabled: options.rateLimit?.enabled ?? isProduction`; `isProduction` is `NODE_ENV === "production"` (`@better-auth/core/dist/env/env-impl.mjs:32`). No `rateLimit` setting added.
- (c) No IP: `dist/api/rate-limiter/index.mjs:108-115` returns null and the limit is **skipped** for that request (warns once). So a missing `x-real-ip` disables the limit. nginx always sets it; anything reaching port 3000 without nginx would be unlimited. Not checked: that the app listens only on 127.0.0.1.
