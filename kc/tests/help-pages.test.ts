import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { build } from "../guide/build.ts";
import { checkPages, pages, type GuidePage } from "../guide/pages.ts";
import {
  callout, checkItWorked, chip, figure, helpBar, menuPath, pageHeader, steps, withHeadingIds,
} from "../guide/parts.ts";
import { renderPage, stampText } from "../guide/shell.ts";

const root = join(import.meta.dirname, "..", "..");
const version = JSON.parse(readFileSync(join(root, "package.json"), "utf8")).version as string;
const core = pages.filter((page) => page.group === "core" && page.slug.startsWith("core-"));
const BANNED = /\b(repo\w*|commit\w*|collection\w*|field\w*|markdown)\b/i;

const textOf = (page: GuidePage) => `${page.title} ${page.body.replace(/<[^>]*>/g, " ")}`;

describe("core guide pages", () => {
  it("has the ten core pages", () => {
    assert.equal(core.length, 10);
    checkPages(pages);
  });

  for (const page of core) {
    describe(page.slug, () => {
      it("has a title, a checked date and approved set", () => {
        assert.ok(page.title.length > 0);
        assert.match(page.checked, /^\d{4}-\d{2}-\d{2}$/);
        assert.equal(typeof page.approved, "boolean");
      });

      it("carries the version stamp when rendered", () => {
        const html = renderPage(page, [page], version);
        assert.ok(html.includes(stampText(version, page.checked)));
      });

      it("gives every image alt text", () => {
        for (const img of page.body.match(/<img\b[^>]*>/gi) ?? []) {
          assert.match(img, /\balt="[^"]+"/);
        }
      });

      it("uses none of the banned words", () => {
        assert.doesNotMatch(textOf(page), BANNED);
      });

      it("shows nothing only KC sees", () => {
        assert.doesNotMatch(textOf(page), /staff only|analytics id/i);
      });
    });
  }
});

describe("module guide pages", () => {
  const modules = pages.filter((page) => page.slug.startsWith("module-"));
  const ids = ["bilingual", "galleries", "reviews", "business-details", "publications", "events", "menu", "hours"];
  const DENY = /henike|besciworks|cupboard|kirk|nikki|chris adams/i;

  it("has all eight module pages", () => {
    for (const id of ids) assert.ok(modules.some((page) => page.moduleId === id), id);
    checkPages(pages);
  });

  for (const page of modules) {
    describe(page.slug, () => {
      it("has a title, date, approved and a module id", () => {
        assert.ok(page.title.length > 0);
        assert.match(page.checked, /^\d{4}-\d{2}-\d{2}$/);
        assert.equal(typeof page.approved, "boolean");
        assert.ok(page.moduleId && page.moduleId.length > 0);
      });

      it("carries the version stamp when rendered", () => {
        assert.ok(renderPage(page, [page], version).includes(stampText(version, page.checked)));
      });

      it("uses none of the banned words", () => {
        assert.doesNotMatch(textOf(page), BANNED);
      });
    });
  }

  it("names no client in any page source", () => {
    const dir = join(root, "kc", "guide", "pages");
    for (const file of [...readdirSync(dir).map((f) => join(dir, f)), join(root, "kc", "guide", "pages.ts")]) {
      assert.doesNotMatch(readFileSync(file, "utf8"), DENY, file);
    }
  });
});

describe("shared page parts", () => {
  it("steps: each has a numeral, an action, You will see and If not", () => {
    const html = steps([
      { action: `Choose ${chip("Save")}.`, see: "A green bar.", ifNot: "Check you are signed in." },
      { action: "Open the page.", see: "The form.", ifNot: "Reload." },
    ]);
    assert.equal((html.match(/<li class="step">/g) ?? []).length, 2);
    assert.ok(html.includes('<span class="step-num" aria-hidden="true">1</span>'));
    assert.ok(html.includes('<span class="step-num" aria-hidden="true">2</span>'));
    assert.ok(html.includes(`<p class="step-action">Choose <span class="chip">Save</span>.</p>`));
    assert.ok(html.includes('<span class="step-label">You will see</span> A green bar.'));
    assert.ok(html.includes('<span class="step-label">If not</span> Check you are signed in.'));
    // The slots come in the order a reader needs them.
    assert.ok(html.indexOf("step-action") < html.indexOf("You will see"));
    assert.ok(html.indexOf("You will see") < html.indexOf("If not"));
  });

  it("steps: leaves out a slot that has no text, and puts a figure under the action", () => {
    const html = steps([{ action: "Do it.", figure: figure({ caption: "The screen" }) }]);
    assert.doesNotMatch(html, /You will see|If not/);
    assert.ok(html.indexOf("step-action") < html.indexOf("<figure"));
  });

  it("figure: an image has alt, a caption, one ring and a numbered dot by percentage", () => {
    const html = figure({
      src: "img/a.png", alt: "The Save button", caption: "Save is at the top.", size: [1408, 880],
      ring: { x: 70, y: 5, w: 20, h: 8 }, dot: { n: 3, x: 70, y: 5 },
    });
    assert.ok(html.includes('<img src="img/a.png" alt="The Save button" width="1408" height="880" loading="lazy">'));
    assert.ok(html.includes("<figcaption>Save is at the top.</figcaption>"));
    assert.ok(html.includes('class="ring" style="left:70%;top:5%;width:20%;height:8%"'));
    assert.ok(html.includes('class="dot" style="left:70%;top:5%" aria-hidden="true">3</span>'));
  });

  it("figure: with no image it is a styled empty frame with the caption", () => {
    const html = figure({ caption: "The sign-in page" });
    assert.ok(html.includes("figure-empty"));
    assert.ok(html.includes("<figcaption>The sign-in page</figcaption>"));
    assert.equal(html.includes("<img"), false);
  });

  it("figure: refuses an image without alt text and keeps positions to 0 to 100 percent", () => {
    assert.throws(() => figure({ src: "img/a.png", caption: "x" }), /alt/);
    assert.throws(() => figure({ caption: "x", src: "a.png", alt: "y", ring: { x: Number.NaN, y: 0, w: 1, h: 1 } }));
    const html = figure({ src: "a.png", alt: "y", caption: "x", dot: { n: 1, x: 250, y: -4 } });
    assert.ok(html.includes("left:100%;top:0%"));
  });

  it("figure and chip: escape what a page passes in", () => {
    assert.ok(figure({ caption: "A <b> & B" }).includes("A &lt;b&gt; &amp; B"));
    assert.equal(chip("A & B"), '<span class="chip">A &amp; B</span>');
  });

  it("callout: a note and a warning, each in a straight-edged aside", () => {
    assert.ok(callout("note", "Limit.").includes('class="callout callout-note"'));
    assert.ok(callout("note", "Limit.").includes("Good to know"));
    assert.ok(callout("warning", "Cannot undo.").includes('class="callout callout-warning"'));
    assert.ok(callout("warning", "Cannot undo.").includes("Careful"));
  });

  it("menu path: mono, joined with a greater-than sign", () => {
    assert.equal(menuPath("Menu", "Pages", "Home page"), '<code class="menu-path">Menu &gt; Pages &gt; Home page</code>');
  });

  it("check it worked and the help bar", () => {
    const check = checkItWorked("Open your site.");
    assert.ok(check.includes('<h2 id="check-it-worked">Check it worked</h2>'));
    assert.ok(helpBar().includes('href="mailto:hello@kingsburycreative.com"'));
    assert.ok(helpBar().includes("Need a hand?"));
  });

  it("page header: title, goal, time and the version stamp", () => {
    const html = pageHeader({
      title: "Sign in", goal: "You will be signed in.", time: "About 2 minutes",
      stamp: stampText(version, "2026-11-17"), checked: "2026-11-17",
    });
    assert.ok(html.includes("<h1>Sign in</h1>"));
    assert.ok(html.includes('<p class="goal">You will be signed in.</p>'));
    assert.ok(html.includes("About 2 minutes"));
    assert.ok(html.includes(`<time datetime="2026-11-17">${stampText(version, "2026-11-17")}</time>`));
  });

  it("headings get unique anchors and are listed, existing ids kept", () => {
    const { html, headings } = withHeadingIds('<h2>Add a line</h2><h3>Add a line</h3><h2 id="mine">Other</h2>');
    assert.ok(html.includes('<h2 id="add-a-line">Add a line</h2>'));
    assert.ok(html.includes('<h3 id="add-a-line-2">Add a line</h3>'));
    assert.ok(html.includes('<h2 id="mine">Other</h2>'));
    assert.deepEqual(headings.map((h) => h.id), ["add-a-line", "add-a-line-2", "mine"]);
  });

  it("a rendered page shows its goal and time", () => {
    const page: GuidePage = {
      title: "T", group: "core", slug: "t", checked: "2026-11-17", body: "<p>x</p>", goal: "Goal here.", time: "About 1 minute",
    };
    const html = renderPage(page, [page], version);
    assert.ok(html.includes("Goal here.") && html.includes("About 1 minute"));
  });
});

describe("unapproved pages", () => {
  const make = (slug: string, approved?: boolean): GuidePage => ({
    title: `Page ${slug}`, group: "core", slug, checked: "2026-11-17", body: "<p>x</p>", approved,
  });

  it("are left out of the built nav and the output", () => {
    const out = mkdtempSync(join(tmpdir(), "kc-guide-"));
    try {
      build(out, [make("shown", true), make("hidden", false), make("legacy")]);
      const index = readFileSync(join(out, "index.html"), "utf8");
      assert.ok(index.includes("shown.html"));
      assert.ok(index.includes("legacy.html"));
      assert.equal(index.includes("hidden.html"), false);
      assert.equal(existsSync(join(out, "hidden.html")), false);
    } finally {
      rmSync(out, { recursive: true, force: true });
    }
  });
});
