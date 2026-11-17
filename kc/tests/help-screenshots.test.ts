import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, describe, it } from "node:test";
import {
  changedPages,
  cleanPage,
  diffHashes,
  hashFolder,
  missingFromManifest,
  parseStep,
  picturesUsedBy,
  type Manifest,
  type ManifestEntry,
  type MaskDocument,
  type MaskNode,
} from "../guide/screenshots/compare.ts";
import { pages } from "../guide/pages.ts";

const shots = join(import.meta.dirname, "..", "guide", "screenshots");
const entry = (page: string, picture: string, width = 375): ManifestEntry => ({
  page,
  picture,
  url: "/",
  width,
  steps: [],
});

describe("screenshot compare", () => {
  let root: string;
  const folder = (name: string, files: Record<string, string>) => {
    const dir = join(root, name);
    mkdirSync(dir, { recursive: true });
    for (const [file, text] of Object.entries(files)) writeFileSync(join(dir, file), text);
    return dir;
  };
  before(() => {
    root = mkdtempSync(join(tmpdir(), "kc-shots-"));
  });
  after(() => rmSync(root, { recursive: true, force: true }));

  const manifest = [
    entry("sign-in", "sign-in-375.png"),
    entry("sign-in", "sign-in-1280.png", 1280),
    entry("edit-text", "edit-text-375.png"),
    entry("history", "history-375.png"),
  ];
  const bodies = [
    { slug: "sign-in", body: '<img src="img/sign-in-375.png" alt="x">' },
    { slug: "edit-text", body: '<img alt="x" src="img/edit-text-375.png">' },
    { slug: "history", body: '<img src="img/history-375.png" alt="x"><img src="img/old-history.png" alt="x">' },
  ];

  it("lists exactly the pages whose picture hash differs", () => {
    const one = folder("run1", {
      "sign-in-375.png": "a",
      "sign-in-1280.png": "b",
      "edit-text-375.png": "c",
      "history-375.png": "d",
      "notes.txt": "ignored",
    });
    const two = folder("run2", {
      "sign-in-375.png": "a",
      "sign-in-1280.png": "b",
      "edit-text-375.png": "changed",
      "history-375.png": "d",
    });
    assert.deepEqual(changedPages(hashFolder(one), hashFolder(two), manifest, bodies), ["edit-text"]);
  });

  it("lists no page when every picture matches", () => {
    const files = { "sign-in-375.png": "a", "edit-text-375.png": "c", "history-375.png": "d" };
    const one = folder("same1", files);
    const two = folder("same2", files);
    assert.deepEqual(changedPages(hashFolder(one), hashFolder(two), manifest, bodies), []);
  });

  it("lists a page once when two of its pictures changed", () => {
    const one = folder("two1", { "sign-in-375.png": "a", "sign-in-1280.png": "b" });
    const two = folder("two2", { "sign-in-375.png": "x", "sign-in-1280.png": "y" });
    assert.deepEqual(changedPages(hashFolder(one), hashFolder(two), manifest, bodies), ["sign-in"]);
  });

  it("lists the page of an added picture and of a removed one", () => {
    const one = folder("ar1", { "sign-in-375.png": "a", "old-history.png": "z" });
    const two = folder("ar2", { "sign-in-375.png": "a", "edit-text-375.png": "c" });
    const before = hashFolder(one);
    const afterRun = hashFolder(two);
    assert.deepEqual(diffHashes(before, afterRun), {
      changed: [],
      added: ["edit-text-375.png"],
      removed: ["old-history.png"],
    });
    // old-history.png is in no manifest entry; the page body still finds its page.
    assert.deepEqual(changedPages(before, afterRun, manifest, bodies), ["edit-text", "history"]);
  });

  it("treats a first run, with no earlier hashes, as every page changed", () => {
    const two = folder("first", { "sign-in-375.png": "a", "history-375.png": "d" });
    assert.deepEqual(changedPages({}, hashFolder(two), manifest, bodies), ["history", "sign-in"]);
  });

  it("reads an empty or missing folder as no pictures", () => {
    assert.deepEqual(hashFolder(join(root, "nope")), {});
  });
});

describe("pictures a page uses", () => {
  it("lists local img files by name and skips outside addresses", () => {
    const body = `<img src="img/a.png" alt=""> <img alt="" src='/guide/img/b.png?v=2'>
      <img src="https://example.com/c.png"> <img src="data:image/png;base64,AAAA"> <p>no img</p>`;
    assert.deepEqual(picturesUsedBy(body), ["a.png", "b.png"]);
  });

  it("reports a picture the manifest does not name", () => {
    const page = { slug: "p", body: '<img src="img/a.png" alt=""><img src="img/b.png" alt="">' };
    assert.deepEqual(missingFromManifest(page, [entry("p", "a.png")]), ["b.png"]);
    assert.deepEqual(missingFromManifest(page, [entry("p", "a.png"), entry("p", "b.png")]), []);
  });
});

describe("screenshot manifest", () => {
  const file = JSON.parse(readFileSync(join(shots, "manifest.json"), "utf8")) as Manifest;
  const manifest = file.shots;

  it("seeds the deny list with KC's names and the client names", () => {
    const deny = file.deny.map((word) => word.toLowerCase());
    for (const word of ["kingsbury", "kc test site", "kingsburycreative.com", "skilled-trades-month", "henike", "besciworks"]) {
      assert.ok(deny.includes(word), `deny list lacks ${word}`);
    }
  });

  it("has well-formed replace and hide rules", () => {
    for (const item of manifest) {
      for (const rule of item.replace ?? []) {
        assert.ok(rule.selector && typeof rule.text === "string", `${item.picture} has a bad replace rule`);
      }
      for (const selector of item.hide ?? []) assert.ok(selector, `${item.picture} has an empty hide selector`);
    }
  });

  it("names a picture file for every img a guide page uses", () => {
    for (const page of pages) {
      assert.deepEqual(
        missingFromManifest({ slug: page.slug, body: page.body }, manifest),
        [],
        `guide page ${page.slug} shows a picture the manifest does not name`,
      );
    }
  });

  it("has well-formed entries for pages that exist", () => {
    const slugs = new Set(pages.map((page) => page.slug));
    const names = new Set<string>();
    for (const item of manifest) {
      assert.ok(slugs.has(item.page), `manifest page ${item.page} is not a guide page`);
      assert.match(item.picture, /^[a-z0-9-]+\.png$/);
      assert.ok(!names.has(item.picture), `${item.picture} is named twice`);
      names.add(item.picture);
      assert.ok([375, 1280].includes(item.width), `${item.picture} width must be 375 or 1280`);
      assert.ok(item.url.startsWith("/"), `${item.picture} url must be a path`);
      for (const line of item.steps) parseStep(line);
    }
  });

  it("keeps the hashes file as a name-to-hash map", () => {
    const hashes = JSON.parse(readFileSync(join(shots, "hashes.json"), "utf8")) as Record<string, string>;
    for (const [name, hash] of Object.entries(hashes)) {
      assert.match(name, /\.png$/);
      assert.match(hash, /^[0-9a-f]{64}$/);
    }
  });
});

// A fixture page with no browser: elements are found by the exact selector string they were
// registered under, and the page's visible text is whatever attached elements still say.
function fixturePage(elements: Record<string, string[]>): MaskDocument & { text(selector: string): string[] } {
  type Fixture = MaskNode & { attached: boolean };
  const nodes: Record<string, Fixture[]> = {};
  for (const [selector, texts] of Object.entries(elements)) {
    nodes[selector] = texts.map((text) => {
      const node: Fixture = {
        attached: true,
        textContent: text,
        remove() {
          node.attached = false;
        },
      };
      return node;
    });
  }
  const live = () => Object.values(nodes).flat().filter((node) => node.attached);
  return {
    querySelectorAll: (selector) => (nodes[selector] ?? []).filter((node) => node.attached),
    body: {
      get textContent() {
        return live().map((node) => node.textContent).join(" ");
      },
    },
    text: (selector) => (nodes[selector] ?? []).filter((node) => node.attached).map((node) => node.textContent ?? ""),
  };
}

describe("screenshot masks", () => {
  const deny = ["kingsbury", "kc test site"];
  const dirty = () =>
    fixturePage({
      ".pages-loaded": ["Pages loaded: 98,412"],
      ".site-name": ["KC Test Site", "Welcome to Kingsbury Creative"],
      ".staff-only": ["Staff only: Kingsbury admin tools"],
      ".title": ["Recent changes"],
    });

  it("replace sets the text of every matching element", () => {
    const page = dirty();
    cleanPage(page, { replace: [{ selector: ".site-name", text: "Demo Site" }] }, deny);
    assert.deepEqual(page.text(".site-name"), ["Demo Site", "Demo Site"]);
    assert.deepEqual(page.text(".title"), ["Recent changes"]);
  });

  it("hide removes the matching elements and leaves the rest", () => {
    const page = dirty();
    cleanPage(page, { hide: [".staff-only"] }, deny);
    assert.deepEqual(page.text(".staff-only"), []);
    assert.deepEqual(page.text(".title"), ["Recent changes"]);
  });

  it("fails a page that still says Kingsbury, in any case", () => {
    assert.deepEqual(cleanPage(dirty(), {}, deny), ["kingsbury", "kc test site"]);
    assert.deepEqual(cleanPage(fixturePage({ p: ["KINGSBURY"] }), {}, deny), ["kingsbury"]);
  });

  it("passes the cleaned page", () => {
    const page = dirty();
    const left = cleanPage(
      page,
      {
        replace: [
          { selector: ".pages-loaded", text: "Pages loaded: 1,240" },
          { selector: ".site-name", text: "Demo Site" },
        ],
        hide: [".staff-only"],
      },
      deny,
    );
    assert.deepEqual(left, []);
    assert.deepEqual(page.text(".pages-loaded"), ["Pages loaded: 1,240"]);
  });

  it("uses the browser's visible text when the page has it", () => {
    const page = { querySelectorAll: () => [], body: { innerText: "Hello from Kingsbury", textContent: "" } };
    assert.deepEqual(cleanPage(page, {}, deny), ["kingsbury"]);
  });

  it("is one self-contained function, so run.mjs can send its source into the page", () => {
    const inPage = new Function(`return (${cleanPage.toString()})`)() as typeof cleanPage;
    const page = dirty();
    assert.deepEqual(inPage(page, { hide: [".staff-only"], replace: [{ selector: ".site-name", text: "Demo" }] }, deny), []);
  });
});

describe("screenshot steps", () => {
  it("parses the four plain actions", () => {
    assert.deepEqual(parseStep("goto /sign-in"), { action: "goto", path: "/sign-in" });
    assert.deepEqual(parseStep("click button[type=submit]"), { action: "click", selector: "button[type=submit]" });
    assert.deepEqual(parseStep("fill #email demo@example.com"), {
      action: "fill",
      selector: "#email",
      text: "demo@example.com",
    });
    assert.deepEqual(parseStep("wait .title"), { action: "wait", selector: ".title" });
  });

  it("refuses an unknown or incomplete step", () => {
    assert.throws(() => parseStep("hover .x"));
    assert.throws(() => parseStep("click"));
    assert.throws(() => parseStep("fill #email"));
  });
});
