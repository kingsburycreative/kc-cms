import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { groupNavigation } from "../sidebar-groups.ts";

const ROOT = new URL("../../", import.meta.url);
const read = (f: string) => readFileSync(new URL(f, ROOT), "utf8");

// Content entries as they come out of a .pages.yml.
const content = [
  { type: "file", name: "home", label: "Home page" },
  { type: "collection", name: "weekly", label: "Weekly" },
  { type: "file", name: "about", label: "About page" },
  { type: "collection", name: "papers", label: "Papers" },
];
const hrefOf = (n: { type: string; name: string }) => `/o/r/main/${n.type}/${n.name}`;

test("files fold under one Pages group after the collections", () => {
  const { nodes } = groupNavigation(content, "/o/r/main", hrefOf);
  assert.deepEqual(nodes.map((n) => n.name), ["weekly", "papers", "pages"]);
  const pages = nodes[2];
  assert.equal(pages.type, "group");
  assert.equal(pages.label, "Pages");
  assert.deepEqual(pages.items?.map((n) => n.name), ["home", "about"]);
  assert.ok(nodes.slice(0, 2).every((n) => n.type === "collection"));
});

test("no files means no Pages group, input untouched", () => {
  const only = content.filter((n) => n.type === "collection");
  const { nodes, pagesOpen } = groupNavigation(only, "/o/r/main", hrefOf);
  assert.deepEqual(nodes, only);
  assert.equal(pagesOpen, false);
});

test("Pages is open on a file entry and closed elsewhere", () => {
  assert.equal(groupNavigation(content, "/o/r/main/file/about", hrefOf).pagesOpen, true);
  assert.equal(groupNavigation(content, "/o/r/main/collection/weekly", hrefOf).pagesOpen, false);
  assert.equal(groupNavigation(content, "/o/r/main/media/default", hrefOf).pagesOpen, false);
});

test("sidebar items are at least 44px tall", () => {
  const src = read("components/ui/sidebar.tsx");
  const def = src.match(/default: "(h-\d+)[ "]/);
  assert.ok(def, "default item size not found");
  assert.ok(Number(def[1].slice(2)) >= 11, `default item is ${def[1]}`);
  const sub = src.match(/aria-disabled:pointer-events-none aria-disabled:opacity-50 \[&>span:last-child\]:truncate [^"]*?flex (h-\d+)/) ||
    src.match(/flex (h-\d+) min-w-0 -translate-x-px/);
  assert.ok(sub, "sub item height not found");
  assert.ok(Number(sub[1].slice(2)) >= 11, `sub item is ${sub[1]}`);
});

test("group disclosure is a button carrying aria-expanded", () => {
  const src = read("components/repo/repo-sidebar.tsx");
  const matches = src.match(/<button type="button" aria-expanded=\{isOpen\}/g) || [];
  assert.equal(matches.length, 2);
  assert.match(src, /groupNavigation\(/);
});
