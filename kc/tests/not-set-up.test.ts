import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { NOT_SET_UP, insightsNotSetUp, mediaNotSetUp } from "../not-set-up.ts";

const read = (f: string) => readFileSync(new URL(`../../${f}`, import.meta.url), "utf8");

test("media is not set up without a media list or navigation", () => {
  assert.equal(mediaNotSetUp({}), true);
  assert.equal(mediaNotSetUp(undefined), true);
  assert.equal(mediaNotSetUp({ media: [] }), true);
  assert.equal(mediaNotSetUp({ media: [{ name: "images" }] }), false);
  assert.equal(mediaNotSetUp({ navigation: { media: [{ type: "media", name: "x" }] } }), false);
});

test("insights shows the line only when not configured", () => {
  assert.equal(insightsNotSetUp(false), true);
  assert.equal(insightsNotSetUp(true), false);
});

test("the sidebar keeps Media and Site groups with plain text, no link", () => {
  const src = read("components/repo/repo-sidebar.tsx");
  assert.match(src, /config && mediaNotSetUp\(config\.object\)\s*\? renderNotSetUpGroup\("Media"\)/);
  assert.match(src, /insightsNotSetUp\(insightsConfigured\)\s*\? renderNotSetUpGroup\("Site"\)/);
  const fn = src.slice(src.indexOf("const renderNotSetUpGroup"), src.indexOf("const renderFlatGroup"));
  assert.match(fn, /<p [^>]*text-muted-foreground[^>]*>\{NOT_SET_UP\}<\/p>/);
  assert.doesNotMatch(fn, /Link|<a |SidebarMenuButton/);
});

test("configured insights without access stays hidden", () => {
  const layout = read("app/(main)/[owner]/[repo]/[branch]/layout.tsx");
  assert.match(layout, /hasInsights = !errorMessage && insightsConfigured && await getInsightsAccess/);
  assert.match(layout, /insightsConfigured=\{insightsConfigured\}/);
  const side = read("components/repo/repo-sidebar.tsx");
  assert.match(side, /hasInsights && config\s*\? renderFlatGroup\("Site"/);
});

test("no kc.site renders the live-site slot as text, not an anchor", () => {
  const src = read("kc/dashboard.tsx");
  const slot = src.slice(src.indexOf("const liveSite"), src.indexOf("\n", src.indexOf("const liveSite")));
  assert.match(slot, /<span[^>]*text-muted-foreground[^>]*>\{NOT_SET_UP\}<\/span>/);
  assert.doesNotMatch(slot.slice(slot.indexOf(":")), /<a\b/);
  assert.equal(NOT_SET_UP, "Not set up yet");
});
