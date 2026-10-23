// Which GitHub run a pending action_run row may claim. A row only matches a
// run created from 30s before to 2 minutes after the row, so a run started
// later (by Rob, say) is never attached to an old unmatched row.

export const CLAIM_BEFORE_MS = 30_000;
export const CLAIM_AFTER_MS = 120_000;
const CLAIM_SLACK_MS = 30_000;

type RunLike = { id: number; created_at: string };

export const pickWorkflowRun = <T extends RunLike>(
  runs: T[],
  rowCreatedAtMs: number,
  claimedIds: Iterable<number>,
): T | null => {
  const claimed = new Set(claimedIds);
  const inWindow = runs.filter((run) => {
    const createdMs = Date.parse(run.created_at);
    return createdMs >= rowCreatedAtMs - CLAIM_BEFORE_MS
      && createdMs <= rowCreatedAtMs + CLAIM_AFTER_MS
      && !claimed.has(run.id);
  });
  inWindow.sort((left, right) => Date.parse(right.created_at) - Date.parse(left.created_at));
  return inWindow[0] ?? null;
};

export const isClaimWindowOver = (rowCreatedAtMs: number, nowMs: number) =>
  nowMs > rowCreatedAtMs + CLAIM_AFTER_MS + CLAIM_SLACK_MS;

// Existing status/conclusion values: an unmatched row past its window reads as a failed run.
export const expiredClaimUpdate = () => ({
  status: "completed",
  conclusion: "failure",
  updatedAt: new Date(),
  completedAt: new Date(),
});
