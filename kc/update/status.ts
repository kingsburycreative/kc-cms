// Tells the dashboard whether the running CMS is current with upstream Pages CMS releases.
import { newerRelease, parseVersion, type Release } from "./upstream.ts";

export type VersionStatus =
  | { state: "current" }
  | { state: "behind"; tag: string }
  | { state: "unknown" };

export function versionStatus(running: string, releases: Release[]): VersionStatus {
  if (typeof running !== "string" || !parseVersion(running) || !Array.isArray(releases)) {
    return { state: "unknown" };
  }
  const tag = newerRelease(running, releases);
  return tag ? { state: "behind", tag } : { state: "current" };
}
