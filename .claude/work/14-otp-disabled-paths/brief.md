# 14. Turn off the email-OTP endpoints the app never uses

## Objective
better-auth answers 404 for every email-OTP endpoint that KC's sign-in does not use and that would let a caller guess a code: `/email-otp/check-verification-otp`, `/email-otp/verify-email`, `/email-otp/request-password-reset`, `/forget-password/email-otp` and `/email-otp/reset-password`. The list is a `kc/` constant, and `lib/auth.ts` passes it as better-auth's top-level `disabledPaths` option. Sending a sign-in code (`/email-otp/send-verification-otp`) and signing in with it (`/sign-in/email-otp`) keep working.

## Read first
- `D:\Dev\htdocs\kc-cms-app\.claude\project.md` (upstream-merge rules, Never list, test conventions)
- `D:\Dev\htdocs\kc-cms-app\kc\BOARD.md`, the **otp-disabled-paths** card under Now: it is the spec
- `D:\Dev\htdocs\kc-cms-app\lib\auth.ts` (the `betterAuth({...})` options, lines 17-25; the `emailOTP` plugin around 165)
- `D:\Dev\htdocs\kc-cms-app\node_modules\better-auth\dist\api\index.mjs` around 164-167 (`disabledPaths` is matched exactly against the path below the auth base path, and answers 404)
- `D:\Dev\htdocs\kc-cms-app\node_modules\better-auth\dist\plugins\email-otp\routes.mjs`, the `createAuthEndpoint("...")` lines (the real path strings)
- `D:\Dev\htdocs\kc-cms-app\kc\auth-ip.ts` and `D:\Dev\htdocs\kc-cms-app\kc\tests\auth-ip.test.ts`: the same shape of change (a `kc/` constant `lib/auth.ts` imports with `@/kc/...`, and a source-reading test of `lib/auth.ts`). Match it.

## Context
- The card names three paths. Two more are added on purpose: `/forget-password/email-otp` is better-auth 1.5.6's deprecated twin of `request-password-reset` (same effect, still routed), and `/email-otp/verify-email` takes a guessable `email-verification` code (KC's `sendVerificationOTP` never emails one, so it can be requested for anyone's address and guessed silently) and sets `emailVerified: true`. The UI uses neither (`components/sign-in.tsx`, `components/invite-sign-in.tsx` call only `sendVerificationOtp` and the sign-in).
- `/email-otp/request-email-change` and `/email-otp/change-email` are left alone: `changeEmail` is not enabled, so they already refuse.
- `disabledPaths` is a top-level better-auth option, beside `baseURL` and `advanced`, not a plugin option.

## Files you may touch
- `D:\Dev\htdocs\kc-cms-app\kc\auth-disabled-paths.ts` (new: the constant, with a short comment saying why)
- `D:\Dev\htdocs\kc-cms-app\kc\tests\auth-disabled-paths.test.ts` (new)
- `D:\Dev\htdocs\kc-cms-app\lib\auth.ts` (one import and one `disabledPaths: <constant>,` line; nothing else)
- `D:\Dev\htdocs\kc-cms-app\.claude\work\14-otp-disabled-paths\result.md` (new)

## Done-test
From the card: the constant's exact list is asserted (the five paths above, in that order), and a source-reading test shows `lib/auth.ts` imports it from `@/kc/auth-disabled-paths` and passes it as the top-level `disabledPaths` option. Also: every path in the list appears as a `createAuthEndpoint("<path>"` string in better-auth's `dist/plugins/email-otp/routes.mjs` (so a rename in an upgrade fails the test instead of silently re-opening the endpoint), and neither `/email-otp/send-verification-otp` nor `/sign-in/email-otp` is in the list.

Then the full suite passes through the runner (`node C:\Users\roban\.claude\bin\project-test.cjs`), and `npx tsc --noEmit && npx eslint kc` exit 0. Mutation check, through the runner so it is on record: drop `/email-otp/check-verification-otp` from the constant, run, name the tests that failed, restore, run again green.

## Boundaries
No commit, no push, no install, nothing outward. No real network calls in tests. `lib/auth.ts` gets the import and the one option line, nothing else changed. Never read or print a key, `.env` or secrets file. `project.md`'s Never list applies.

## Report
Write `result.md` beside this file, under 200 words: files changed, tests added, the mutation result naming the tests that failed, and any call made and why. Say what was not done.
