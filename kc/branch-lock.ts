// Clients (installation token) work on the repo's default branch only; KC
// staff (their own user token) work on any branch. Pure: the server side is
// branch-lock-server.ts.

export type TokenSource = "user" | "installation";

// Exact match, no decode: Next 16's route matcher already decodes params once
// (shared/lib/router/utils/route-matcher.js), and the GitHub calls use that string.
export function isBranchAllowed({ source, branch, defaultBranch }: { source: TokenSource; branch: string; defaultBranch: string }): boolean {
  if (source === "user") return true;
  return branch === defaultBranch;
}

// The branch list the picker offers: none for a client.
export function visibleBranches(source: TokenSource, branches: string[] | undefined): string[] {
  return source === "user" ? branches ?? [] : [];
}
