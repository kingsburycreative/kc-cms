import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const FILES = [
  "components/entry/entry.tsx",
  "components/entry/entry-history.tsx",
  "components/collection/collection.tsx",
  "components/media/media-view.tsx",
  "components/empty-create.tsx",
  "fields/core/file/edit-component.tsx",
  "fields/core/image/edit-component.tsx",
  "app/(main)/[owner]/[repo]/[branch]/settings/page.tsx",
  "app/(main)/[owner]/[repo]/[branch]/layout.tsx",
  "app/(main)/[owner]/[repo]/page.tsx",
];

// Count of "/api/" literals recorded before the links were wrapped.
const API_LITERALS = 12;

const PAGE_LINK = /`\/\$\{[^}]*owner[^}]*\}\/\$\{[^}]*repo[^}]*\}/g;

const read = (f: string) => readFileSync(new URL(`../../${f}`, import.meta.url), "utf8");

test("every in-app page link template is wrapped in shortHref", () => {
  let seen = 0;
  for (const file of FILES) {
    const src = read(file);
    for (const m of src.matchAll(PAGE_LINK)) {
      seen++;
      const before = src.slice(0, m.index);
      assert.match(before, /shortHref\(\s*$/, `${file}: unwrapped link near offset ${m.index}`);
    }
  }
  assert.ok(seen > 0);
});

test("files that wrap links import shortHref from the alias", () => {
  for (const file of FILES) {
    const src = read(file);
    if (src.includes("shortHref(")) {
      assert.ok(src.includes('import { shortHref } from "@/kc/short-url";'), file);
    }
  }
});

test("the /api/ literal count is unchanged", () => {
  let n = 0;
  for (const file of FILES) n += read(file).split("/api/").length - 1;
  assert.equal(n, API_LITERALS);
});
