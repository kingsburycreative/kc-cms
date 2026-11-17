import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, describe, it } from "node:test";
import { build } from "../guide/build.ts";
import { groupPages, type GuidePage } from "../guide/pages.ts";

const root = join(import.meta.dirname, "..", "..");
const version = JSON.parse(readFileSync(join(root, "package.json"), "utf8")).version as string;
const NOINDEX = '<meta name="robots" content="noindex, nofollow">';

describe("guide build", () => {
  let out: string;
  before(() => {
    out = mkdtempSync(join(tmpdir(), "kc-guide-"));
    // A leftover file from an earlier build must not survive the next one.
    writeFileSync(join(out, "stale.html"), "old");
    build(out);
  });
  after(() => rmSync(out, { recursive: true, force: true }));

  const read = (name: string) => readFileSync(join(out, name), "utf8");

  it("writes the index and the placeholder page", () => {
    assert.ok(existsSync(join(out, "index.html")));
    assert.ok(existsSync(join(out, "sample.html")));
    assert.ok(existsSync(join(out, "style.css")));
  });

  it("empties the out folder first", () => {
    assert.equal(existsSync(join(out, "stale.html")), false);
  });

  it("stamps the page with the package.json version", () => {
    assert.match(read("sample.html"), new RegExp(`Checked on KC CMS ${version.replace(/[+.]/g, "\\$&")}, November 17, 2026`));
    assert.ok(read("index.html").includes(version));
  });

  it("marks every page noindex", () => {
    assert.ok(read("index.html").includes(NOINDEX));
    assert.ok(read("sample.html").includes(NOINDEX));
  });

  it("disallows all crawlers in robots.txt", () => {
    assert.match(read("robots.txt"), /^User-agent: \*\r?\nDisallow: \/\r?\n?$/);
  });

  it("sets the X-Robots-Tag header in .htaccess", () => {
    assert.ok(read(".htaccess").includes('Header set X-Robots-Tag "noindex, nofollow"'));
  });

  it("needs no script to read a page", () => {
    assert.equal(/<script/i.test(read("sample.html")), false);
  });

  it("refuses to empty a folder that holds the guide source", () => {
    assert.throws(() => build(join(root, "kc")), /guide source/);
  });
});

describe("page groups", () => {
  const page = (slug: string, group: string): GuidePage => ({ title: slug, group, slug, checked: "2026-11-17", body: "" });

  it("lists core first, then clients in name order", () => {
    const groups = groupPages([page("a", "henike"), page("b", "besciworks"), page("c", "core")]);
    assert.deepEqual(groups.map((g) => g.name), ["core", "besciworks", "henike"]);
  });
});
