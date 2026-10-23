// Clients (installation token) may not delete a single-file entry (schema
// type "file"); collection entries and media stay deletable. Staff (their own
// user token) may delete anything the schema allows.

import type { TokenSource } from "./branch-lock.ts";

export function clientMayDelete({ source, schemaType }: { source: TokenSource; schemaType?: string }): boolean {
  return !(source === "installation" && schemaType === "file");
}

// True when the path is the path of any single-file content schema, whatever
// schema the request names, so a collection whose folder holds that file
// cannot be used to delete or rename it. Slashes at either end are ignored.
const trimSlashes = (path: string) => path.replace(/^\/+|\/+$/g, "");

export function isSingleFilePath(content: ReadonlyArray<{ type?: string; path?: string }> | undefined, path: string): boolean {
  const target = trimSlashes(path);
  return (content ?? []).some((entry) => entry.type === "file" && typeof entry.path === "string" && trimSlashes(entry.path) === target);
}
