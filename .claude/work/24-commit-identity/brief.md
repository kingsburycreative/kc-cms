# 24. Commits carry the editor's name

## Objective
Every save in the CMS today is authored by the GitHub App bot unless a site's `.pages.yml` sets `settings.commit.identity: user` (`lib/commit-message.ts`, `resolveCommitIdentity`). Flip KC's default to the signed-in user, in code, so a new client needs no config step. New pure module `kc/commit-identity.ts` exports `KC_DEFAULT_COMMIT_IDENTITY = "user"` and `kcCommitIdentity(configured: unknown): "app" | "user"` (returns `"app"` only when `configured === "app"`, `"user"` when `configured === "user"`, otherwise the default). `resolveCommitIdentity` keeps its signature and behaviour for an explicit override (schema `identity: app` or `user` still wins), and otherwise returns `kcCommitIdentity(configObject?.settings?.commit?.identity)`. The routes that call it already fall back to the app when the user has no email; leave them alone.

## Read first
- `D:\Dev\htdocs\kc-cms-app\.claude\project.md` (upstream-merge rules, Never list, `kc/` imports use relative `.ts` paths)
- `D:\Dev\htdocs\kc-cms-app\.claude\work\15-plan-client-experience\plan.md`, card 14 and finding 5
- `D:\Dev\htdocs\kc-cms-app\lib\commit-message.ts`
- `D:\Dev\htdocs\kc-cms-app\app\api\[owner]\[repo]\[branch]\files\[path]\route.ts` around lines 201-213 (read only)

## Files you may touch
- `D:\Dev\htdocs\kc-cms-app\kc\commit-identity.ts` (new)
- `D:\Dev\htdocs\kc-cms-app\kc\tests\commit-identity.test.ts` (new)
- `D:\Dev\htdocs\kc-cms-app\lib\commit-message.ts` (smallest edit: import from `@/kc/commit-identity` and use it in `resolveCommitIdentity`)
- `D:\Dev\htdocs\kc-cms-app\.claude\work\24-commit-identity\result.md` (new)

## Done-test
`node --test kc/tests/commit-identity.test.ts` passes, run through `node C:\Users\roban\.claude\bin\project-test.cjs` with that file. Unit tests on `kcCommitIdentity`: undefined, null, `""`, `"bogus"` give `"user"`; `"app"` gives `"app"`; `"user"` gives `"user"`. Source tests on `lib/commit-message.ts`: it imports from the kc module, `resolveCommitIdentity` takes its default from `kcCommitIdentity`, the override branch for `"app"`/`"user"` is still there, and the old `: "app"` fallback is gone. Also `npx tsc --noEmit && npx eslint kc` exit 0.

Mutation check, through the runner so it is on record: make `kcCommitIdentity` default to `"app"`, run the done-test, name the tests that failed, restore, run again green.

## Boundaries
No commit, no push, no install, nothing outward. Never edit `package.json` or `package-lock.json`. No real network calls in tests. Never read or print a key, `.env` or secrets file. No client-facing copy in this card. Do not run the full suite.

## Report
Write `result.md` beside this file, under 200 words: files changed, tests added, the mutation result naming the tests that failed, any call made and why, and what was not done.
