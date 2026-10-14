# 09. Insights gate

## Objective
Insights (the page and the sidebar item) is shown only to an admin, a GitHub-login user with push permission on the repo, or an email-login collaborator of that exact repo. Everyone else gets "Access denied" and no sidebar item. The decision lives in a pure, tested function in `kc/insights/gate.ts`; city and channel labels are trimmed to 80 characters like page paths.

## Read first
- `D:\Dev\htdocs\kc-cms-app\.claude\project.md` (upstream-merge rules, Never list, test conventions)
- `D:\Dev\htdocs\kc-cms-app\kc\BOARD.md`, the **insights-gate** card under Now: it is the spec, follow every point
- `D:\Dev\htdocs\kc-cms-app\app\(main)\[owner]\[repo]\[branch]\insights\page.tsx` and `D:\Dev\htdocs\kc-cms-app\app\(main)\[owner]\[repo]\[branch]\layout.tsx`
- `D:\Dev\htdocs\kc-cms-app\lib\api-repo-context.ts` (`getRepoReadContext`), `D:\Dev\htdocs\kc-cms-app\lib\admin.ts` (`hasAdminAccess`), and the existing collaborator check they use
- `D:\Dev\htdocs\kc-cms-app\kc\insights\route.ts`, `D:\Dev\htdocs\kc-cms-app\kc\tests\insights-route.test.ts`

## Context
- Why: any GitHub user can sign up, so "can read the repo" lets strangers see a public mapped repo's analytics, and org members with read on every repo see every client's.
- Prefer the push permission from the repo lookup the access check already makes. If `getRepoReadContext` does not expose it, the smallest change is to return it from there (an added field, nothing else changed). Only if that is impossible, one extra GitHub call; say which in result.md.
- `gate.ts` takes plain inputs (is admin, login type, permissions, is collaborator) and returns a boolean; no Next, no GitHub, relative `.ts` imports.

## Files you may touch
- `D:\Dev\htdocs\kc-cms-app\kc\insights\gate.ts` (new)
- `D:\Dev\htdocs\kc-cms-app\kc\insights\route.ts`
- `D:\Dev\htdocs\kc-cms-app\app\(main)\[owner]\[repo]\[branch]\insights\page.tsx`
- `D:\Dev\htdocs\kc-cms-app\app\(main)\[owner]\[repo]\[branch]\layout.tsx`
- `D:\Dev\htdocs\kc-cms-app\lib\api-repo-context.ts` (smallest hook only, as above)
- `D:\Dev\htdocs\kc-cms-app\kc\tests\insights-gate.test.ts` (new)
- `D:\Dev\htdocs\kc-cms-app\kc\tests\insights-route.test.ts`
- `D:\Dev\htdocs\kc-cms-app\.claude\work\09-insights-gate\result.md` (new)

## Done-test
From the card: tests for the gate covering admin (allowed), GitHub user with push (allowed), read-only GitHub user (denied), email collaborator of the repo (allowed), stranger (denied); and tests that cities, channel labels and page paths are each trimmed to 80 characters.

Then the full suite passes through the runner (`node C:\Users\roban\.claude\bin\project-test.cjs`), and `npx tsc --noEmit && npx eslint kc` exit 0. Mutation check, through the runner so it is on record: break the new code on purpose, run, name the tests that failed, restore, run again green.

## Boundaries
No commit, no push, no install, nothing outward. No real network calls in tests. Do not loosen any existing access check for other repo pages; only Insights narrows. Never read or print a key, `.env` or secrets file. `project.md`'s Never list applies.

## Report
Write `result.md` beside this file, under 200 words: files changed, tests added, the mutation result naming the tests that failed, and any call made and why (especially how push permission is obtained). Say what was not done.
