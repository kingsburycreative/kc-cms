// The site-wide history feed: recent saves across every content path in
// .pages.yml, newest first. Pure: the route fetches, this merges.

import type { TokenSource } from "../branch-lock.ts";
import { redactHistory } from "../redact.ts";
import { isSettingsPath } from "../settings-gate.ts";

type Commit = {
  sha: string;
  parents?: { sha: string }[] | null;
  commit?: { author?: { name?: string | null; date?: string | null } | null } | null;
};

export type PathCommits = { path: string; commits: Commit[] };

// Collection and file schema paths, once each, in config order.
export function contentPaths(config: { content?: { type?: string; path?: string }[] } | null | undefined): string[] {
  const paths: string[] = [];
  for (const entry of config?.content ?? []) {
    if ((entry.type === "collection" || entry.type === "file") && entry.path && !paths.includes(entry.path)) {
      paths.push(entry.path);
    }
  }
  return paths;
}

const dateOf = (item: Commit) => Date.parse(item.commit?.author?.date ?? "") || 0;

export function mergeSiteFeed(lists: PathCommits[], { limit, source }: { limit: number; source: TokenSource }) {
  const client = source === "installation";
  const seen = new Set<string>();
  const merged: { path: string; item: Commit }[] = [];
  for (const list of lists) {
    if (client && isSettingsPath(list.path)) continue;
    for (const item of list.commits) merged.push({ path: list.path, item });
  }
  merged.sort((a, b) => dateOf(b.item) - dateOf(a.item));
  const kept = merged.filter(({ item }) => !seen.has(item.sha) && !!seen.add(item.sha)).slice(0, limit);
  if (!client) return kept.map(({ path, item }) => ({ ...item, path }));
  const redacted = redactHistory(kept.map(({ item }) => item));
  return redacted.map((item, i) => ({ ...item, path: kept[i].path }));
}
