// Who may touch .pages.yml or dispatch a workflow: a GitHub identity AND push
// access proven with the user's own token. The installation token a linked
// client falls back to proves nothing. Pure: the server side is
// settings-gate-server.ts.

export const SETTINGS_PATH = ".pages.yml";

export type PushDenial = "identity" | "push";

// null means allowed.
export function pushDenial({ githubIdentity, push }: { githubIdentity: boolean; push: boolean }): PushDenial | null {
  if (!githubIdentity) return "identity";
  if (!push) return "push";
  return null;
}

// True for any spelling of the root .pages.yml: leading "/", "./", "a/../",
// or percent-encoded.
export function isSettingsPath(path: string | null | undefined): boolean {
  if (typeof path !== "string") return false;
  let decoded = path;
  try {
    decoded = decodeURIComponent(path);
  } catch {
    // Malformed escapes: compare the raw text.
  }
  const segments: string[] = [];
  for (const segment of decoded.split(/[\\/]+/)) {
    if (segment === "" || segment === ".") continue;
    if (segment === "..") segments.pop();
    else segments.push(segment);
  }
  return segments.join("/") === SETTINGS_PATH;
}
