// The optional name KC types when inviting a client. Applied to the user at
// sign-in, but only when their own name is blank.

export const INVITE_NAME_MAX = 80;
export const INVITE_NAME_ERROR = "Keep the name to one line of 80 characters or fewer.";

// Trimmed name, null when empty. Throws on over 80 characters or a control character.
export function cleanInviteName(raw: unknown): string | null {
  const value = typeof raw === "string" ? raw.trim() : "";
  if (value === "") return null;
  if (value.length > INVITE_NAME_MAX || /[\u0000-\u001f\u007f]/.test(value)) {
    throw new Error(INVITE_NAME_ERROR);
  }
  return value;
}

// The name to write on the user, or null to leave their name alone.
export function nameToApply(current: string | null | undefined, invited: string | null | undefined): string | null {
  if ((current ?? "").trim() !== "") return null;
  try {
    return cleanInviteName(invited);
  } catch {
    return null;
  }
}
