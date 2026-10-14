// Decides whether upstream Pages CMS has a release newer than the fork.

export type Release = { tag_name: string; draft?: boolean; prerelease?: boolean };

type Version = { major: number; minor: number; patch: number; pre: boolean };

export function parseVersion(tag: string): Version | null {
  const m = /^v?(\d+)\.(\d+)\.(\d+)(-[0-9A-Za-z.-]+)?(\+[0-9A-Za-z.-]+)?$/.exec(tag.trim());
  if (!m) return null;
  return { major: Number(m[1]), minor: Number(m[2]), patch: Number(m[3]), pre: Boolean(m[4]) };
}

// Negative when a < b, zero when equal, positive when a > b. A prerelease ranks below its release.
export function compareVersions(a: string, b: string): number {
  const x = parseVersion(a);
  const y = parseVersion(b);
  if (!x || !y) throw new Error(`Not a version: ${!x ? a : b}`);
  return (
    x.major - y.major ||
    x.minor - y.minor ||
    x.patch - y.patch ||
    (x.pre === y.pre ? 0 : x.pre ? -1 : 1)
  );
}

// The tag of the newest stable upstream release ahead of the fork, or null when there is nothing to do.
export function newerRelease(forkVersion: string, releases: Release[]): string | null {
  let best: string | null = null;
  for (const r of releases) {
    if (r.draft || r.prerelease) continue;
    const v = parseVersion(r.tag_name);
    if (!v || v.pre) continue;
    if (best === null || compareVersions(r.tag_name, best) > 0) best = r.tag_name;
  }
  if (best === null || compareVersions(best, forkVersion) <= 0) return null;
  return best;
}
