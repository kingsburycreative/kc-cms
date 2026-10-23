# 36. OTP sends and sign-ins are counted before they run, without locking a client out

## Objective
Board card otp-atomic-limit. better-auth's limiter checks before the request and counts after it, so a burst of simultaneous OTP sends or code guesses from one IP all get through. After this card a `hooks.before` on better-auth counts first and refuses before the handler runs, on `/email-otp/send-verification-otp` and `/sign-in/email-otp`, and the same hook refuses (404) every path in `kc/auth-disabled-paths.ts` by `ctx.path`. An earlier attempt (branch `wip/otp-atomic-limit-count-first`, commit b87d389) was parked because two audits found an attacker could lock a client out by spending the per-email budget. The design below is decided (Rob's rubric, consensus and security); follow it.

## Design (decided)
1. Per-IP check first (IPv4 as is, IPv6 cut to /64; reuse b87d389's `ipKey`). A refused request returns 429 and touches no other counter.
2. Tight limit, 5 per 10 minutes, keyed on email AND IP together. A refused request touches no further counter.
3. Loose ceiling, 30 per 10 minutes per email across all IPs, stops spread-out guessing.
4. Requests with no email: only the IP counter.
5. In memory on the one process. No Postgres, no migration.
The app listens on 127.0.0.1:3000 only, so the IP header (`AUTH_IP_HEADERS[0]`, x-real-ip) is set by nginx.

## Read first
- `D:\Dev\htdocs\kc-cms-app\.claude\project.md` (risky paths, Never list, relative `.ts` imports in `kc/`)
- `git show b87d389` (the parked attempt: `kc/otp-limit.ts`, its test, the `lib/auth.ts` hook). Start from it.
- `D:\Dev\htdocs\kc-cms-app\lib\auth.ts`, `kc/auth-ip.ts`, `kc/auth-disabled-paths.ts`

## Files you may touch
- `D:\Dev\htdocs\kc-cms-app\kc\otp-limit.ts` (new)
- `D:\Dev\htdocs\kc-cms-app\kc\tests\otp-limit.test.ts` (new)
- `D:\Dev\htdocs\kc-cms-app\lib\auth.ts` (upstream file, named by the card: the hook only)
- `D:\Dev\htdocs\kc-cms-app\.claude\work\36-otp-atomic-limit\result.md` (new)

## Done-test
`node C:\Users\roban\.claude\bin\project-test.cjs kc/tests/otp-limit.test.ts` passes. It shows: the 6th request from one IP for one email in the window is 429 and the counter was bumped before the verdict (simultaneous calls: n+1 synchronous calls give exactly n allows); one IP sending to many emails, then one IP sending to one email past its limit, cannot stop that email getting "allow" from a second IP; the 31st request for an email across 31 IPs is 429; a refused IP request does not change the email counters; every AUTH_DISABLED_PATHS entry gives 404; other paths allow; window expiry resets; IPv6 addresses in one /64 share a key. From the source, `lib/auth.ts` wires the hook in `hooks.before`. Existing tests unchanged. `npx tsc --noEmit && npx eslint kc` exit 0.

Mutation check, through the runner so it is on record: make the per-email ceiling key on email only for the tight limit (the old lockout), run the done-test command, name the failing tests, restore, run green. Every run filtered to the one test file; never the full suite.

## Boundaries
No commit, no push, no install, nothing outward. No `db/migrations/` or `package.json` change. No real network call in tests. Never read or print a secret or `.env`. No new client-facing text (better-auth's own error codes only). `project.md`'s Never list applies.

## Report
Write `result.md` beside this file, under 200 words: files changed, tests added, the mutation result naming the failing tests, and what was not done.
