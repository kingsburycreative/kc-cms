import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const read = (p: string) => readFileSync(fileURLToPath(new URL(p, import.meta.url)), "utf8");
const page = read("../../app/(main)/[owner]/[repo]/[branch]/insights/page.tsx");
const section = read("../insights/charts-section.tsx");

const CARDS = ["Visitors", "Average time on site", "Top towns", "Top pages", "How people found the site"];

test("page calls loadSeries and keeps all five text cards", () => {
  assert.match(page, /await loadSeries\(/);
  for (const title of CARDS) assert.ok(page.includes(`title="${title}"`), title);
});

test("charts section sits above the cards", () => {
  const at = page.indexOf("<ChartsSection");
  assert.ok(at > 0, "charts section rendered");
  assert.ok(at < page.indexOf('<Card title="Visitors"'));
});

test("a series failure drops only the charts", () => {
  assert.match(page, /loadSeries\([\s\S]*?\)\.catch\(\(\) => null\)/);
  assert.match(page, /\{series && <ChartsSection series=\{series\} \/>\}/);
  // The cards do not depend on the series.
  const cards = page.slice(page.indexOf('<div className="grid'));
  assert.ok(!cards.includes("series"));
});

test("charts section props carry no key or token", () => {
  assert.match(page, /<ChartsSection series=\{series\} \/>/);
  assert.match(section, /ChartsSection\(\{ series \}: \{ series: Series \}\)/);
  assert.ok(!/key|token|process\.env/i.test(section.replace(/key=\{r\}/g, "")));
  assert.match(section, /<InsightsChart days=\{series\.days\} \/>/);
});

test("copy has both notes and no banned words", () => {
  assert.ok(section.includes("{VISIT_NOTE}"));
  assert.match(section, /series\.from === "ga4" && .*\{GA4_NOTE\}/);
  assert.ok(/page view/i.test(section) && /allowed analytics/.test(section));
  for (const bad of ["—", "leverage", "robust"]) assert.ok(!section.toLowerCase().includes(bad), bad);
});
