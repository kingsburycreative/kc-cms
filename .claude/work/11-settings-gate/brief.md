# 11. Settings gate

## Objective
Reading, writing, renaming or deleting `.pages.yml`, and reading its history, needs push access to the repo proven with the user's OWN GitHub token, never the installation token. Dispatching a GitHub Actions workflow needs the same. The check lives in one `kc/` helper; each upstream route calls it with a one-line hook.

## Read first
- `D:\Dev\htdocs\kc-cms-app\.claude\project.md` (upstream-merge rules, Never list, test conventions)
- `D:\Dev\htdocs\kc-cms-app\kc\BOARD.md`, the **settings-gate** card under Now: it is the spec, follow every point
- `D:\Dev\htdocs\kc-cms-app\lib\authz-server.ts` (`requireGithubRepoWriteAccess`), `D:\Dev\htdocs\kc-cms-app\lib\authz-shared.ts`, `D:\Dev\htdocs\kc-cms-app\lib\token.ts`
- `D:\Dev\htdocs\kc-cms-app\app\api\[owner]\[repo]\[branch]\files\[path]\route.ts` (settings branch near line 186, delete guard near line 462)
- `D:\Dev\htdocs\kc-cms-app\app\api\[owner]\[repo]\[branch]\files\[path]\rename\route.ts` (settings guard near line 34)
- `D:\Dev\htdocs\kc-cms-app\app\api\[owner]\[repo]\[branch]\entries\[path]\route.ts` (line 44), `...\entries\[path]\history\route.ts` (line 37)
- `D:\Dev\htdocs\kc-cms-app\app\api\[owner]\[repo]\[branch]\actions\route.ts` (POST, line 343 on)
- `D:\Dev\htdocs\kc-cms-app\lib\operations.ts`
- One example of the source-reading test style: `D:\Dev\htdocs\kc-cms-app\kc\tests\insights-route.test.ts`

## Context
- Why: a client (email user) who links a free GitHub account with the same email gets `githubUsername` set; `getToken` then falls back to the installation token, and the settings routes only ask `assertGithubIdentity`. So identity is not enough: push must be proven with `getUserToken` (what `requireGithubRepoWriteAccess` does). A missing or failing user token is a denial.
- Rename and delete of `.pages.yml` are already refused for everyone by `lib/operations.ts` defaults (settings: rename false, delete false). Keep those refusals. Also make sure a rename whose DESTINATION is `.pages.yml` cannot overwrite settings; gate or refuse it. Edit `lib/operations.ts` only if a guard genuinely must change there; it is imported by client components, so it must stay free of server code.
- Split the helper: a pure decision function (no Next, no GitHub, no `@/` imports) that tests import with a relative `.ts` path, and a thin server wrapper that calls `requireGithubRepoWriteAccess` and throws a 403 (`createHttpError`) on denial. The wrapper may use `@/` imports since tests read it as text only.
- Round 2 (added by the coordinator): the rerun route (`actions/[runId]/route.ts`, listed below) POST is a second dispatch path. `intent: "rerun"` and cancelling a run the user did not start both trust `hasGithubIdentity` alone. Gate rerun with the same server helper; cancel of the user's OWN run stays allowed without it, cancel of anyone else's run needs the helper. Add a source-order test for it like the others.
- Keep the error text the routes return today where it makes sense; a denial is 403.

## Files you may touch
- `D:\Dev\htdocs\kc-cms-app\kc\settings-gate.ts` (new: pure decision)
- `D:\Dev\htdocs\kc-cms-app\kc\settings-gate-server.ts` (new: server wrapper)
- `D:\Dev\htdocs\kc-cms-app\kc\tests\settings-gate.test.ts` (new)
- `D:\Dev\htdocs\kc-cms-app\app\api\[owner]\[repo]\[branch]\files\[path]\route.ts`
- `D:\Dev\htdocs\kc-cms-app\app\api\[owner]\[repo]\[branch]\files\[path]\rename\route.ts`
- `D:\Dev\htdocs\kc-cms-app\app\api\[owner]\[repo]\[branch]\entries\[path]\route.ts`
- `D:\Dev\htdocs\kc-cms-app\app\api\[owner]\[repo]\[branch]\entries\[path]\history\route.ts`
- `D:\Dev\htdocs\kc-cms-app\app\api\[owner]\[repo]\[branch]\actions\route.ts`
- `D:\Dev\htdocs\kc-cms-app\app\api\[owner]\[repo]\[branch]\actions\[runId]\route.ts`
- `D:\Dev\htdocs\kc-cms-app\lib\operations.ts` (only if needed, as above)
- `D:\Dev\htdocs\kc-cms-app\.claude\work\11-settings-gate\result.md` (new)

## Done-test
From the card: tests for the helper's decision as a pure function (no identity: denied; identity without push: denied; push: allowed), and a test per route that reads its source and fails if the settings branch or the dispatch can be reached without the helper. Mutation check: remove the call from one route.

Then the full suite passes through the runner (`node C:\Users\roban\.claude\bin\project-test.cjs`), and `npx tsc --noEmit && npx eslint kc` exit 0. Mutation check, through the runner so it is on record: remove the helper call from one route, run, name the tests that failed, restore, run again green.

## Boundaries
No commit, no push, no install, nothing outward. No real network calls in tests. Upstream files get the smallest hook into `kc/` that works, nothing else changed. Do not loosen any existing check; non-settings content editing for email collaborators must keep working exactly as now. Never read or print a key, `.env` or secrets file. `project.md`'s Never list applies.

## Report
Write `result.md` beside this file, under 200 words: files changed, tests added, the mutation result naming the tests that failed, and any call made and why (especially the rename-destination case and the GET dispatch list). Say what was not done.
