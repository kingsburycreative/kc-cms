import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../../app/globals.css", import.meta.url), "utf8");

const block = (selector: string) => {
  const start = css.indexOf(`${selector} {`);
  assert.ok(start >= 0, selector);
  return css.slice(start, css.indexOf("}", start));
};

for (const selector of [":root", ".dark"]) {
  test(`${selector} chart colours are no longer the old greens`, () => {
    const body = block(selector);
    for (let n = 1; n <= 5; n++) {
      const match = body.match(new RegExp(`--chart-${n}:\\s*oklch\\(([\\d.]+) ([\\d.]+) ([\\d.]+)\\)`));
      assert.ok(match, `--chart-${n}`);
      const hue = Number(match[3]);
      assert.ok(hue < 150 || hue > 180, `--chart-${n} hue ${hue} is green`);
    }
  });

  test(`${selector} defines a focus ring token`, () => {
    assert.match(block(selector), /--focus-ring:\s*#[0-9A-Fa-f]{6}/);
  });
}

test("terracotta stays the primary and the base stays white", () => {
  const root = block(":root");
  assert.match(root, /--primary:\s*#A84F23/);
  assert.match(root, /--background:\s*oklch\(1 0 0\)/);
});

test("the dark theme keeps the .dark selector", () => {
  assert.doesNotMatch(css, /data-ui-theme/);
});
