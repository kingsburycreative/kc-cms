# 14. otp-disabled-paths: result

## Files changed
- `kc/auth-disabled-paths.ts` (new): `AUTH_DISABLED_PATHS`, the five paths in the brief's order, with a short comment on why.
- `kc/tests/auth-disabled-paths.test.ts` (new): four tests.
- `lib/auth.ts`: one import from `@/kc/auth-disabled-paths`, one top-level `disabledPaths: AUTH_DISABLED_PATHS,` line after `advanced`. Nothing else.

## Tests added
- the exact list, in order
- send-verification-otp and sign-in/email-otp are not in it
- every listed path is a `createAuthEndpoint("<path>"` string in better-auth's `email-otp/routes.mjs`
- `lib/auth.ts` has the import, and `disabledPaths` sits at two-space indent inside `betterAuth({`, before its closing `});`, so it is top-level and not a plugin option

## Checks
Full suite through the runner: 115/115 pass. `npx tsc --noEmit && npx eslint kc` exit 0.

## Mutation
Dropped `/email-otp/check-verification-otp` from the constant. One test failed: "the unused email-OTP endpoints are disabled" (114 pass, 1 fail). Restored, full suite green again.

## Calls made
- Left the array as a plain `string[]`, not `as const`: better-auth types `disabledPaths` as a mutable `string[]`. Same shape as `AUTH_IP_HEADERS`.

## Not done
Nothing left out.
