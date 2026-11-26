// Card 77: a 413 from a save or upload shows a plain message, never the generic one.

export const PAGE_TOO_LARGE = "This page is too large to save in one go. Your changes are still here. Split it into smaller pages, or contact Kingsbury Creative for help.";
export const FILE_TOO_LARGE = "This file is too large to upload. Try a smaller file.";

/** Throws the friendly message when the response is a 413; otherwise does nothing. */
export function throwIfTooLarge(response: Response, kind: "save" | "upload"): void {
  if (response.status === 413) throw new Error(kind === "upload" ? FILE_TOO_LARGE : PAGE_TOO_LARGE);
}

// What a 409 from GitHub's create-or-update-file means. A protected branch is a site
// setting, not a version clash, so it must never read as "File has changed".
// Rulesets answer "Repository rule violations found"; classic branch protection answers
// "Protected branch update failed for refs/heads/<branch>." with errors such as
// "Changes must be made through a pull request." (GitHub REST docs, branch protection).
export type SaveErrorKind = "protected" | "conflict" | "other";

export const HELP_EMAIL = "hello@kingsburycreative.com";

export const SAVE_ERROR_MESSAGES: Record<Exclude<SaveErrorKind, "other">, string> = {
  protected: `Your change couldn't be saved because of a setting on this site. Your text is still on screen, so don't close this page. Email ${HELP_EMAIL} and we'll sort it out.`,
  conflict: "File has changed since you last loaded it. Please refresh the page and try again.",
};

const PROTECTED_PATTERNS = [
  /repository rule violations found/i,
  /protected branch/i,
  /through a pull request/i,
];

// Card 112: what the editor says when a save fails after its own retry, or the sign-in ran out.
export const SAVE_RETRY_FAILED = "This page kept changing while you were editing, so your changes weren't saved. Your text is still here. Copy what you need, reload the page, then try again.";
export const SIGNED_OUT = "You were signed out. Sign in again in a new tab, then press Save.";

// The browser's view of a refused save: a 409 carrying the stale-version message
// is a version clash the editor can merge; the protected-branch 409 is not.
export function isStaleShaResponse(status: unknown, message: unknown): boolean {
  return status === 409 && message === SAVE_ERROR_MESSAGES.conflict;
}

export function classifySaveError(status: unknown, githubMessage: unknown, hadSha: boolean): SaveErrorKind {
  if (status !== 409) return "other";
  const message = typeof githubMessage === "string" ? githubMessage : "";
  if (PROTECTED_PATTERNS.some((pattern) => pattern.test(message))) return "protected";
  return hadSha ? "conflict" : "other";
}
