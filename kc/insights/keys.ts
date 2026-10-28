// Saving a site's analytics IDs from the staff strip. The caller is checked
// first, on every write: a GitHub identity, then GitHub itself saying they are
// an admin of the repo, with their own token. Nothing the client sends counts
// as proof. Then each ID must pass the same rule the file reader uses.
import { gaId, pagesProject, siteTag, type InsightsMap, type InsightsSources } from "./map.ts";

export type KeysField = "ga" | "cf" | "pages";
// `saved` is the normalised row on a 200, so the form can show what was stored.
export type SaveResult = { status: 200 | 400 | 403 | 500; message: string; field?: KeysField; saved?: KeysRow };
export type KeysRow = { ga: string | null; cf: string | null; pages: string | null };
export type SaveDeps = {
  user: { id: string; githubUsername?: string | null } | null;
  // KC staff (lib/admin.ts hasAdminAccess), checked before GitHub is asked.
  isStaff: () => boolean;
  userToken: (userId: string) => Promise<string>;
  isAdmin: (token: string, owner: string, repo: string) => Promise<boolean>;
  // Every repo, lower-cased, that already has this value in the table or the file.
  reposUsing: (field: KeysField, value: string) => Promise<string[]>;
  save: (repo: string, row: KeysRow, by: string) => Promise<void>;
};

export const NOT_ADMIN = "Only a GitHub admin of this repository can change these IDs.";
export const NOT_STAFF = "Only KC staff can change these IDs.";
export const TAKEN: Record<KeysField, string> = {
  ga: "Another site already uses this GA4 property ID.",
  cf: "Another site already uses this Cloudflare site tag.",
  pages: "Another site already uses this Pages project.",
};
export const NOT_SAVED = "The IDs weren't saved. Try again.";
export const BAD_ID: Record<KeysField, string> = {
  ga: "The GA4 property ID must be digits only.",
  cf: "The Cloudflare site tag can only use letters, digits, dashes and underscores.",
  pages: "The Pages project can only use lowercase letters, digits and dashes.",
};
const RULES: Record<KeysField, (value: unknown) => string | undefined> = { ga: gaId, cf: siteTag, pages: pagesProject };

export const keysRepo = (owner: string, repo: string) => `${owner}/${repo}`.toLowerCase();

export const savedText = (row: KeysRow) =>
  `Saved. GA4: ${row.ga ?? "none"}, Cloudflare: ${row.cf ?? "none"}, Pages: ${row.pages ?? "none"}.`;

export const rowSources = (row: KeysRow): InsightsSources => ({
  ...(row.ga && { ga: row.ga }),
  ...(row.cf && { cf: row.cf }),
  ...(row.pages && { pages: row.pages }),
});

// Repos in insights.json that already carry this value.
export const fileReposUsing = (map: InsightsMap, field: KeysField, value: string) =>
  Object.entries(map)
    .filter(([, entry]) => (typeof entry === "string" ? { ga: entry } : entry)[field] === value)
    .map(([repo]) => repo.toLowerCase());

export async function saveInsightsKeys(
  input: { owner: string; repo: string } & Partial<Record<KeysField, string>>,
  deps: SaveDeps,
): Promise<SaveResult> {
  const login = deps.user?.githubUsername;
  if (!deps.user || !login) return { status: 403, message: NOT_ADMIN };
  if (!deps.isStaff()) return { status: 403, message: NOT_STAFF };
  let admin = false;
  try {
    admin = await deps.isAdmin(await deps.userToken(deps.user.id), input.owner, input.repo);
  } catch {}
  if (!admin) return { status: 403, message: NOT_ADMIN };

  const row: KeysRow = { ga: null, cf: null, pages: null };
  for (const field of ["ga", "cf", "pages"] as const) {
    const raw = (input[field] ?? "").trim();
    if (raw === "") continue;
    const value = RULES[field](raw);
    if (!value) return { status: 400, message: BAD_ID[field], field };
    row[field] = value;
  }
  // An ID bound to another repo would let this repo read that site's numbers.
  const self = keysRepo(input.owner, input.repo);
  for (const field of ["ga", "cf", "pages"] as const) {
    const value = row[field];
    if (!value) continue;
    let repos: string[];
    try {
      repos = await deps.reposUsing(field, value);
    } catch {
      return { status: 500, message: NOT_SAVED };
    }
    if (repos.some((repo) => repo !== self)) return { status: 400, message: TAKEN[field], field };
  }
  try {
    await deps.save(keysRepo(input.owner, input.repo), row, login);
  } catch {
    return { status: 500, message: NOT_SAVED };
  }
  return { status: 200, message: savedText(row), saved: row };
}
