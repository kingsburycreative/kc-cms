// What a client (installation token) sees of commit history and action runs:
// no emails, GitHub logins, avatars or GitHub links. KC staff see it all.

import type { TokenSource } from "./branch-lock.ts";

export type RedactedCommit = {
  sha: string;
  parentSha: string | null;
  date: string | null;
  authorName: string;
};

type Commit = {
  sha: string;
  parents?: { sha: string }[] | null;
  commit?: { author?: { name?: string | null; date?: string | null } | null } | null;
};

// An email-shaped name keeps only the part before "@".
export function nameFromAuthor(name: string | null | undefined): string {
  const value = (name ?? "").trim();
  const at = value.indexOf("@");
  return at === -1 ? value : value.slice(0, at);
}

export function redactHistory(commits: Commit[]): RedactedCommit[] {
  return commits.map((item) => ({
    sha: item.sha,
    parentSha: item.parents?.[0]?.sha ?? null,
    date: item.commit?.author?.date ?? null,
    authorName: nameFromAuthor(item.commit?.author?.name),
  }));
}

export function redactActionRun<T extends Record<string, unknown>>(run: T): T {
  return {
    ...run,
    triggeredByName: nameFromAuthor(run.triggeredByName as string | null | undefined) || null,
    triggeredByEmail: null,
    triggeredByGithubUsername: null,
    triggeredByImage: null,
    htmlUrl: null,
  };
}

export function forSource<T extends Record<string, unknown>>(source: TokenSource, run: T): T {
  return source === "installation" ? redactActionRun(run) : run;
}
