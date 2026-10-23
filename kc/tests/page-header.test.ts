import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path: string) => readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");

test("PageHeader sets the repo header and renders nothing itself", () => {
  const source = read("kc/page-header.tsx");
  assert.match(source, /useOptionalRepoHeader\(\{ header \}\)/);
  assert.match(source, /<h1[^>]*>\{title\}<\/h1>/);
  assert.match(source, /return null;/);
});

const pages: [string, string, string][] = [
  ["dashboard", "kc/dashboard.tsx", "Dashboard"],
  ["history", "kc/history/history-view.tsx", "History"],
  ["insights", "app/(main)/[owner]/[repo]/[branch]/insights/page.tsx", "Insights"],
];

for (const [name, file, title] of pages) {
  test(`the ${name} page renders the header component with its title`, () => {
    const source = read(file);
    assert.match(source, /import \{ PageHeader \} from/);
    assert.ok(source.includes(`<PageHeader title="${title}" />`), file);
  });
}

test("both History views set the header", () => {
  const source = read("kc/history/history-view.tsx");
  assert.equal(source.split('<PageHeader title="History" />').length - 1, 2);
});
