// Text for the "No repositories yet" page: who the person is signed in as and
// what to do if the invitation went to another address. Someone who signs in
// with the wrong address lands on a new, empty account.

export const EMPTY_HOME_HINT = "If your invitation went to a different address, sign out and sign in with that one.";
export const EMPTY_HOME_SIGN_OUT = "Sign out";

// The "signed in as" line, or null when there is no email or name to name.
// The email is what the invitation went to, so it wins over the name.
export function signedInAsLine(user: { email?: string | null; name?: string | null } | null | undefined): string | null {
  const who = (user?.email ?? "").trim() || (user?.name ?? "").trim();
  return who === "" ? null : `You're signed in as ${who}.`;
}
