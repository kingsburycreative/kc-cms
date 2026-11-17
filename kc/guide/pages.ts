import * as placeholder from "./pages/placeholder.ts";

export type GuidePage = {
  title: string;
  // "core" for pages every site shares, otherwise the client's name.
  group: string;
  slug: string;
  // ISO date (YYYY-MM-DD) the page was last checked against the CMS.
  checked: string;
  // Trusted HTML, written in this repo.
  body: string;
};

export const pages: GuidePage[] = [placeholder];

export type PageGroup = { name: string; pages: GuidePage[] };

// Core first, then one group per client, alphabetical. Pages keep their listed order inside a group.
export function groupPages(list: GuidePage[]): PageGroup[] {
  const byName = new Map<string, GuidePage[]>();
  for (const page of list) {
    byName.set(page.group, [...(byName.get(page.group) ?? []), page]);
  }
  const names = [...byName.keys()].sort((a, b) => {
    if (a === "core") return -1;
    if (b === "core") return 1;
    return a.localeCompare(b);
  });
  return names.map((name) => ({ name, pages: byName.get(name) ?? [] }));
}

export function checkPages(list: GuidePage[]): void {
  const seen = new Set<string>();
  for (const page of list) {
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(page.slug) || page.slug === "index") {
      throw new Error(`Bad guide page slug: ${page.slug}`);
    }
    if (seen.has(page.slug)) throw new Error(`Two guide pages share the slug ${page.slug}`);
    seen.add(page.slug);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(page.checked)) {
      throw new Error(`Guide page ${page.slug} needs a checked date as YYYY-MM-DD`);
    }
  }
}
