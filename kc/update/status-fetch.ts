// Server fetch of upstream Pages CMS releases. Any failure gives "unknown", one warn line, no throw.
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Release } from "./upstream.ts";
import { versionStatus, type VersionStatus } from "./status.ts";

const RELEASES_URL = "https://api.github.com/repos/hunvreus/pagescms/releases";

type FetchLike = (
  url: string,
  init?: { next?: { revalidate: number } },
) => Promise<{ ok: boolean; json: () => Promise<unknown> }>;

export type StatusDeps = {
  fetchFn?: FetchLike;
  readRunning?: () => Promise<string>;
  warn?: (line: string) => void;
};

async function readPackageVersion(): Promise<string> {
  const raw = await readFile(path.join(process.cwd(), "package.json"), "utf8");
  return (JSON.parse(raw) as { version: string }).version;
}

export async function getVersionStatus(deps: StatusDeps = {}): Promise<VersionStatus> {
  const fetchFn = deps.fetchFn ?? (fetch as unknown as FetchLike);
  const readRunning = deps.readRunning ?? readPackageVersion;
  const warn = deps.warn ?? ((line: string) => console.warn(line));
  const unknown = (reason: string): VersionStatus => {
    warn(`version status unknown: ${reason}`);
    return { state: "unknown" };
  };

  let running: string;
  try {
    running = await readRunning();
  } catch {
    return unknown("running version unreadable");
  }

  let releases: unknown;
  try {
    const res = await fetchFn(RELEASES_URL, { next: { revalidate: 3600 } });
    if (!res.ok) return unknown("releases request refused");
    releases = await res.json();
  } catch {
    return unknown("releases request failed");
  }
  if (!Array.isArray(releases)) return unknown("releases response malformed");

  const status = versionStatus(running, releases as Release[]);
  if (status.state === "unknown") return unknown("running version unparseable");
  return status;
}
