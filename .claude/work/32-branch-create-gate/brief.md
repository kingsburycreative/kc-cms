# 32. Branch creation for KC staff only, and one branch decode

## Objective
Board card branch-create-gate, from the card 23 audit. `POST /api/[owner]/[repo]/[branch]/branches` only lets a user create a branch when they are staff on a user token with real push access to the repo, so a client who links a GitHub account can no longer create branches. The branch lock compares the branch exactly as the GitHub calls use it, so a branch literally named `%6Dain` cannot pass as `main`.

## Read first
- `D:\Dev\htdocs\kc-cms-app\.claude\project.md` (risky paths, Never list, relative `.ts` imports in `kc/`)
- `D:\Dev\htdocs\kc-cms-app\.claude\work\31-feature-audit\result.md`
- `D:\Dev\htdocs\kc-cms-app\app\api\[owner]\[repo]\[branch]\branches\route.ts`
- `D:\Dev\htdocs\kc-cms-app\kc\branch-lock.ts`, `kc\branch-lock-server.ts`, `kc\settings-gate-server.ts`
- `D:\Dev\htdocs\kc-cms-app\kc\tests\branch-lock.test.ts`
- `D:\Dev\htdocs\kc-cms-app\app\(main)\[owner]\[repo]\[branch]\layout.tsx` and `lib\api-repo-context.ts` (the other lock callers; check what string they pass)

## Start here
- `branches/route.ts:24` is `if (!user.githubUsername) throw createHttpError("Only KC staff can create branches.", 403);` and stays as the first gate. After `getToken` and the lock (lines 26-28, keep that two-line shape: `branch-lock.test.ts` matches it), add `if (source !== "user") throw createHttpError("Only KC staff can create branches.", 403);` and `await requireOwnRepoPush(user, params.owner, params.repo, "Only KC staff can create branches.");` (from `@/kc/settings-gate-server`, as `actions/route.ts:12,357` does), both before `request.json()` and any octokit call.
- `kc/branch-lock.ts:7-18`: `isBranchAllowed` decodes the branch again. Find out (by reading the callers and Next's params behaviour for this version in `node_modules/next`) whether `params.branch` reaches the API routes encoded or decoded, and make the lock compare the same string the GitHub calls in those routes use, decoding at most once in total. The layout already passes `decodedBranch`. Update the `feat%2Fx` assertion at `branch-lock.test.ts:20` to match, and add a case that `%6Dain` is refused against `main` where it would reach GitHub as a different ref. If you cannot settle what Next passes, say so in result.md and leave the decode as it is rather than guess.
- New test file `kc/tests/branch-create-gate.test.ts`, source tests in the style of `branch-lock.test.ts`.
- Done-test command: `node C:\Users\roban\.claude\bin\project-test.cjs kc/tests/branch-create-gate.test.ts kc/tests/branch-lock.test.ts`

## Files you may touch
- `D:\Dev\htdocs\kc-cms-app\app\api\[owner]\[repo]\[branch]\branches\route.ts` (upstream file, named by the card)
- `D:\Dev\htdocs\kc-cms-app\kc\branch-lock.ts`
- `D:\Dev\htdocs\kc-cms-app\kc\tests\branch-lock.test.ts`
- `D:\Dev\htdocs\kc-cms-app\kc\tests\branch-create-gate.test.ts` (new)
- `D:\Dev\htdocs\kc-cms-app\.claude\work\32-branch-create-gate\result.md` (new)

## Done-test
`node --test kc/tests/branch-create-gate.test.ts kc/tests/branch-lock.test.ts` passes. The new tests show, from the route source, that the branches POST refuses `source !== "user"` and calls `requireOwnRepoPush` with the route's owner and repo, both before `request.json()` and before `createOctokitInstance`, and that the `githubUsername` gate still comes before `getToken`. `branch-lock.test.ts` keeps every existing test (only the `feat%2Fx` line may change, and only if the decode changes) and covers the decode decision. Also `npx tsc --noEmit && npx eslint kc` exit 0.

Mutation check, through the runner so it is on record: delete the `source !== "user"` line, run the done-test command, name the failing tests, restore, run again green. Every run filtered to the two test files; never the full suite.

## Context
- Risky path (`app/api/`). The 403 message is existing copy reused; write no new client-facing text.

## Boundaries
No commit, no push, no install, nothing outward. No real network call in tests. Never read or print a secret or `.env`. `project.md`'s Never list applies.

## Report
Write `result.md` beside this file, under 200 words: files changed, tests added, the mutation result naming the failing tests, what Next passes as `params.branch` and how you know, and what was not done.
