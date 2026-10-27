export type GithubEmail = { email: string; primary: boolean; verified: boolean };

// The email a GitHub sign-in may use, or null to refuse it. Only an address
// GitHub's emails list marks verified counts; no list means no sign-in.
export function pickVerifiedGithubEmail(
  profileEmail: string | null | undefined,
  emails: unknown,
): string | null {
  if (!Array.isArray(emails)) return null;
  const list = emails as GithubEmail[];
  const chosen =
    (profileEmail ? list.find((entry) => entry?.email === profileEmail) : undefined) ??
    list.find((entry) => entry?.primary);
  if (!chosen || chosen.verified !== true || typeof chosen.email !== "string") return null;
  return chosen.email;
}
