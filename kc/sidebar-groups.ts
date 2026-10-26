export type NavNode = {
  type: string;
  name: string;
  label?: string;
  items?: NavNode[];
};

export const PAGES_LABEL = "Pages";
export const PAGES_NAME = "pages";

/**
 * Folds every top-level `type: file` entry under one "Pages" group placed
 * after the collections, groups and anything else. `pagesOpen` is true only
 * when the current path is one of the folded files.
 */
export function groupNavigation<T extends NavNode>(
  nodes: T[],
  pathname: string,
  hrefOf: (node: T) => string,
): { nodes: NavNode[]; pagesOpen: boolean } {
  const files = nodes.filter((n) => n.type === "file");
  if (files.length === 0) return { nodes, pagesOpen: false };

  const rest = nodes.filter((n) => n.type !== "file");
  const pagesOpen = files.some((n) => {
    const href = hrefOf(n);
    return pathname === href || pathname.startsWith(`${href}/`);
  });

  return {
    nodes: [...rest, { type: "group", name: PAGES_NAME, label: PAGES_LABEL, items: files }],
    pagesOpen,
  };
}
