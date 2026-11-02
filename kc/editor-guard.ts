// Decisions that keep a client's unsaved text in the entry editor (card 107).

// Text shown when a client leaves a file with unsaved edits.
export const LEAVE_WARNING = "You have changes you haven't saved. Leave this page and lose them?";

// A refetch may replace the form only when nothing is typed and the data differs.
export function shouldResetForm({ isDirty, incoming, current }: {
  isDirty: boolean;
  incoming: unknown;
  current: unknown;
}): boolean {
  if (isDirty) return false;
  return JSON.stringify(incoming) !== JSON.stringify(current);
}

// The SWR cache entry after a save: the saved content under the new sha, so a
// later refetch matches it instead of looking like a change.
export function cacheAfterSave<T extends { sha?: string; contentObject?: unknown }>(
  entry: T,
  saved: unknown,
  sha: string,
): T {
  return { ...entry, sha, contentObject: saved };
}

export function needsLeaveWarning(isDirty: boolean, saving: boolean): boolean {
  return isDirty && !saving;
}

// True for a click on an in-app link that would leave the current page.
export function isLeavingClick(href: string | null, current: string, origin: string): boolean {
  if (!href || href.startsWith("#")) return false;
  try {
    const url = new URL(href, current);
    if (url.origin !== origin) return false;
    const now = new URL(current);
    return url.pathname !== now.pathname || url.search !== now.search;
  } catch {
    return false;
  }
}
