// The server-side map of "owner/repo" to its analytics, from the file at env
// KC_INSIGHTS_MAP. A value is a GA4 property ID, or { "ga": "<property id>",
// "cf": "<Cloudflare site tag>", "pages": "<Pages project>" } with each part
// optional; "pages" only rides along with "ga" or "cf". Anything wrong with it
// means "not set up", never a throw.
import { readFileSync } from "node:fs";

export type InsightsSources = { ga?: string; cf?: string; pages?: string };
export type InsightsMap = Record<string, string | InsightsSources>;
type Read = (path: string) => string;

const readText: Read = (path) => readFileSync(path, "utf8");

export const gaId = (id: unknown): string | undefined => {
  const value = typeof id === "number" ? String(id) : id;
  return typeof value === "string" && /^\d+$/.test(value) ? value : undefined;
};
export const siteTag = (tag: unknown): string | undefined =>
  typeof tag === "string" && /^[A-Za-z0-9_-]+$/.test(tag.trim()) ? tag.trim() : undefined;
export const pagesProject = (name: unknown): string | undefined =>
  typeof name === "string" && /^[a-z0-9-]+$/.test(name) ? name : undefined;

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
      const pages = pagesProject((value as Record<string, unknown>).pages);
      if (ga || cf) map[repo.toLowerCase()] = { ...(ga && { ga }), ...(cf && { cf }), ...(pages && { pages }) };
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

// A row in the insights_keys table wins over the file; a missing row, or a table
// that cannot be read, falls back to the file.
export type KeysLookup = (repo: string) => Promise<InsightsSources | null>;
const tableLookup: KeysLookup = async (repo) => (await import("./keys-db.ts")).findInsightsKeys(repo);

export async function insightsSourcesFor(owner: string, repo: string, read: Read = readText, lookup: KeysLookup = tableLookup) {
  let row: InsightsSources | null = null;
  try {
    row = await lookup(`${owner}/${repo}`.toLowerCase());
  } catch {}
  if (row && (row.ga || row.cf)) return row;
  return sourcesFor(loadInsightsMap(process.env.KC_INSIGHTS_MAP, read), owner, repo);
}

export const insightsPropertyFor = async (owner: string, repo: string, read: Read = readText, lookup: KeysLookup = tableLookup) =>
  (await insightsSourcesFor(owner, repo, read, lookup))?.ga ?? null;
