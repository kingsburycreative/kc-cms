import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

const dir = new URL("../../.claude/work/39-plan-dashboard/mockup/", import.meta.url);
const html = readFileSync(new URL("index.html", dir), "utf8");
const css = readFileSync(new URL("mockup.css", dir), "utf8");
const all = html + "\n" + css;

test("only min-width media queries", () => {
  const queries = [...all.matchAll(/@media\s*([^{]+)\{/g)].map((m) => m[1].trim());
  assert.ok(queries.some((q) => q.includes("min-width")));
  for (const q of queries) {
    assert.doesNotMatch(q, /max-width/);
    assert.match(q, /min-width|prefers-reduced-motion/);
  }
});

test("no wide letter-spacing and no uppercase", () => {
  assert.doesNotMatch(all, /text-transform\s*:\s*uppercase/);
  for (const m of all.matchAll(/letter-spacing\s*:\s*([\d.]+)em/g)) {
    assert.ok(Number(m[1]) <= 0.05, `letter-spacing ${m[1]}em`);
  }
});

test("no gradient", () => {
  assert.doesNotMatch(all, /gradient/i);
});

test("no beige hex", () => {
  assert.doesNotMatch(all, /#(f3efe7|f5f0e6|f4efe6|faf6ee|f7f3ea|efe8d8|f5f1e8)/i);
});

test("h1 to h3 text has no comma", () => {
  const heads = [...html.matchAll(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/g)];
  assert.ok(heads.length > 0);
  for (const h of heads) assert.ok(!h[1].includes(","), h[1]);
});

test("skeletons animate and stop under reduced motion", () => {
  assert.match(html, /class="skeleton/);
  assert.match(css, /\.skeleton\s*\{[^}]*animation\s*:/);
  assert.match(css, /prefers-reduced-motion[^{]*\{[^]*?\.skeleton\s*\{[^}]*animation\s*:\s*none/);
});

test("links and buttons are 44px tall", () => {
  assert.match(css, /(^|\n)a,\s*button\s*\{[^}]*min-height\s*:\s*44px/);
  assert.doesNotMatch(html, /style="[^"]*min-height/);
});

test("no filled and outline buttons in one parent", () => {
  for (const m of html.matchAll(/<(\w+)[^>]*>((?:(?!<\/\1>)[^])*)<\/\1>/g)) {
    const classes = [...m[2].matchAll(/<button[^>]*class="([^"]*)"/g)].map((b) => b[1]);
    const filled = classes.some((c) => /filled|primary/.test(c));
    const outline = classes.some((c) => /outline|ghost/.test(c));
    assert.ok(!(filled && outline));
  }
  assert.doesNotMatch(css, /\.(btn-)?(outline|ghost)/);
});

test("screenshots exist at 375 and 1280 wide", () => {
  for (const [name, width] of [["phone-375.png", 375], ["desktop-1280.png", 1280]] as const) {
    const url = new URL(name, dir);
    assert.ok(existsSync(url), name);
    const buf = readFileSync(url);
    assert.equal(buf.subarray(1, 4).toString(), "PNG");
    assert.equal(buf.readUInt32BE(16), width, name);
  }
});
