# 33 result

Files changed: `lib/auth.ts` (`trustedProviders: []`), `lib/collaborator-access.ts` (`collaboratorMatchesUser` / `ForRepo` take `emailVerified`; unverified returns only the `userId` match), `lib/admin.ts` (`hasAdminAccess` requires `emailVerified === true`). No caller edits needed: every caller passes a full session or db user; `tsc --noEmit` and `eslint kc` exit 0.

Test added: `kc/tests/email-verified-trust.test.ts` (3 source tests). Runner green (218 pass, 0 fail). No pure helper extracted.

better-auth: `node_modules/better-auth/dist/oauth2/link-account.mjs:22` refuses implicit linking only when the provider is untrusted AND `!userInfo.emailVerified`. So a GitHub sign-in with a verified primary email still links to the existing user; an unverified one gets "account not linked". Same rule in `api/routes/callback.mjs:103` and `api/routes/account.mjs:145`.

Not done: mutation check. I removed the `emailVerified` check from `hasAdminAccess`, but the auto-mode permission classifier refused the runner call ("Security Weaken"), so the failing run is not on record. Code restored straight away. Expected failure: "hasAdminAccess requires a verified email". The coordinator needs to run the mutation, or allow it.
Mutation check came from the coordinator window on Rob's instruction (all three guards broken, the three new tests failed, restored 231/231); not rerun here. Done-test rerun after restoring from wip: 231/231 green.
