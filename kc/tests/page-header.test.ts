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

test("PageHeader puts the action after the title, stacked at base and in a row from md", () => {
  const source = read("kc/page-header.tsx");
  const title = source.indexOf("{title}");
  assert.ok(title > 0);
  assert.ok(source.indexOf("{subtitle}") > title);
  assert.ok(source.indexOf("{action}") > source.indexOf("{subtitle}"));
  assert.match(source, /className="flex min-w-0 flex-col [^"]*md:flex-row[^"]*md:justify-between/);
  assert.doesNotMatch(source, /className="flex items-center justify-between/);
  assert.match(source, /subtitle\?: ReactNode/);
});

test("the dashboard passes its publish line and live site link to the header", () => {
  assert.match(read("kc/dashboard.tsx"), /<PageHeader title="Dashboard" subtitle=\{publish\} action=\{liveSite\} \/>/);
});

const pages: [string, string, string][] = [
  ["history", "kc/history/history-view.tsx", "History"],
  ["insights", "app/(main)/[owner]/[repo]/[branch]/insights/page.tsx", "Insights"],
];

for (const [name, file, title] of pages) {
  test(`the ${name} page renders the header component with its title`, () => {
    const source = read(file);
    assert.match(source, /import \{ PageHeader \} from/);
    assert.match(source, new RegExp(`<PageHeader title="${title}"( action=\\{\\w+\\})? />`), file);
  });
}

test("both History views set the header", () => {
  const source = read("kc/history/history-view.tsx");
  assert.equal(source.split('<PageHeader title="History" />').length - 1, 2);
});
