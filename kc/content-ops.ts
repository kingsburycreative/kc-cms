// Clients (installation token) may not delete a single-file entry (schema
// type "file"); collection entries and media stay deletable. Staff (their own
// user token) may delete anything the schema allows.

import type { TokenSource } from "./branch-lock.ts";

export function clientMayDelete({ source, schemaType }: { source: TokenSource; schemaType?: string }): boolean {
  return !(source === "installation" && schemaType === "file");
}
