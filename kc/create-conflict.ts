import { z } from "zod";

export const CreateSchema = z
  .object({
    onConflict: z
      .enum(["rename", "error"], {
        message: "'onConflict' must be either 'rename' or 'error'.",
      })
      .optional(),
  })
  .strict();

export const CREATE_CONFLICT_MESSAGE =
  "A file with this name already exists. Open the existing entry to change it.";

export const createConflictMode = (schema: unknown): "rename" | "error" => {
  const create = (schema as { create?: { onConflict?: unknown } } | null | undefined)?.create;
  return create?.onConflict === "error" ? "error" : "rename";
};

// Extra POST body fields for a save. Only a new entry (no path) in an
// "error" collection asks the server to refuse a duplicate file name.
export const createRequestBody = (opts: {
  path?: string | null;
  schema: unknown;
}): { onConflict?: "error" } => {
  const type = (opts.schema as { type?: unknown } | null | undefined)?.type;
  if (!opts.path && type === "collection" && createConflictMode(opts.schema) === "error") {
    return { onConflict: "error" };
  }
  return {};
};
