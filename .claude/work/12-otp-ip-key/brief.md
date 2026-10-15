# 12. Sign-in code rate limit keyed on the real client IP

## Objective
better-auth reads the client IP for its rate limiter only from the `x-real-ip` header, which nginx sets from the TCP peer, never from `X-Forwarded-For`, which the caller controls. The header list lives in one `kc/` constant that `lib/auth.ts` imports and passes to better-auth.

## Read first
- `D:\Dev\htdocs\kc-cms-app\.claude\project.md` (upstream-merge rules, Never list, test conventions)
- `D:\Dev\htdocs\kc-cms-app\kc\BOARD.md`, the **otp-ip-key** card under Now: it is the spec
- `D:\Dev\htdocs\kc-cms-app\lib\auth.ts`
- `D:\Dev\htdocs\kc-cms-app\node_modules\better-auth\dist\utils\get-request-ip.mjs` (reads `options.advanced.ipAddress.ipAddressHeaders`, default `["x-forwarded-for"]`, takes the first comma-separated value)
- The rate limiter in `node_modules\better-auth\dist` (find it: where `getIp` is called for rate limiting, and how `rateLimit.enabled` defaults)
- `D:\Dev\htdocs\kc-cms-app\kc\brand.ts` and `D:\Dev\htdocs\kc-cms-app\kc\tests\brand.test.ts` for the style of a `kc/` constant imported by `lib/auth.ts` and its test

## Context
- nginx on the box sets `X-Real-IP $remote_addr` (`D:\Dev\htdocs\kc-cms\server\deploy.sh:142`, read only that line's neighbourhood; do not open any secrets file there).
- Confirm from better-auth 1.5.6 source, not from memory: (a) the option path is `advanced.ipAddress.ipAddressHeaders`; (b) the rate limiter is on in production with no setting in `lib/auth.ts`; (c) what the limiter does when `getIp` returns null (header missing). Put all three in `result.md` with the source file and line. If (b) is false, or (c) means a missing header disables the limit, say so plainly in `result.md`; do not add `rateLimit` settings unless (b) is false, in which case enabling it is in scope.

## Files you may touch
- `D:\Dev\htdocs\kc-cms-app\kc\auth-ip.ts` (new: the constant, no `@/` imports)
- `D:\Dev\htdocs\kc-cms-app\kc\tests\auth-ip.test.ts` (new)
- `D:\Dev\htdocs\kc-cms-app\lib\auth.ts` (import the constant and pass it under `advanced.ipAddress.ipAddressHeaders`; the smallest change)
- `D:\Dev\htdocs\kc-cms-app\.claude\work\12-otp-ip-key\result.md` (new)

## Done-test
From the card: the constant is exactly `["x-real-ip"]`, and `lib/auth.ts` passes it (a source-reading test that fails if `lib/auth.ts` does not import the constant from `kc/` and set it as `ipAddressHeaders` under `advanced.ipAddress`). Add a test that calls better-auth's `getIp` from `node_modules/better-auth/dist/utils/get-request-ip.mjs` with a `Headers` object carrying a spoofed `x-forwarded-for` and a real `x-real-ip`, options built from the constant, and asserts the `x-real-ip` value comes back; skip that one test only if the module cannot be imported under Node's runner, and say so in `result.md`.

Then the full suite passes through the runner (`node C:\Users\roban\.claude\bin\project-test.cjs`), and `npx tsc --noEmit && npx eslint kc` exit 0. Mutation check, through the runner so it is on record: change the constant to `["x-forwarded-for"]` (or remove the option from `lib/auth.ts`), run, name the tests that failed, restore, run again green.

## Boundaries
No commit, no push, no install, nothing outward. No real network calls in tests. `lib/auth.ts` gets the import and the one option, nothing else changed. Never read or print a key, `.env` or secrets file. `project.md`'s Never list applies.

## Report
Write `result.md` beside this file, under 200 words: files changed, tests added, the mutation result naming the tests that failed, and the three source findings (option path, limiter on in production, behaviour with no IP) with file and line. Say what was not done.
