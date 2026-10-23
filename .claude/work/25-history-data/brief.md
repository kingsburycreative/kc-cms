# 25. History data: site feed and old versions

## Objective
Two data pieces for the History pages (plan card 15). A new GET route `app/api/[owner]/[repo]/[branch]/history/route.ts` returns one site-wide feed of recent saves: it lists commits for each content path in the site's `.pages.yml` (collection and file schema paths), merges them newest first, drops duplicate shas, caps at a limit, drops `.pages.yml` and settings paths for clients, and runs every item through `redactHistory` for clients (installation token). The existing entries route takes an optional `ref` query param to read an old version of a file, and checks it with `refIsOnBranch` before `getContent`, so a sha from another branch cannot be read past the branch lock.

## Read first
- `D:\Dev\htdocs\kc-cms-app\.claude\project.md` (upstream-merge rules, Never list, `kc/` imports use relative `.ts` paths; routes import kc code via `@/kc/...` like the existing ones)
- `D:\Dev\htdocs\kc-cms-app\.claude\work\15-plan-client-experience\plan.md`, card 15 (and cards 01, 02, 17, 18 for context)
- `D:\Dev\htdocs\kc-cms-app\app\api\[owner]\[repo]\[branch]\entries\[path]\history\route.ts` (the pattern to copy: session, getToken, assertBranchAllowed, settings check, redactHistory)
- `D:\Dev\htdocs\kc-cms-app\app\api\[owner]\[repo]\[branch]\entries\[path]\route.ts`
- `D:\Dev\htdocs\kc-cms-app\kc\redact.ts`, `kc\branch-lock-server.ts`, `kc\settings-gate.ts`
- One existing source test for style, e.g. `kc\tests\redact.test.ts` or `kc\tests\settings-gate.test.ts`

## Start here
- Lock helper: `assertBranchAllowed(source, token, owner, repo, branch)` from `@/kc/branch-lock-server`; call it right after `getToken`, as entries history does at line 33.
- Mapper: `redactHistory(commits)` from `@/kc/redact`, applied when `source === "installation"`.
- Entries route `getContent` is at `entries/[path]/route.ts:93-98` with `ref: params.branch`. Add: read `searchParams.get("ref")`; when present, `await refIsOnBranch(...)` must be true (else 404 or 403), then pass `ref` to `getContent` instead of the branch.
- `kc/history/ref-check.ts`: pure `refIsOnBranch(status: string): boolean` true only for `"ahead"` or `"identical"`, plus a thin async helper that calls `octokit.rest.repos.compareCommits({ base: ref, head: branch })` and passes `data.status` to it. Behind or diverged is false.
- `kc/history/site.ts`: pure functions, no network: picking content paths from a config object, `mergeSiteFeed(lists, { limit, source })` (newest first by commit date, dedupe by sha, cap, client filter), so fixtures can test it.
- Done-test command: `node C:\Users\roban\.claude\bin\project-test.cjs kc/tests/history-site.test.ts`

## Files you may touch
- `D:\Dev\htdocs\kc-cms-app\kc\history\site.ts` (new)
- `D:\Dev\htdocs\kc-cms-app\kc\history\ref-check.ts` (new)
- `D:\Dev\htdocs\kc-cms-app\kc\tests\history-site.test.ts` (new)
- `D:\Dev\htdocs\kc-cms-app\kc\tests\fixtures\history\` (new files)
- `D:\Dev\htdocs\kc-cms-app\app\api\[owner]\[repo]\[branch]\history\route.ts` (new)
- `D:\Dev\htdocs\kc-cms-app\app\api\[owner]\[repo]\[branch]\entries\[path]\route.ts` (smallest edit: the ref param and check)
- `D:\Dev\htdocs\kc-cms-app\.claude\work\25-history-data\result.md` (new)

## Done-test
`node --test kc/tests/history-site.test.ts` passes. From fixtures it asserts the site feed merges per-path commit lists newest first, caps at the limit, drops `.pages.yml` and settings paths for clients, and runs every item through card 02's mapper; `refIsOnBranch` accepts only `ahead` or `identical` from a compare, so a sha from another branch cannot be read past card 01's lock; source tests show the new route uses the lock helper and the entries route checks `ref` before `getContent`. Also `npx tsc --noEmit && npx eslint kc` exit 0.

Mutation check, through the runner so it is on record: skip the ref check (make `refIsOnBranch` return true always), run the done-test, name the tests that failed, restore, run again green.

## Boundaries
No commit, no push, no install, nothing outward. Never edit `package.json`, `package-lock.json` or `db/migrations/`. No real network calls in tests (fixtures only). Never read or print a key, `.env` or secrets file. No UI and no client-facing copy beyond short error messages matching the existing routes' tone. Do not run the full suite.

## Report
Write `result.md` beside this file, under 200 words: files changed, tests added, the mutation result naming the tests that failed, any call made and why, and what was not done.
