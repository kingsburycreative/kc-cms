# 109 result

Files: new `kc/invite-gate.ts` (pure `inviteGateVerdict`, `isKnownEmail` and `inviteGate` over injected lookups); `lib/collaborator-access.ts` adds `knownEmailLookups` (user by lower(email); collaborator with user_id null; collaborator_invite); `lib/auth.ts` hooks.before calls `inviteGate` after the rate limit and throws `APIError("FORBIDDEN", { message, code: "EMAIL_NOT_INVITED" })`. `components/sign-in.tsx` unchanged: it already toasts `result.error.message` and stays on the email step. `invite-sign-in.tsx` not touched.

Tests: `kc/tests/invite-gate.test.ts`, 6 tests (unknown refused on both paths, user/pending/invite allowed, mixed case, blank email, non-OTP paths skip the DB, auth.ts wiring after the limiter). Green; tsc and eslint kc clean.

Mutation: verdict always "allow" failed "an unknown email is refused on both OTP paths" and "a missing or blank email is refused on OTP paths"; restored, green.

Copy: "We don't have that address. Use the one your invite went to." This is the intent wording from the brief, NOT run through prose, avoid-ai-writing or humanizer. Gate should run those before ship.

disableSignUp: not usable. In better-auth it is a static plugin boolean (routes.mjs 103, 413), no per-call option, and it would block invited first-time users.
