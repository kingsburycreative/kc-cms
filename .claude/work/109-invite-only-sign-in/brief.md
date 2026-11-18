# 109. Invite-only email sign-in (job: risky)

## Objective
Email-code sign-in only works for an address the CMS already knows: an existing user, or a pending collaborator invite (a `collaborator` row with that email and no `user_id`, or a `collaborator_invite` row). For any other address no code is sent, no user is created, and the sign-in form shows a plain message telling the person to use the address their invite went to. Today anyone can type any address, get a code and end up with an empty account (Kirk, Henike, 2026-11-18).

## Read first
- `D:\Dev\htdocs\kc-cms-app\CLAUDE.md`, `D:\Dev\htdocs\kc-cms-app\.claude\project.md` (upstream-clean rule, Copy rule, Never list)
- `C:/Users/roban/.claude/pm/traps.md`
- `D:\Dev\htdocs\kc-cms-app\lib\auth.ts` (hooks.before at 30-41, emailOTP plugin at 183-207)
- `D:\Dev\htdocs\kc-cms-app\kc\otp-limit.ts` (OTP_PATHS, the pure-guard pattern to copy) and `kc\tests\otp-limit.test.ts`
- `D:\Dev\htdocs\kc-cms-app\lib\collaborator-access.ts` (normalizeEmail, findVerifiedUserByEmail, bindCollaboratorInvitesToUser)
- `D:\Dev\htdocs\kc-cms-app\db\schema.ts:79-120` (collaborator, collaborator_invite)
- `D:\Dev\htdocs\kc-cms-app\components\sign-in.tsx` and `components\invite-sign-in.tsx` (where sendVerificationOtp is called and errors shown)

## Context
Rob, 2026-11-18: "If the email address is not in the system, it needs to say "username or email not found" or whatever so this doesn't happen again." Decided with Rob: the message names the fix ("We don't have that address. Use the one your invite went to." is the intent; final words through the prose skill per project.md). The trade-off is accepted: the message lets someone learn whether an address is a client. Keep the existing rate limits in front of it so it can't be used to sweep addresses quickly.
A new client is invited before their account exists, so a pending invite must still let them in. Match emails case-insensitively with `normalizeEmail` / `lower()` as collaborator-access.ts does.
Out of scope: GitHub sign-in (staff, `?staff=1`), the "Sign in another way" button, Google sign-in (parked by Rob), deleting the stray account Kirk made.

## Start here
- New `kc/invite-gate.ts`: a pure function `inviteGateVerdict({ path, email, knownEmail })` that returns "allow" or "unknown" for the two paths in `OTP_PATHS`, plus a small async `isKnownEmail(email)` that runs the DB lookups (user by lower(email); collaborator with lower(email) and user_id null; collaborator_invite with lower(email)). Relative imports with `.ts` extensions under kc/; the DB lookup may live in lib/ if kc/ can't import `@/db` and still run under node --test, so keep the pure part separate and testable.
- `lib/auth.ts` hooks.before: after `kcAuthBefore`, for OTP paths await the lookup and throw `new APIError("FORBIDDEN", { message, code: "EMAIL_NOT_INVITED" })` (or the closest code better-auth accepts) when unknown. Smallest upstream change: one call into kc/.
- Belt and braces: `emailOTP({ disableSignUp: ... })` cannot be used as-is because invited users need sign-up; check whether better-auth supports it per-call and say in result.md either way.
- Sign-in form shows the error message text instead of moving to the code step.
- Done-test: `node --test kc/tests/invite-gate.test.ts`

## Files you may touch
- `kc/invite-gate.ts` (new)
- `kc/tests/invite-gate.test.ts` (new)
- `lib/auth.ts` (upstream: one hook call)
- `lib/collaborator-access.ts` (upstream: only if the lookup helper belongs there)
- `components/sign-in.tsx` (upstream: show the error)
- `components/invite-sign-in.tsx` (upstream: only if it shares the path)

## Done-test
`node --test kc/tests/invite-gate.test.ts` green. It covers: unknown email on both OTP paths is refused; existing user allowed; pending collaborator row (user_id null) allowed; collaborator_invite row allowed; mixed-case email matches; non-OTP paths untouched. Then the mutation check through `node C:\Users\roban\.claude\bin\project-test.cjs`: make the verdict always "allow", run, name the tests that failed, restore, run green. Plus `npx tsc --noEmit` and `npx eslint kc` clean.

## Boundaries
No commit, no push, no install, nothing outward, no ssh, no DB writes, no real network in tests. No change to package.json or db/migrations. project.md's Never list applies.

## Progress
Keep `progress.md` beside this file from your first step, one line per step that changes a file or finishes a unit of work: done, files, next, anything half-written. Already there? You are resuming: read it and check the disk against it first.

## Report
Write `result.md` beside this file, under 200 words: files changed, tests added, the mutation result naming the tests that failed, the exact message copy and that it went through prose, avoid-ai-writing and humanizer, and whether better-auth's disableSignUp could be used. Say what was not done.
