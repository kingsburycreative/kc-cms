# 16. Lock clients to the default branch

## Objective
A client (anyone whose token comes from the GitHub App installation, `source === "installation"` from `getToken`) can read and write only the repo's default branch. Every API route under `app/api/[owner]/[repo]/[branch]/` that gets a token refuses any other branch for them with 403, the branches POST (create a branch) refuses any user without a `githubUsername`, and both repo layouts give a client an empty branch list so the branch picker offers nothing. A user token (`source === "user"`, KC staff) works on any branch as before.

## Read first
- `D:\Dev\htdocs\kc-cms-app\.claude\project.md` (upstream-merge rules, Never list, test conventions: `kc/` imports with relative `.ts` paths)
- `D:\Dev\htdocs\kc-cms-app\.claude\work\15-plan-client-experience\plan.md`, card 01 and note 1 under "Wrong or missing": the spec
- `D:\Dev\htdocs\kc-cms-app\kc\settings-gate.ts`, `kc\settings-gate-server.ts` and `kc\tests\settings-gate.test.ts`: the same shape (a pure `kc/` decision, a server helper, source-walking tests of routes). Match it.

## Start here
- `D:\Dev\htdocs\kc-cms-app\lib\token.ts:22-50`: `getToken(user, owner, repo, verify?)` returns `{ token, source: "user" | "installation" }`.
- `D:\Dev\htdocs\kc-cms-app\lib\github-cache-file.ts:152-215`: `getRepoSnapshot(owner, repo, token)` returns `defaultBranch` (cached), the cheap way to know the default branch.
- `D:\Dev\htdocs\kc-cms-app\lib\api-repo-context.ts:25-47`: `getRepoReadContext` (collections, media, references routes use it): add the lock after `getToken` here.
- Routes calling `getToken` directly: `actions/route.ts` 206 and 355, `actions/[runId]/route.ts` 159 and 252, `branches/route.ts` 24, `entries/[path]/route.ts` 34, `entries/[path]/history/route.ts` 30, `files/[path]/route.ts` 39 and 459, `files/[path]/rename/route.ts` 34. Call the helper right after each.
- `cache/route.ts` uses `requireGithubRepoWriteAccess` (GitHub users only), so it is out of the lock; the walk test should only require the helper where `getToken` or `getRepoReadContext` is called.
- Layouts: `app/(main)/[owner]/[repo]/layout.tsx:33-40` (passes `repoInfo` with `branches` to `RepoProvider`) and `app/(main)/[owner]/[repo]/[branch]/layout.tsx:46`.
- Suggested shape: pure `isBranchAllowed({ source, branch, defaultBranch })` in `kc/branch-lock.ts`, plus a server helper `assertBranchAllowed(source, token, owner, repo, branch)` throwing `createHttpError(..., 403)`. If a server helper needs `@/` imports the runner cannot load, put it in a separate file the test does not import, and list it below as you would (it is listed: `kc/branch-lock-server.ts`).
- Done-test command: `node D:\Dev\htdocs\kc-cms-app\.claude\bin\project-test.cjs kc/tests/branch-lock.test.ts` (check the runner's usage if a filtered run takes a different form).

## Files you may touch
- `D:\Dev\htdocs\kc-cms-app\kc\branch-lock.ts` (new)
- `D:\Dev\htdocs\kc-cms-app\kc\branch-lock-server.ts` (new, only if needed)
- `D:\Dev\htdocs\kc-cms-app\kc\tests\branch-lock.test.ts` (new)
- `D:\Dev\htdocs\kc-cms-app\lib\api-repo-context.ts`
- `D:\Dev\htdocs\kc-cms-app\app\(main)\[owner]\[repo]\layout.tsx`
- `D:\Dev\htdocs\kc-cms-app\app\(main)\[owner]\[repo]\[branch]\layout.tsx`
- `D:\Dev\htdocs\kc-cms-app\app\api\[owner]\[repo]\[branch]\branches\route.ts`
- `D:\Dev\htdocs\kc-cms-app\app\api\[owner]\[repo]\[branch]\entries\[path]\route.ts`
- `D:\Dev\htdocs\kc-cms-app\app\api\[owner]\[repo]\[branch]\entries\[path]\history\route.ts`
- `D:\Dev\htdocs\kc-cms-app\app\api\[owner]\[repo]\[branch]\files\[path]\route.ts`
- `D:\Dev\htdocs\kc-cms-app\app\api\[owner]\[repo]\[branch]\files\[path]\rename\route.ts`
- `D:\Dev\htdocs\kc-cms-app\app\api\[owner]\[repo]\[branch]\actions\route.ts`
- `D:\Dev\htdocs\kc-cms-app\app\api\[owner]\[repo]\[branch]\actions\[runId]\route.ts`
- `D:\Dev\htdocs\kc-cms-app\.claude\work\16-client-branch-lock\result.md` (new)

Upstream files get the smallest hook into `kc/` that works: an import and a call. Existing tests that read these route sources (grep `kc/tests` for the route paths, e.g. settings-gate and media-types tests) must still pass; do not edit them.

## Done-test
From the plan: `node --test kc/tests/branch-lock.test.ts` passes. It asserts the pure decision (installation + default branch passes, installation + other branch refused, user token passes any branch); that every `route.ts` under `app/api/[owner]/[repo]/[branch]/` that calls `getToken` or `getRepoReadContext` also calls the lock helper (found by walking the folder, so a new route without it fails); that the branches POST refuses a user without `githubUsername`; and that both layouts give a client an empty branch list.

Also `npx tsc --noEmit && npx eslint kc` exit 0. Mutation check, through the runner so it is on record: remove the call from the files route, run, name the tests that failed, restore, run again green.

## Boundaries
No commit, no push, no install, nothing outward. No real network calls in tests. Never read or print a key, `.env` or secrets file. `project.md`'s Never list applies. Do not run the full suite.

## Report
Write `result.md` beside this file, under 200 words: files changed, tests added, the mutation result naming the tests that failed, and any call made and why. Say what was not done.
