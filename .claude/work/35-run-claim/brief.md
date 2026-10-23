# 35. A pending action run only claims a GitHub run started right after it

## Objective
Board card run-claim, from the settings-gate audit. An `action_run` row whose dispatch threw, or whose lookup missed, keeps a null `workflowRunId`. A later GET (`actions/route.ts` `syncActionRun`, `actions/[runId]/route.ts`) then attaches the newest unclaimed run on that workflow and ref, checking only a lower time bound (`created_at >= row.createdAt - 30s`). A client holding such a row can claim a run Rob started later, and cancel it as their own without the push check. After this card, a row only matches a run created inside a short window after its `createdAt` (30s before to 2 minutes after), and a row still unmatched past that window is never matched again (it stops looking, and reads as failed/expired rather than pending).

## Read first
- `D:\Dev\htdocs\kc-cms-app\.claude\project.md` (risky paths, Never list, relative `.ts` imports in `kc/`)
- `D:\Dev\htdocs\kc-cms-app\app\api\[owner]\[repo]\[branch]\actions\route.ts` (`findWorkflowRun` ~50, `syncActionRun` ~135, POST ~410-480)
- `D:\Dev\htdocs\kc-cms-app\app\api\[owner]\[repo]\[branch]\actions\[runId]\route.ts` (`findWorkflowRun` ~48, GET and cancel ~160-280, POST ~350)
- `D:\Dev\htdocs\kc-cms-app\db\schema.ts` (actionRunTable: which status values exist; no migration allowed)

## Start here
- New `kc/action-run-claim.ts`, pure, no `@/` imports: `pickWorkflowRun(runs, rowCreatedAtMs, claimedIds)` returns the newest run with `created_at` in `[rowCreatedAtMs - 30_000, rowCreatedAtMs + 120_000]` not in `claimedIds`, else null; `isClaimWindowOver(rowCreatedAtMs, nowMs)` true after `rowCreatedAtMs + 120_000` plus a small slack.
- Both `findWorkflowRun` copies use `pickWorkflowRun`.
- Where a null-`workflowRunId` row is synced: if `isClaimWindowOver`, do not call GitHub; mark the row completed with a failure conclusion using existing status/conclusion values (no new column, no migration), or leave it unchanged and return it, whichever the schema allows without a migration. Cancel on such a row must never reach GitHub with a guessed run id.
- Smallest change in the two upstream route files; logic in `kc/`.
- Done-test command: `node C:\Users\roban\.claude\bin\project-test.cjs kc/tests/action-run-claim.test.ts`

## Files you may touch
- `D:\Dev\htdocs\kc-cms-app\kc\action-run-claim.ts` (new)
- `D:\Dev\htdocs\kc-cms-app\app\api\[owner]\[repo]\[branch]\actions\route.ts` (upstream file, named by the card)
- `D:\Dev\htdocs\kc-cms-app\app\api\[owner]\[repo]\[branch]\actions\[runId]\route.ts` (upstream file, named by the card)
- `D:\Dev\htdocs\kc-cms-app\kc\tests\action-run-claim.test.ts` (new)
- `D:\Dev\htdocs\kc-cms-app\.claude\work\35-run-claim\result.md` (new)

## Done-test
`node --test kc/tests/action-run-claim.test.ts` passes. It shows: `pickWorkflowRun` takes a run 10s after the row, skips one 10 minutes after (the Rob's-later-run case), skips a claimed id, takes the newest of two in the window, returns null on none; `isClaimWindowOver` false at +60s, true at +10 minutes; from the route sources, both routes call `pickWorkflowRun` and the sync paths check `isClaimWindowOver` before looking up. Existing tests unchanged. Also `npx tsc --noEmit && npx eslint kc` exit 0.

Mutation check, through the runner so it is on record: drop the upper bound in `pickWorkflowRun`, run the done-test command, name the failing tests, restore, run again green. Every run filtered to the one test file; never the full suite.

## Context
- Risky path (`app/api/`). No new client-facing text; if a status label is needed, reuse an existing one.

## Boundaries
No commit, no push, no install, nothing outward. No `db/migrations/` or `package.json` change (that parks the card). No real network call in tests. Never read or print a secret or `.env`. `project.md`'s Never list applies.

## Report
Write `result.md` beside this file, under 200 words: files changed, tests added, the mutation result naming the failing tests, how an expired row is now shown, and what was not done.
