import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  BRAND_MARK,
  BRAND_NAME,
  BRAND_PRIMARY,
  BRAND_PRIMARY_FOREGROUND,
  UPSTREAM_NAME,
} from "../brand.ts";

const read = (path: string) =>
  readFileSync(new URL(`../../${path}`, import.meta.url), "utf8").replace(/\r\n/g, "\n");

const branded = [
  "app/globals.css",
  "app/icon.svg",
  "app/layout.tsx",
  "app/(main)/page.tsx",
  "components/about.tsx",
  "components/sign-in.tsx",
  "components/document-title.tsx",
  "components/collection/collection-table.tsx",
  "components/email/collaborator-added.tsx",
  "components/email/invite.tsx",
  "components/email/login.tsx",
  "lib/actions/collaborator.ts",
  "lib/auth.ts",
  "lib/commit-message.ts",
];

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

function cssVar(css: string, selector: string, name: string): string {
  const start = css.indexOf(`${selector} {`);
  assert.ok(start >= 0, `${selector} block missing`);
  const block = css.slice(start, css.indexOf("}", start));
  const match = block.match(new RegExp(`--${name}:[ ]*(#[0-9a-fA-F]{6})[ ]*;`));
  assert.ok(match, `--${name} in ${selector} is not a 6-digit hex`);
  return match[1];
}

test("no user-facing Pages CMS string outside the About credit", () => {
  for (const file of branded) {
    const hits = read(file)
      .split("\n")
      .filter((line) => line.includes("Pages CMS"));
    assert.deepEqual(hits, [], file);
  }
  assert.equal(UPSTREAM_NAME, "Pages CMS");
});

test("the About dialog keeps the upstream credit", () => {
  const about = read("components/about.tsx");
  assert.match(about, /Built on\{" "\}\s*<ExternalLink href=\{UPSTREAM_URL\}>\{UPSTREAM_NAME\}<\/ExternalLink>/);
});

test("brand names and the mark colour", () => {
  assert.equal(BRAND_NAME, "Kingsbury Creative CMS");
  assert.equal(BRAND_MARK, "#C2602E");
  assert.match(read("app/icon.svg"), new RegExp(`r="12"[^>]*fill="${BRAND_MARK}"`));
});

test("brand primary holds 4.5:1 with its foreground", () => {
  assert.ok(contrast(BRAND_PRIMARY, BRAND_PRIMARY_FOREGROUND) >= 4.5);
});

for (const selector of [":root", ".dark"]) {
  test(`${selector} primary text holds 4.5:1`, () => {
    const css = read("app/globals.css");
    const primary = cssVar(css, selector, "primary");
    const foreground = cssVar(css, selector, "primary-foreground");
    const ratio = contrast(primary, foreground);
    assert.ok(ratio >= 4.5, `${selector} ${primary} on ${foreground} is ${ratio.toFixed(2)}:1`);
  });
}

test("the email logo is a 96x96 PNG", () => {
  const png = readFileSync(new URL("../../public/images/email-logo.png", import.meta.url));
  assert.deepEqual([...png.subarray(0, 8)], [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  assert.equal(png.toString("ascii", 12, 16), "IHDR");
  assert.equal(png.readUInt32BE(16), 96);
  assert.equal(png.readUInt32BE(20), 96);
});
