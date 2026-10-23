# 33. Trust an email only once it is verified

## Resume (2026-10-23)
The code is written and on `wip/email-verified-trust-verified-email` (commit 53ca5b9). Bring its four files into the tree from that branch (`git show wip/email-verified-trust-verified-email:<path> > <path>` for `lib/auth.ts`, `lib/collaborator-access.ts`, `lib/admin.ts` and `kc/tests/email-verified-trust.test.ts`), uncommitted. The mutation check is done and on the runner's record: the coordinator window, on Rob's instruction, broke all three guards and the runner failed exactly the three new tests (228 of 231 on main at be85f08 plus this code), then passed 231 of 231 restored. Do not run it again. Run the done-test once green, add one line to `result.md` saying the mutation came from the coordinator window, and stop.

## Objective
Board card email-verified-trust, from the card 23 audit (latent today, high if another sign-in method is ever added). An email address grants nothing until it is verified: GitHub is no longer a trusted provider for automatic account linking, an unclaimed collaborator invite matches a user by email only when that user's email is verified, and admin access by `ADMIN_EMAILS` needs a verified email too.

## Read first
- `D:\Dev\htdocs\kc-cms-app\.claude\project.md` (risky paths, Never list, relative `.ts` imports in `kc/`)
- `D:\Dev\htdocs\kc-cms-app\.claude\work\31-feature-audit\result.md`
- `D:\Dev\htdocs\kc-cms-app\lib\auth.ts`, `lib\collaborator-access.ts`, `lib\admin.ts`
- Callers of `hasAdminAccess` / `isBootstrapAdminEmail`: `app\(main)\layout.tsx`, `lib\api-repo-context.ts` (check what user object they pass and that it carries `emailVerified`)
- better-auth's account linking in `node_modules/better-auth` (find where `trustedProviders` and `userInfo.emailVerified` decide implicit linking)
- `D:\Dev\htdocs\kc-cms-app\kc\tests\branch-create-gate.test.ts` (style of source tests)

## Start here
- `lib/auth.ts:39`: remove `"github"` from `trustedProviders` (drop the key or leave an empty list). Confirm from better-auth's source that a GitHub sign-in whose primary email is verified (our `getUserInfo` returns `emailVerified` from `/user/emails`) still links to an existing user with that email, and that an unverified one does not. Write what you found in result.md; if linking would break for verified GitHub emails, say so and keep the change anyway only if the source shows verified emails still link.
- `lib/collaborator-access.ts:9-16`, `collaboratorMatchesUser`: the `isNull(userId)` + email branch must also require the user's email to be verified. The function takes `Pick<User, "id" | "email">`; widen it to include `emailVerified` and return just the `userId` match when `emailVerified` is not true. Update `collaboratorMatchesUserForRepo` and every caller (grep the repo) so they pass a user that carries `emailVerified`; if a caller only has id and email, list it in result.md rather than guessing.
- `lib/admin.ts:22-24`: `hasAdminAccess` requires `user.emailVerified === true` as well as the email match; widen its `Pick` to include `emailVerified`.
- New test file `kc/tests/email-verified-trust.test.ts`, source tests reading the three files: no `"github"` in `trustedProviders`; `collaboratorMatchesUser` references `emailVerified` in the email branch; `hasAdminAccess` checks `emailVerified`. If you can pull a pure helper into `kc/` (relative `.ts` imports) to test behaviour instead of source text, do so and add it to the files list in result.md.
- Done-test command: `node C:\Users\roban\.claude\bin\project-test.cjs kc/tests/email-verified-trust.test.ts`

## Files you may touch
- `D:\Dev\htdocs\kc-cms-app\lib\auth.ts` (upstream file, named by the card)
- `D:\Dev\htdocs\kc-cms-app\lib\collaborator-access.ts` (upstream file, named by the card)
- `D:\Dev\htdocs\kc-cms-app\lib\admin.ts` (upstream file, named by the card)
- Callers of `collaboratorMatchesUser`, `collaboratorMatchesUserForRepo` and `hasAdminAccess` only where a type change forces it (smallest edit, name each in result.md)
- `D:\Dev\htdocs\kc-cms-app\kc\email-trust.ts` (new, optional pure helper)
- `D:\Dev\htdocs\kc-cms-app\kc\tests\email-verified-trust.test.ts` (new)
- `D:\Dev\htdocs\kc-cms-app\.claude\work\33-email-verified-trust\result.md` (new)

## Done-test
`node --test kc/tests/email-verified-trust.test.ts` passes and shows the three rules above. Existing tests stay unchanged. Also `npx tsc --noEmit && npx eslint kc` exit 0.

Mutation check, through the runner so it is on record: remove the `emailVerified` check from `hasAdminAccess`, run the done-test command, name the failing tests, restore, run again green. Every run filtered to the test file; never the full suite.

## Context
- Risky path (`lib/auth.ts`, auth and tenancy). Error copy stays as it is; write no new client-facing text.
- No schema change: `userTable.emailVerified` already exists. No migration, no package change.

## Boundaries
No commit, no push, no install, nothing outward. No real network call in tests. Never read or print a secret or `.env`. `project.md`'s Never list applies.

## Report
Write `result.md` beside this file, under 200 words: files changed, tests added, the mutation result naming the failing tests, what better-auth does with an untrusted provider and a verified email (with file and line), and what was not done.
