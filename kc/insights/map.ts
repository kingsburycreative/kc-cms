// The server-side map of "owner/repo" to its analytics, from the file at env
// KC_INSIGHTS_MAP. A value is a GA4 property ID, or { "ga": "<property id>",
// "cf": "<Cloudflare site tag>" } with either half optional. Anything wrong with
// it means "not set up", never a throw.
import { readFileSync } from "node:fs";

export type InsightsSources = { ga?: string; cf?: string };
export type InsightsMap = Record<string, string | InsightsSources>;
type Read = (path: string) => string;

const readText: Read = (path) => readFileSync(path, "utf8");

const gaId = (id: unknown): string | undefined => {
  const value = typeof id === "number" ? String(id) : id;
  return typeof value === "string" && /^\d+$/.test(value) ? value : undefined;
};
const siteTag = (tag: unknown): string | undefined =>
  typeof tag === "string" && tag.trim() !== "" ? tag.trim() : undefined;

export function parseInsightsMap(text: string): InsightsMap {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return {};
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) return {};
  const map: InsightsMap = {};
  for (const [repo, value] of Object.entries(data)) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      const ga = gaId((value as Record<string, unknown>).ga);
      const cf = siteTag((value as Record<string, unknown>).cf);
      if (ga || cf) map[repo.toLowerCase()] = { ...(ga && { ga }), ...(cf && { cf }) };
      continue;
    }
    const ga = gaId(value);
    if (ga) map[repo.toLowerCase()] = ga;
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

export function sourcesFor(map: InsightsMap, owner: string, repo: string): InsightsSources | null {
  const value = map[`${owner}/${repo}`.toLowerCase()];
  if (value === undefined) return null;
  return typeof value === "string" ? { ga: value } : value;
}

export const propertyFor = (map: InsightsMap, owner: string, repo: string): string | null =>
  sourcesFor(map, owner, repo)?.ga ?? null;

export const insightsPropertyFor = (owner: string, repo: string, read: Read = readText) =>
  propertyFor(loadInsightsMap(process.env.KC_INSIGHTS_MAP, read), owner, repo);

export const insightsSourcesFor = (owner: string, repo: string, read: Read = readText) =>
  sourcesFor(loadInsightsMap(process.env.KC_INSIGHTS_MAP, read), owner, repo);
