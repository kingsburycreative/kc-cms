import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, describe, it } from "node:test";
import { build } from "../guide/build.ts";
import { groupPages, pages as realPages, type GuidePage } from "../guide/pages.ts";

const root = join(import.meta.dirname, "..", "..");
const guideDir = join(root, "kc", "guide");
const version = JSON.parse(readFileSync(join(root, "package.json"), "utf8")).version as string;
const NOINDEX = '<meta name="robots" content="noindex, nofollow">';

const sample = (slug: string, group = "core", extra: Partial<GuidePage> = {}): GuidePage => ({
  title: `Title ${slug}`,
  group,
  slug,
  checked: "2026-11-17",
  body: `<p>Body of ${slug}</p><h2>First part</h2><p>One.</p><h2>Second part</h2><p>Two.</p>`,
  approved: true,
  ...extra,
});

// A colour in any form, or a font family, written in source. Only tokens.css may hold these.
const RAW_COLOUR = /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/;
const RAW_FONT = /font-family/i;
// A link to "#add-a-line" looks like a hex colour to the pattern above; a page anchor and a character reference are not colours.
const withoutAnchors = (html: string) => html.replace(/(href|id)="#?[^"]*"/g, "").replace(/&#\d+;/g, "");

describe("guide build", () => {
  const list = [sample("core-one"), sample("module-two", "modules")];
  let out: string;
  before(() => {
    out = mkdtempSync(join(tmpdir(), "kc-guide-"));
    // A leftover file from an earlier build must not survive the next one.
    writeFileSync(join(out, "stale.html"), "old");
    build(out, list);
  });
  after(() => rmSync(out, { recursive: true, force: true }));

  const read = (name: string) => readFileSync(join(out, name), "utf8");
  const built = () => ["index.html", ...list.map((page) => `${page.slug}.html`)];

  it("writes the index, the pages, the tokens, the styles, the search and the fonts", () => {
    for (const file of ["index.html", "core-one.html", "module-two.html", "tokens.css", "style.css", "search.js", "search-index.js"]) {
      assert.ok(existsSync(join(out, file)), file);
    }
    const fonts = readdirSync(join(out, "fonts"));
    assert.ok(fonts.some((f) => f.startsWith("inter-")) && fonts.some((f) => f.startsWith("jetbrains-mono-")));
    assert.ok(fonts.every((f) => f.endsWith(".woff2")));
  });

  it("empties the out folder first", () => {
    assert.equal(existsSync(join(out, "stale.html")), false);
  });

  it("stamps the page with the package.json version", () => {
    assert.match(read("core-one.html"), new RegExp(`Checked on KC CMS ${version.replace(/[+.]/g, "\\$&")}, November 17, 2026`));
    assert.ok(read("index.html").includes(version));
  });

  it("marks every page noindex", () => {
    for (const file of built()) assert.ok(read(file).includes(NOINDEX), file);
  });

  it("links tokens.css before style.css on every page", () => {
    for (const file of built()) {
      const html = read(file);
      assert.ok(html.includes('<link rel="stylesheet" href="tokens.css">'), file);
      assert.ok(html.indexOf("tokens.css") < html.indexOf("style.css"), file);
    }
  });

  it("asks for no font, style or script from another site", () => {
    for (const file of built()) {
      const html = read(file);
      for (const tag of html.match(/<(link|script|style)\b[^>]*>/gi) ?? []) {
        assert.doesNotMatch(tag, /https?:\/\/|\/\//, `${file}: ${tag}`);
      }
    }
    for (const css of ["tokens.css", "style.css"]) {
      assert.doesNotMatch(read(css), /https?:\/\/|@import/, css);
    }
    // Every font file named in tokens.css is a relative path to a file that was copied.
    const urls = [...read("tokens.css").matchAll(/url\("([^"]+)"\)/g)].map((m) => m[1]);
    assert.ok(urls.length >= 4);
    for (const url of urls) {
      assert.match(url, /^fonts\/[a-z-]+\.woff2$/);
      assert.ok(existsSync(join(out, url)), url);
    }
  });

  it("keeps every colour and font family in tokens.css", () => {
    assert.match(read("tokens.css"), RAW_COLOUR);
    assert.match(read("tokens.css"), RAW_FONT);
    const sources = [
      join(guideDir, "style.css"),
      join(guideDir, "shell.ts"),
      join(guideDir, "parts.ts"),
      join(guideDir, "search.js"),
      ...readdirSync(join(guideDir, "pages")).map((f) => join(guideDir, "pages", f)),
    ];
    for (const file of sources) {
      const text = readFileSync(file, "utf8");
      assert.doesNotMatch(text, RAW_COLOUR, file);
      assert.doesNotMatch(text, RAW_FONT, file);
    }
    // The output carries none either: no inline colour, none in the page head.
    for (const file of [...built(), "style.css"]) {
      assert.doesNotMatch(withoutAnchors(read(file)), RAW_COLOUR, file);
      assert.doesNotMatch(read(file), RAW_FONT, file);
    }
  });

  it("builds a home page with three entry points", () => {
    const html = read("index.html");
    for (const id of ["start", "everyday", "modules"]) assert.ok(html.includes(`<section class="door" id="${id}"`), id);
    // core-one is an everyday task; module-two sits under modules.
    const everyday = html.slice(html.indexOf('id="everyday"'), html.indexOf('id="modules"'));
    assert.ok(everyday.includes('href="core-one.html"'));
    assert.ok(html.slice(html.indexOf('id="modules"')).includes('href="module-two.html"'));
  });

  it("gives headings anchors, an on-this-page rail and a search entry", () => {
    const html = read("core-one.html");
    assert.ok(html.includes('<h2 id="first-part">First part</h2>'));
    assert.ok(html.includes('<aside class="rail" aria-label="On this page">'));
    assert.ok(html.includes('href="#second-part"'));
    assert.ok(read("search-index.js").includes('"url":"core-one.html#second-part"'));
  });

  it("holds the whole page in the HTML, so a page reads without any script", () => {
    const html = read("core-one.html");
    assert.ok(html.includes("<p>Body of core-one</p>"));
    // The only scripts are the two search files, deferred, and the box they fill starts hidden.
    const tags = html.match(/<script\b[^>]*>/gi) ?? [];
    assert.deepEqual(tags, ['<script src="search-index.js" defer>', '<script src="search.js" defer>']);
    assert.match(html, /<div class="search" data-search hidden>/);
    assert.equal(/<script[^>]*>[^<]+<\/script>/i.test(html), false);
  });

  it("has a menu link and a menu sheet for a phone", () => {
    const html = read("core-one.html");
    assert.ok(html.includes('<a class="menu-open" href="#menu">Menu</a>'));
    assert.ok(html.includes('<nav class="side" id="menu"'));
  });

  it("starts mobile first: layouts come in only under min-width", () => {
    const css = read("style.css");
    assert.doesNotMatch(css, /max-width\s*:\s*\d+(\.\d+)?(px|rem|em)\s*\)/);
    assert.ok(css.includes("@media (min-width: 56rem)"));
    assert.ok(css.includes("@media (min-width: 76rem)"));
  });

  it("disallows all crawlers in robots.txt", () => {
    assert.match(read("robots.txt"), /^User-agent: \*\r?\nDisallow: \/\r?\n?$/);
  });

  it("sets the X-Robots-Tag header in .htaccess", () => {
    assert.ok(read(".htaccess").includes('Header set X-Robots-Tag "noindex, nofollow"'));
  });

  it("refuses to empty a folder that holds the guide source", () => {
    assert.throws(() => build(join(root, "kc")), /guide source/);
  });
});

describe("guide build with drafts", () => {
  const make = (slug: string, approved?: boolean): GuidePage => ({
    title: `Title ${slug}`,
    group: "core",
    slug,
    checked: "2026-11-17",
    body: `<p>Body of ${slug}</p>`,
    ...(approved === undefined ? {} : { approved }),
  });
  const list = [make("shown", true), make("hidden", false)];
  const DRAFT = "Draft, not yet approved";
  let on: string;
  let off: string;
  before(() => {
    on = mkdtempSync(join(tmpdir(), "kc-guide-drafts-on-"));
    off = mkdtempSync(join(tmpdir(), "kc-guide-drafts-off-"));
    build(on, list, { drafts: true });
    build(off, list);
  });
  after(() => {
    rmSync(on, { recursive: true, force: true });
    rmSync(off, { recursive: true, force: true });
  });

  it("builds an unapproved page and lists it in the nav", () => {
    assert.ok(existsSync(join(on, "hidden.html")));
    assert.ok(readFileSync(join(on, "index.html"), "utf8").includes('href="hidden.html"'));
  });

  it("puts the draft line at the top of an unapproved page, noindex like the rest", () => {
    const html = readFileSync(join(on, "hidden.html"), "utf8");
    assert.ok(html.includes(DRAFT));
    assert.ok(html.indexOf(DRAFT) < html.indexOf("<h1>"));
    assert.ok(html.includes(NOINDEX));
    assert.ok(readFileSync(join(on, "index.html"), "utf8").includes(NOINDEX));
    assert.match(readFileSync(join(on, "robots.txt"), "utf8"), /Disallow: \//);
    assert.ok(readFileSync(join(on, ".htaccess"), "utf8").includes("noindex, nofollow"));
  });

  it("leaves the draft line off an approved page", () => {
    assert.equal(readFileSync(join(on, "shown.html"), "utf8").includes(DRAFT), false);
  });

  it("leaves the unapproved page out when drafts are off", () => {
    assert.equal(existsSync(join(off, "hidden.html")), false);
    assert.equal(readFileSync(join(off, "index.html"), "utf8").includes("hidden.html"), false);
    assert.equal(readFileSync(join(off, "shown.html"), "utf8").includes(DRAFT), false);
  });
});

describe("the real guide, built with drafts", () => {
  let out: string;
  before(() => {
    out = mkdtempSync(join(tmpdir(), "kc-guide-real-"));
    build(out, realPages, { drafts: true });
  });
  after(() => rmSync(out, { recursive: true, force: true }));

  it("has no placeholder page", () => {
    assert.equal(realPages.some((page) => page.slug === "sample" || page.title === "Sample page"), false);
    assert.equal(existsSync(join(guideDir, "pages", "placeholder.ts")), false);
    assert.equal(existsSync(join(out, "sample.html")), false);
    assert.equal(readFileSync(join(guideDir, "pages.ts"), "utf8").includes("placeholder"), false);
  });

  it("marks every built page noindex, links the tokens and holds no raw colour", () => {
    const files = readdirSync(out).filter((f) => f.endsWith(".html"));
    assert.equal(files.length, realPages.length + 1);
    for (const file of files) {
      const html = readFileSync(join(out, file), "utf8");
      assert.ok(html.includes(NOINDEX), file);
      assert.ok(html.includes('href="tokens.css"'), file);
      assert.doesNotMatch(html, RAW_FONT, file);
      assert.doesNotMatch(withoutAnchors(html), RAW_COLOUR, file);
    }
  });

  it("puts every approved-or-draft page into the search index", () => {
    const index = readFileSync(join(out, "search-index.js"), "utf8");
    for (const page of realPages) assert.ok(index.includes(`"url":"${page.slug}.html"`), page.slug);
  });
});

describe("page groups", () => {
  const page = (slug: string, group: string): GuidePage => ({ title: slug, group, slug, checked: "2026-11-17", body: "" });

  it("lists core first, then clients in name order", () => {
    const groups = groupPages([page("a", "henike"), page("b", "besciworks"), page("c", "core")]);
    assert.deepEqual(groups.map((g) => g.name), ["core", "besciworks", "henike"]);
  });
});
