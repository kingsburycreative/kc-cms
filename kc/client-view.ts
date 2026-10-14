import { z } from "zod";

// The optional top-level `kc:` object in .pages.yml. One key, nothing else.
export const KcSchema = z
  .object({
    client: z.string({ message: "'client' must be a string." }).optional(),
  })
  .strict();

export type KcConfig = z.infer<typeof KcSchema>;

// "henike-tree-service" gives "Henike Tree Service".
export function repoDisplayName(repo: string): string {
  return repo
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function clientName(kc: { client?: string } | null | undefined, repo: string): string {
  const named = kc?.client?.trim();
  return named ? named : repoDisplayName(repo);
}

export function dashboardName(kc: { client?: string } | null | undefined, repo: string): string {
  return `${clientName(kc, repo)} Dashboard`;
}

// Which pieces of the UI a user sees. A client is a user without a GitHub identity.
// This shapes the screen only; the server still decides who can open what.
export function viewFor(isClient: boolean) {
  return {
    sidebar: {
      githubLink: !isClient,
      allProjects: !isClient,
      recentVisits: !isClient,
      branchPicker: !isClient,
      about: !isClient,
    },
    home: {
      templates: false,
      recentVisits: !isClient,
    },
  };
}

type RepoRef = { owner: string; repo: string; defaultBranch?: string | null };

export function repoHref(r: RepoRef): string {
  return `/${r.owner}/${r.repo}/${r.defaultBranch ? encodeURIComponent(r.defaultBranch) : ""}`;
}

// A client with exactly one repo, and no search typed, goes straight to its dashboard.
export function soleRepoRedirect(
  isClient: boolean,
  keyword: string,
  repos: RepoRef[] | null,
): string | null {
  if (!isClient || keyword.trim() !== "" || !repos || repos.length !== 1) return null;
  return repoHref(repos[0]);
}

// What the list shows for a repo: Rob sees the repo name, a client sees the dashboard name.
export function repoListLabel(isClient: boolean, repo: string): string {
  return isClient ? dashboardName(undefined, repo) : repo;
}

// The tab title for a client inside a repo; null means "use the normal page title".
export function documentTitleFor(a: {
  config: { repo: string; object?: unknown } | null;
  isClient: boolean;
}): string | null {
  if (!a.config || !a.isClient) return null;
  const kc = (a.config.object as { kc?: { client?: string } } | null | undefined)?.kc;
  return dashboardName(kc, a.config.repo);
}
