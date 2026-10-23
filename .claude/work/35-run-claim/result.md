# 35 run-claim: result

Files changed: new `kc/action-run-claim.ts` (`pickWorkflowRun`, `isClaimWindowOver`, `expiredClaimUpdate`); both `findWorkflowRun` copies in `actions/route.ts` and `actions/[runId]/route.ts` now call `pickWorkflowRun` (window 30s before to 120s after the row). Both sync paths check `isClaimWindowOver` (120s + 30s slack) before any GitHub lookup.

Expired row: set to `status: "completed"`, `conclusion: "failure"` (existing values, no migration). It reads as a failed run, `canCancel` is false, and cancel still 409s on a null run id, so GitHub never sees a guessed id. `syncActionRun` also now returns a completed null-id row untouched instead of searching.

Tests added: `kc/tests/action-run-claim.test.ts`, 8 tests (window cases, claimed id, newest of two, none, window over, source checks on both routes).

Mutation: dropped the upper bound; failed "skips a run 10 minutes after the row". Restored, green. tsc and `eslint kc` exit 0.

Note: the project runner ignored the file filter and ran the full kc suite each time (228 pass).
