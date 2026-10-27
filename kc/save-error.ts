// Card 77: a 413 from a save or upload shows a plain message, never the generic one.

export const PAGE_TOO_LARGE = "This page is too large to save in one go. Your changes are still here. Split it into smaller pages, or contact Kingsbury Creative for help.";
export const FILE_TOO_LARGE = "This file is too large to upload. Try a smaller file.";

/** Throws the friendly message when the response is a 413; otherwise does nothing. */
export function throwIfTooLarge(response: Response, kind: "save" | "upload"): void {
  if (response.status === 413) throw new Error(kind === "upload" ? FILE_TOO_LARGE : PAGE_TOO_LARGE);
}
