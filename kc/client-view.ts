import { z } from "zod";
import { shortHref } from "./short-url.ts";

// The optional top-level `kc:` object in .pages.yml. Three keys, nothing else:
// `client` (display name), `site` (public site URL) and `actions` (labels for
// the dashboard's quick actions, by collection name).
export const KcSchema = z
  .object({
    client: z.string({ message: "'client' must be a string." }).optional(),
    site: z.string({ message: "'site' must be a string." }).optional(),
    pagesProject: z.string({ message: "'pagesProject' must be a string." }).optional(),
    actions: z.record(z.string(), z.string({ message: "Each action label must be a string." })).optional(),
  })
  .strict();

export type KcConfig = z.infer<typeof KcSchema>;

// The client's public site, only when it is an https URL. Anything else
// (javascript:, http:, empty, missing, unparseable) gives null, so it never
// reaches an href.
export function siteUrl(kc: { site?: unknown } | null | undefined): string | null {
  const raw = kc?.site;
  if (typeof raw !== "string") return null;
  try {
    const trimmed = raw.trim();
    return new URL(trimmed).protocol === "https:" ? trimmed : null;
  } catch {
    return null;
  }
}

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
    githubLinks: !isClient,
    sidebar: {
      githubLink: !isClient,
      allProjects: !isClient,
      recentVisits: !isClient,
      branchPicker: !isClient,
      about: !isClient,
    },
    settings: { connectGithub: !isClient },
    home: {
      templates: false,
      recentVisits: !isClient,
    },
  };
}

type RepoRef = { owner: string; repo: string; defaultBranch?: string | null };

export function repoHref(r: RepoRef): string {
  return shortHref(`/${r.owner}/${r.repo}/${r.defaultBranch ? encodeURIComponent(r.defaultBranch) : ""}`);
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
