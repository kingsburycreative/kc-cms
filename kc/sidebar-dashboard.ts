// The Dashboard link is current on the branch root only, never on child pages.
export function isDashboardActive(pathname: string, root: string): boolean {
  const trim = (p: string) => (p.length > 1 ? p.replace(/\/+$/, "") : p);
  return trim(pathname) === trim(root);
}
