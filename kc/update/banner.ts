// Finds the open upstream-sync pull request, if any, from GitHub's pulls list.
import { parseVersion, compareVersions } from "./upstream.ts";

export type Pull = { head?: { ref?: unknown }; html_url?: unknown };
export type Banner = { tag: string; url: string };

const PREFIX = "upstream/";
const PULL_URL = "https://github.com/kingsburycreative/kc-cms/pull/";

// With several qualifying PRs, the highest version wins; unparseable tags rank below versions, then compare as text.
function newer(a: string, b: string): boolean {
  const va = parseVersion(a);
  const vb = parseVersion(b);
  if (va && vb) return compareVersions(a, b) > 0;
  if (va || vb) return Boolean(va);
  return a > b;
}

export function pickBanner(pulls: unknown): Banner | null {
  if (!Array.isArray(pulls)) return null;
  let best: Banner | null = null;
  for (const p of pulls as Pull[]) {
    const ref = p?.head?.ref;
    const url = p?.html_url;
    if (typeof ref !== "string" || typeof url !== "string") continue;
    if (!ref.startsWith(PREFIX) || ref.length === PREFIX.length) continue;
    if (!url.startsWith(PULL_URL)) continue;
    const tag = ref.slice(PREFIX.length);
    if (best === null || newer(tag, best.tag)) best = { tag, url };
  }
  return best;
}
