// The site dashboard's data: tiles from the config, recent edits from the
// history feed. Pure: the component reads the config and fetches the feed.

import { shortHref } from "./short-url.ts";

export type Tile = { key: string; label: string; href: string; kind: "file" | "collection" | "media" | "history" | "insights" };

type Node = { type?: string; name?: string; label?: string; path?: string; items?: Node[] };

export type DashboardContext = { owner: string; repo: string; branch: string; hasInsights?: boolean };

export type FeedItem = {
  sha?: string;
  path?: string;
  date?: string | null;
  authorName?: string | null;
  commit?: { author?: { name?: string | null; date?: string | null } | null } | null;
};

export type RecentEdit = { title: string; date: string | null; authorName: string; path: string };

// Same source the sidebar reads: navigation.content when set, else content.
function contentNodes(config: any): Node[] {
  const navigation = config?.navigation?.content;
  return Array.isArray(navigation) ? navigation : (config?.content ?? []);
}

function flatten(nodes: Node[]): Node[] {
  return nodes.flatMap((node) => (node.type === "group" ? flatten(node.items ?? []) : [node]));
}

export function dashboardTiles(config: any, ctx: DashboardContext): Tile[] {
  const base = `/${ctx.owner}/${ctx.repo}/${encodeURIComponent(ctx.branch)}`;
  const tiles: Tile[] = [];
  const link = (path: string) => shortHref(`${base}${path}`);
  for (const node of flatten(contentNodes(config))) {
    if (!node.name || (node.type !== "file" && node.type !== "collection")) continue;
    tiles.push({
      key: `${node.type}-${node.name}`,
      label: node.label || node.name,
      href: link(`/${node.type}/${encodeURIComponent(node.name)}`),
      kind: node.type,
    });
  }
  const media = Array.isArray(config?.media) ? config.media[0] : null;
  if (media) {
    tiles.push({
      key: "media",
      label: "Media",
      href: link(`/media/${encodeURIComponent(media.name || "default")}`),
      kind: "media",
    });
  }
  tiles.push({ key: "history", label: "History", href: link("/history"), kind: "history" });
  if (ctx.hasInsights) {
    tiles.push({ key: "insights", label: "Insights", href: link("/insights"), kind: "insights" });
  }
  return tiles;
}

export type QuickAction = { key: string; label: string; href: string };

function acceptsPdf(media: any): boolean {
  const extensions = Array.isArray(media?.extensions) ? media.extensions : null;
  const categories = Array.isArray(media?.categories) ? media.categories : null;
  if (!extensions && !categories) return true;
  return !!extensions?.includes("pdf") || !!categories?.includes("document");
}

// One "new entry" link per collection, in config order, then Upload a PDF when
// the media folder takes PDFs. Once kc.actions names any collection, only the
// named ones show. Files are never actions.
export function quickActions(config: any, ctx: DashboardContext): QuickAction[] {
  const base = `/${ctx.owner}/${ctx.repo}/${encodeURIComponent(ctx.branch)}`;
  const link = (path: string) => shortHref(`${base}${path}`);
  const labels: Record<string, string> = config?.kc?.actions ?? {};
  const limited = Object.keys(labels).length > 0;
  const actions: QuickAction[] = [];
  for (const node of flatten(contentNodes(config))) {
    if (!node.name || node.type !== "collection") continue;
    if (limited && !labels[node.name]) continue;
    actions.push({
      key: `new-${node.name}`,
      label: labels[node.name] || `Add to ${node.label || node.name}`,
      href: link(`/collection/${encodeURIComponent(node.name)}/new`),
    });
  }
  const media = Array.isArray(config?.media) ? config.media[0] : null;
  if (media && acceptsPdf(media)) {
    actions.push({ key: "upload-pdf", label: "Upload a PDF", href: link(`/media/${encodeURIComponent(media.name || "default")}`) });
  }
  return actions;
}

function titleFor(path: string, content: Node[]): string {
  const match = content.find((node) => node.path === path);
  if (match) return match.label || match.name || path;
  const file = path.split("/").pop() ?? path;
  return file.replace(/\.[^.]+$/, "");
}

// Title, date, author name and path only. Staff feeds carry raw commits, so
// the name and date are read from either shape and nothing else is copied.
export function recentEdits(items: FeedItem[], limit: number, config?: any): RecentEdit[] {
  const content = flatten(contentNodes(config));
  return (items ?? []).slice(0, Math.max(0, limit)).map((item) => {
    const path = item.path ?? "";
    return {
      title: titleFor(path, content),
      date: item.date ?? item.commit?.author?.date ?? null,
      authorName: item.authorName ?? item.commit?.author?.name ?? "",
      path,
    };
  });
}

// "David Mills" gives "DM", "sam" gives "S", nothing gives "?".
export function initials(name: string | null | undefined): string {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const letters = parts.length === 1 ? parts[0].charAt(0) : parts[0].charAt(0) + parts[parts.length - 1].charAt(0);
  return letters.toUpperCase();
}

export type ChangeVerb = "added" | "updated" | "uploaded" | "changed";

// Pages CMS commit messages start "Create", "Update" or "Upload". Client feeds
// carry no message, so their changes read as "changed".
export function changeVerb(message: string | null | undefined): ChangeVerb {
  const m = (message ?? "").trim().toLowerCase();
  if (m.startsWith("create") || m.startsWith("add")) return "added";
  if (m.startsWith("upload")) return "uploaded";
  if (m.startsWith("update") || m.startsWith("edit")) return "updated";
  return "changed";
}

// "David updated Home" for a single page, "David added an entry in Weekly" for a collection.
export function activitySentence(authorName: string, verb: ChangeVerb, title: string, kind: "file" | "collection" | null): string {
  const who = authorName.trim().split(/\s+/)[0] || "Someone";
  return kind === "collection" ? `${who} ${verb} an entry in ${title}` : `${who} ${verb} ${title}`;
}

export type Activity = { initials: string; sentence: string; date: string | null; path: string };

type ActivityItem = FeedItem & { commit?: { message?: string | null; author?: { name?: string | null; date?: string | null } | null } | null };

// One plain sentence per change. The path is kept for staff; the layout drops it for clients.
export function recentActivity(items: ActivityItem[], limit: number, config?: any): Activity[] {
  const content = flatten(contentNodes(config));
  return recentEdits(items, limit, config).map((edit, i) => {
    const node = content.find((n) => n.path === edit.path);
    const kind = node?.type === "collection" || node?.type === "file" ? node.type : null;
    return {
      initials: initials(edit.authorName),
      sentence: activitySentence(edit.authorName, changeVerb(items[i]?.commit?.message), edit.title, kind),
      date: edit.date,
      path: edit.path,
    };
  });
}

type HealthSchema = { type?: string; name?: string; path?: string; fields?: unknown; list?: unknown; format?: string; delimiters?: unknown; view?: any };
export type HealthReaders = {
  collection: (schema: HealthSchema) => Promise<{ type?: string; path?: string; content?: unknown }[]>;
  file: (schema: HealthSchema) => Promise<string | null>;
  parse: (content: string, schema: HealthSchema) => Record<string, unknown>;
};

// Every entry search health can score: collection files and single-page files
// whose schema has a top-level title and description. A read or parse failure
// skips that entry, never the panel.
export async function healthEntries(content: HealthSchema[], read: HealthReaders) {
  const entries: { name: string; path: string; values: Record<string, unknown> }[] = [];
  for (const schema of content ?? []) {
    if (typeof schema?.path !== "string" || typeof schema.name !== "string") continue;
    if (schema.type !== "collection" && (schema.type !== "file" || schema.list)) continue;
    const targets = new Set(Array.isArray(schema.fields) ? schema.fields.map((f: any) => f?.name) : []);
    if (!targets.has("title") || !targets.has("description")) continue;
    try {
      if (schema.type === "file") {
        const text = await read.file(schema);
        if (typeof text === "string") entries.push({ name: schema.name, path: schema.path, values: read.parse(text, schema) });
        continue;
      }
      for (const file of await read.collection(schema)) {
        if (file.type !== "file" || typeof file.content !== "string" || typeof file.path !== "string") continue;
        try {
          entries.push({ name: schema.name, path: file.path, values: read.parse(file.content, schema) });
        } catch {}
      }
    } catch {}
  }
  return entries;
}
