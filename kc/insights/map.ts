// The server-side map of "owner/repo" to GA4 property ID, from the file at env
// KC_INSIGHTS_MAP. Anything wrong with it means "not set up", never a throw.
import { readFileSync } from "node:fs";

export type InsightsMap = Record<string, string>;
type Read = (path: string) => string;

const readText: Read = (path) => readFileSync(path, "utf8");

export function parseInsightsMap(text: string): InsightsMap {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return {};
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) return {};
  const map: InsightsMap = {};
  for (const [repo, id] of Object.entries(data)) {
    const value = typeof id === "number" ? String(id) : id;
    if (typeof value === "string" && /^\d+$/.test(value)) map[repo.toLowerCase()] = value;
  }
  return map;
}

export function loadInsightsMap(path: string | undefined, read: Read = readText): InsightsMap {
  if (!path) return {};
  try {
    return parseInsightsMap(read(path));
  } catch {
    return {};
  }
}

export const propertyFor = (map: InsightsMap, owner: string, repo: string): string | null =>
  map[`${owner}/${repo}`.toLowerCase()] ?? null;

export const insightsPropertyFor = (owner: string, repo: string, read: Read = readText) =>
  propertyFor(loadInsightsMap(process.env.KC_INSIGHTS_MAP, read), owner, repo);
