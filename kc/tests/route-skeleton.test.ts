import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");
const loadings = [read("../../app/loading.tsx"), read("../../app/(main)/loading.tsx")];
const skeleton = read("../route-skeleton.tsx");

test("neither loading.tsx uses Loader", () => {
  for (const src of loadings) {
    assert.doesNotMatch(src, /Loader/);
  }
});

test("both loading.tsx render RouteSkeleton", () => {
  for (const src of loadings) {
    assert.match(src, /<RouteSkeleton\s*\/>/);
    assert.match(src, /from "@\/kc\/route-skeleton"/);
  }
});

test("route skeleton shimmers and is aria-busy", () => {
  assert.match(skeleton, /BLOCK = "[^"]*\bkc-shimmer\b[^"]*"/);
  assert.match(skeleton, /aria-busy="true"/);
  assert.match(skeleton, /aria-label=/);
});

test("sidebar column is hidden at base width and shown from md", () => {
  assert.match(skeleton, /<aside[^>]*className="[^"]*\bhidden\b[^"]*\bmd:flex\b/);
});
