import { OTP_PATHS, emailKey } from "./otp-limit.ts";

// Email-code sign-in is invite-only: an address the CMS does not know (no user,
// no pending collaborator row, no collaborator_invite) gets no code and no account.
export const NOT_INVITED_CODE = "EMAIL_NOT_INVITED";
export const NOT_INVITED_MESSAGE = "We don't have that address. Use the one your invite went to.";

export function inviteGateVerdict(req: { path: string; email: unknown; knownEmail: boolean }): "allow" | "unknown" {
  if (!OTP_PATHS.includes(req.path)) return "allow";
  return req.knownEmail && emailKey(req.email) !== null ? "allow" : "unknown";
}

// Each lookup gets the trimmed, lower-cased address and answers whether a row matches it.
export type KnownEmailLookups = {
  user: (email: string) => Promise<boolean>;
  pendingCollaborator: (email: string) => Promise<boolean>;
  invite: (email: string) => Promise<boolean>;
};

export async function isKnownEmail(email: unknown, lookups: KnownEmailLookups): Promise<boolean> {
  const key = emailKey(email);
  if (key === null) return false;
  return (await lookups.user(key)) || (await lookups.pendingCollaborator(key)) || (await lookups.invite(key));
}

export async function inviteGate(
  req: { path: string; email: unknown },
  lookups: KnownEmailLookups,
): Promise<"allow" | "unknown"> {
  if (!OTP_PATHS.includes(req.path)) return "allow";
  return inviteGateVerdict({ ...req, knownEmail: await isKnownEmail(req.email, lookups) });
}
