// The site dashboard's data: tiles from the config, recent edits from the
// history feed. Pure: the component reads the config and fetches the feed.

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
  for (const node of flatten(contentNodes(config))) {
    if (!node.name || (node.type !== "file" && node.type !== "collection")) continue;
    tiles.push({
      key: `${node.type}-${node.name}`,
      label: node.label || node.name,
      href: `${base}/${node.type}/${encodeURIComponent(node.name)}`,
      kind: node.type,
    });
  }
  const media = Array.isArray(config?.media) ? config.media[0] : null;
  if (media) {
    tiles.push({
      key: "media",
      label: "Media",
      href: `${base}/media/${encodeURIComponent(media.name || "default")}`,
      kind: "media",
    });
  }
  tiles.push({ key: "history", label: "History", href: `${base}/history`, kind: "history" });
  if (ctx.hasInsights) {
    tiles.push({ key: "insights", label: "Insights", href: `${base}/insights`, kind: "insights" });
  }
  return tiles;
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
