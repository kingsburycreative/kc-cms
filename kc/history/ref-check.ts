// An old version may be read only if its commit is on the branch: the branch
// is "ahead" of it or "identical". Behind or diverged means another branch.

export function refIsOnBranch(status: string | null | undefined): boolean {
  return status === "ahead" || status === "identical";
}

type CompareClient = {
  rest: { repos: { compareCommits: (args: { owner: string; repo: string; base: string; head: string }) => Promise<{ data: { status?: string | null } }> } };
};

export async function refOnBranch(octokit: CompareClient, owner: string, repo: string, branch: string, ref: string): Promise<boolean> {
  try {
    const { data } = await octokit.rest.repos.compareCommits({ owner, repo, base: ref, head: branch });
    return refIsOnBranch(data.status);
  } catch {
    return false;
  }
}
