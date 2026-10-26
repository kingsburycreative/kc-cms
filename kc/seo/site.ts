import { runChecks } from "./rules.ts";

export const MAX_ENTRIES = 200;

/** Check keys that count toward the score. The rest (answer, grade) are advice. */
const COUNTED = new Set(["title", "description", "h1", "order", "alt"]);
const BODY_KEYS = new Set(["h1", "order", "alt"]);

export type EntryValues = { title?: unknown; description?: unknown; body?: unknown };
export type Finding = { key: string; label: string; message: string };
export type EntryHealth =
  | { status: "notChecked" }
  | { status: "pass" | "fail"; problems: Finding[]; advice: Finding[] };

export type SiteEntry = { name: string; path: string; values: EntryValues };
export type FixItem = {
  title: string;
  path: string;
  name: string;
  firstProblem: string;
  advice: Finding[];
};
export type SiteHealth = {
  checked: number;
  passing: number;
  notChecked: number;
  fix: FixItem[];
};

/** Which of the three SEO fields a collection or file schema has at the top level. */
export function seoTargets(schemaFields: unknown) {
  const names = new Set(
    Array.isArray(schemaFields) ? schemaFields.map((f) => (f as { name?: unknown })?.name) : [],
  );
  return { title: names.has("title"), description: names.has("description"), body: names.has("body") };
}

const asText = (v: unknown) => (typeof v === "string" ? v : "");

export function entryHealth(values: EntryValues): EntryHealth {
  if (typeof values.title !== "string" || typeof values.description !== "string") {
    return { status: "notChecked" };
  }
  const body = asText(values.body);
  const hasBody = body.trim() !== "";
  const results = runChecks({ title: values.title, description: values.description, body });
  const toFinding = (r: (typeof results)[number]): Finding => ({ key: r.key, label: r.label, message: r.message });
  const problems = results
    .filter((r) => !r.ok && COUNTED.has(r.key) && (hasBody || !BODY_KEYS.has(r.key)))
    .map(toFinding);
  const advice = hasBody ? results.filter((r) => !r.ok && !COUNTED.has(r.key)).map(toFinding) : [];
  return { status: problems.length ? "fail" : "pass", problems, advice };
}

export function siteHealth(entries: SiteEntry[], limit: number): SiteHealth {
  let checked = 0;
  let passing = 0;
  let notChecked = 0;
  const failing: { item: FixItem; count: number }[] = [];
  for (const e of entries.slice(0, MAX_ENTRIES)) {
    const h = entryHealth(e.values);
    if (h.status === "notChecked") {
      notChecked++;
      continue;
    }
    checked++;
    if (h.status === "pass") {
      passing++;
      continue;
    }
    failing.push({
      count: h.problems.length,
      item: {
        title: asText(e.values.title),
        path: e.path,
        name: e.name,
        firstProblem: h.problems[0].message,
        advice: h.advice,
      },
    });
  }
  failing.sort((a, b) => b.count - a.count);
  return { checked, passing, notChecked, fix: failing.slice(0, Math.max(0, limit)).map((f) => f.item) };
}
