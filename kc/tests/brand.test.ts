import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  BRAND_MARK,
  BRAND_NAME,
  BRAND_PRIMARY,
  BRAND_PRIMARY_DARK,
  BRAND_PRIMARY_FOREGROUND,
  BRAND_PRIMARY_FOREGROUND_DARK,
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

function linear(c: number): number {
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => linear(parseInt(hex.slice(i, i + 2), 16) / 255));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// oklch(L C h) to a hex colour, via OKLab and linear sRGB (Ottosson's matrices).
function oklchToHex(l: number, c: number, hDeg: number): string {
  const h = (hDeg * Math.PI) / 180;
  const a = c * Math.cos(h);
  const b = c * Math.sin(h);
  const l_ = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m_ = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s_ = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const lin = [
    4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
    -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
    -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_,
  ];
  const enc = (v: number) => {
    const x = Math.min(1, Math.max(0, v));
    const g = x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055;
    return Math.round(g * 255).toString(16).padStart(2, "0");
  };
  return `#${lin.map(enc).join("")}`;
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

function cssValue(css: string, selector: string, name: string): string {
  const start = css.indexOf(`${selector} {`);
  assert.ok(start >= 0, `${selector} block missing`);
  const block = css.slice(start, css.indexOf("}", start));
  const match = block.match(new RegExp(`--${name}:[ ]*([^;]+);`));
  assert.ok(match, `--${name} missing in ${selector}`);
  return match[1].trim();
}

function cssColour(css: string, selector: string, name: string): string {
  const value = cssValue(css, selector, name);
  if (/^#[0-9a-fA-F]{6}$/.test(value)) return value;
  const m = value.match(/^oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)$/);
  assert.ok(m, `--${name} in ${selector} is neither 6-digit hex nor plain oklch: ${value}`);
  return oklchToHex(Number(m[1]), Number(m[2]), Number(m[3]));
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

test("dark brand values", () => {
  assert.equal(BRAND_PRIMARY_DARK, "#D4713F");
  assert.equal(BRAND_PRIMARY_FOREGROUND_DARK, "#1A1714");
  const css = read("app/globals.css");
  assert.equal(cssColour(css, ".dark", "primary").toUpperCase(), BRAND_PRIMARY_DARK);
  assert.equal(cssColour(css, ".dark", "primary-foreground").toUpperCase(), BRAND_PRIMARY_FOREGROUND_DARK);
  assert.equal(cssColour(css, ".dark", "ring").toUpperCase(), BRAND_PRIMARY_DARK);
});

for (const selector of [":root", ".dark"]) {
  test(`${selector} primary holds 4.5:1 as text on background and under its foreground`, () => {
    const css = read("app/globals.css");
    const primary = cssColour(css, selector, "primary");
    const foreground = cssColour(css, selector, "primary-foreground");
    const background = cssColour(css, selector, "background");
    const asText = contrast(primary, background);
    const asButton = contrast(primary, foreground);
    console.log(`${selector} link ${asText.toFixed(2)}:1 button ${asButton.toFixed(2)}:1`);
    assert.ok(asText >= 4.5, `${selector} ${primary} on ${background} is ${asText.toFixed(2)}:1`);
    assert.ok(asButton >= 4.5, `${selector} ${foreground} on ${primary} is ${asButton.toFixed(2)}:1`);
  });
}

test("the email logo is a 96x96 PNG", () => {
  const png = readFileSync(new URL("../../public/images/email-logo.png", import.meta.url));
  assert.deepEqual([...png.subarray(0, 8)], [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  assert.equal(png.toString("ascii", 12, 16), "IHDR");
  assert.equal(png.readUInt32BE(16), 96);
  assert.equal(png.readUInt32BE(20), 96);
});
