// Initials for an avatar with no picture. A set name gives its initials, an empty name
// gives the first letter of the email. Never a placeholder letter: empty in, empty out.
export function initialFor({
  name,
  email,
}: {
  name?: string | null;
  email?: string | null;
}): string {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  if (parts.length > 1) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return (email ?? "").trim().charAt(0).toUpperCase();
}
