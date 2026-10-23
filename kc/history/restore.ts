// Restoring an old version only loads its content into the editor. The
// current sha is kept, so the normal save commits it as a new edit.

type EntryLike = { sha?: string; contentObject?: unknown };

export function restoreParam(searchParams: { get(name: string): string | null } | null | undefined): string | null {
  const value = searchParams?.get("restore");
  return value && /^[0-9a-f]{7,40}$/i.test(value) ? value : null;
}

export function restoreState(current: EntryLike, old: EntryLike): { sha: string | undefined; values: unknown } {
  return { sha: current.sha, values: old.contentObject };
}
