import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { build } from "../guide/build.ts";
import { checkPages, pages, type GuidePage } from "../guide/pages.ts";
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
