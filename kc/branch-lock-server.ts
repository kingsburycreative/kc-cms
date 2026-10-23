// Server side of the branch lock. The default branch comes from the cached repo
// snapshot, so a staff request costs nothing and a client request one cached read.
import { getRepoSnapshot } from "@/lib/github-cache-file";
import { createHttpError } from "@/lib/api-error";
import { isBranchAllowed, type TokenSource } from "./branch-lock.ts";

export async function assertBranchAllowed(
  source: TokenSource,
  token: string,
  owner: string,
  repo: string,
  branch: string,
): Promise<void> {
  if (source === "user") return;
  const { defaultBranch } = await getRepoSnapshot(owner, repo, token);
  if (!defaultBranch || !isBranchAllowed({ source, branch, defaultBranch })) {
    throw createHttpError("You can only work on the default branch.", 403);
  }
}
