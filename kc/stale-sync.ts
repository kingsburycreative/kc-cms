// Card 112: an open editor keeps its file version current. Every refresh and
// every stale-version save goes through applyLatest, so the sha never moves
// forward without the client's edits merged onto the version it names.
import { keepUnknownFields, mergeFields } from "./field-merge.ts";
import { isStaleShaResponse } from "./save-error.ts";

export const CHECK_INTERVAL_MS = 60 * 1000;

export type RefreshDecision = "none" | "reload" | "banner";

export function decideRefresh({ currentSha, incomingSha, isDirty }: {
  currentSha: string | undefined;
  incomingSha: string | undefined;
  isDirty: boolean;
}): RefreshDecision {
  if (!incomingSha || incomingSha === currentSha) return "none";
  if (!currentSha) return "reload";
  return isDirty ? "banner" : "reload";
}

export type Latest = { sha: string; content: unknown };

// The client's values laid over the latest file: the new sha, the merged
// values, and the fields both sides changed (the client's text kept).
export function applyLatest({ base, latest, mine }: { base: unknown; latest: Latest; mine: unknown }) {
  const { merged, conflicts } = mergeFields(base, latest.content, mine);
  return { sha: latest.sha, content: keepUnknownFields(latest.content, merged), conflicts };
}

async function messageOf(response: Response): Promise<unknown> {
  try {
    return (await response.clone().json())?.message;
  } catch {
    return undefined;
  }
}

// Saves once; on a stale-version 409 merges onto the latest file and saves once more.
export async function saveWithRetry<C extends Record<string, unknown>>({ sha, content, base, save, loadLatest }: {
  sha: string | undefined;
  content: C;
  base: unknown;
  save: (content: C, sha: string | undefined) => Promise<Response>;
  loadLatest: () => Promise<Latest>;
}) {
  const first = await save(content, sha);
  if (!isStaleShaResponse(first.status, await messageOf(first))) {
    return { response: first, sha, content, conflicts: [] as string[], retried: false };
  }
  const next = applyLatest({ base, latest: await loadLatest(), mine: content });
  const response = await save(next.content as C, next.sha);
  return { response, sha: next.sha, content: next.content as C, conflicts: next.conflicts, retried: true };
}

// Item 7: a tab's field list comes from the .pages.yml it loaded with. When the
// config's sha moves on, the tab takes the new field list; a missing sha on
// either side is "unknown", never "changed".
export function configChanged(currentSha: string | null | undefined, latestSha: string | null | undefined): boolean {
  return !!currentSha && !!latestSha && currentSha !== latestSha;
}

// The new config, or null when the file does not parse cleanly: a broken
// .pages.yml mid-edit keeps the field list the tab already has.
export function reloadedConfig<C extends { sha: string; object: Record<string, unknown> }>(
  config: C,
  sha: string,
  parsed: { errors: unknown[]; object: unknown },
): C | null {
  if (parsed.errors.length > 0 || !parsed.object || typeof parsed.object !== "object") return null;
  return { ...config, sha, object: parsed.object as Record<string, unknown> };
}
