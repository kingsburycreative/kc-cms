import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");
const css = read("../../app/globals.css");
const skeleton = read("../dashboard-skeleton.tsx");
const dashboard = read("../dashboard.tsx");

test("dashboard sources no longer use animate-pulse", () => {
  assert.doesNotMatch(skeleton, /animate-pulse/);
  assert.doesNotMatch(dashboard, /animate-pulse/);
});

test("dashboard sources use kc-shimmer", () => {
  assert.match(skeleton, /kc-shimmer/);
  assert.match(dashboard, /kc-shimmer/);
});

test("globals.css defines the shimmer and its keyframes", () => {
  assert.match(css, /\.kc-shimmer\s*\{/);
  assert.match(css, /@keyframes kc-shimmer/);
});

test("globals.css stills the shimmer under reduced motion", () => {
  assert.match(
    css,
    /@media \(prefers-reduced-motion: reduce\)\s*\{\s*\.kc-shimmer\s*\{[^}]*animation:\s*none/,
  );
});
