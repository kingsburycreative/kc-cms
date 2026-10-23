// Clients (installation token) work on the repo's default branch only; KC
// staff (their own user token) work on any branch. Pure: the server side is
// branch-lock-server.ts.

export type TokenSource = "user" | "installation";

const decode = (branch: string) => {
  try {
    return decodeURIComponent(branch);
  } catch {
    return branch;
  }
};

export function isBranchAllowed({ source, branch, defaultBranch }: { source: TokenSource; branch: string; defaultBranch: string }): boolean {
  if (source === "user") return true;
  return decode(branch) === defaultBranch;
}

// The branch list the picker offers: none for a client.
export function visibleBranches(source: TokenSource, branches: string[] | undefined): string[] {
  return source === "user" ? branches ?? [] : [];
}
