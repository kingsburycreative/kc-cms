import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import {
  checkTitle,
  checkDescription,
  snippet,
  checkH1,
  checkHeadingOrder,
  countImagesWithoutAlt,
  checkAnswerFirst,
  hasSeoFields,
} from "../seo/rules.ts";
import { fleschKincaidGrade, countSyllables } from "../seo/readability.ts";

test("title must be 50 to 60 characters", () => {
  assert.equal(checkTitle("a".repeat(49)).ok, false);
  assert.equal(checkTitle("a".repeat(50)).ok, true);
  assert.equal(checkTitle("a".repeat(60)).ok, true);
  assert.equal(checkTitle("a".repeat(61)).ok, false);
});

test("description must be 120 to 155 characters", () => {
  assert.equal(checkDescription("a".repeat(119)).ok, false);
  assert.equal(checkDescription("a".repeat(120)).ok, true);
  assert.equal(checkDescription("a".repeat(155)).ok, true);
  assert.equal(checkDescription("a".repeat(156)).ok, false);
});

test("snippet cuts on a word boundary with an ellipsis", () => {
  assert.equal(snippet("short title", 60), "short title");
  assert.equal(snippet("alpha beta gamma delta", 14), "alpha beta…");
  assert.equal(snippet("alpha beta gamma", 10), "alpha beta…");
});

test("any H1 in the body is flagged", () => {
  assert.equal(checkH1("# Hello\n\ntext").ok, false);
  assert.equal(checkH1("text <h1 class='x'>Hi</h1>").ok, false);
  assert.equal(checkH1("## Fine\n\ntext #hashtag").ok, true);
});

test("skipped heading levels are flagged", () => {
  assert.equal(checkHeadingOrder("## A\n\n#### B").ok, false);
  assert.equal(checkHeadingOrder("<h2>A</h2><h4>B</h4>").ok, false);
  assert.equal(checkHeadingOrder("## A\n\n### B\n\n## C").ok, true);
});

test("images without alt text are counted", () => {
  assert.equal(countImagesWithoutAlt("![](a.png) ![ok](b.png)"), 1);
  assert.equal(countImagesWithoutAlt('<img src="a.png"> <img src="b.png" alt=""> <img src="c.png" alt="A van">'), 2);
  assert.equal(countImagesWithoutAlt("![A van](a.png)"), 0);
});

test("grade matches a hand count within 0.5", () => {
  // "The cat sat on the mat. The dog ran to the park."
  // 12 words, 2 sentences, 12 syllables (every word has one).
  // 0.39 * (12 / 2) + 11.8 * (12 / 12) - 15.59 = 2.34 + 11.8 - 15.59 = -1.45
  const grade = fleschKincaidGrade("The cat sat on the mat. The dog ran to the park.");
  assert.ok(grade !== null && Math.abs(grade - -1.45) <= 0.5, String(grade));
  assert.equal(countSyllables("water"), 2);
  assert.equal(countSyllables("make"), 1);
});

test("answer first: short paragraph before any heading", () => {
  const answer = Array(30).fill("word").join(" ");
  assert.equal(checkAnswerFirst(`${answer}\n\n## Next`).ok, true);
  assert.equal(checkAnswerFirst(`## Next\n\n${answer}`).ok, false);
  assert.equal(checkAnswerFirst("Too short.\n\n## Next").ok, false);
  assert.equal(checkAnswerFirst(Array(61).fill("word").join(" ")).ok, false);
  assert.equal(checkAnswerFirst(Array(60).fill("word").join(" ")).ok, true);
});

test("fields are found by name, panel hidden without them", () => {
  const f = (...names: string[]) => names.map((name) => ({ name }));
  assert.equal(hasSeoFields(f("title", "description", "body")), true);
  assert.equal(hasSeoFields(f("title", "body")), false);
  assert.equal(hasSeoFields(undefined), false);
  const panel = readFileSync(new URL("../seo/panel.tsx", import.meta.url), "utf8");
  assert.match(panel, /hasSeoFields\(fields\)/);
  assert.match(panel, /return null/);
});

test("nothing in kc/seo makes a network call", () => {
  for (const file of readdirSync(new URL("../seo/", import.meta.url))) {
    const src = readFileSync(new URL(`../seo/${file}`, import.meta.url), "utf8");
    assert.doesNotMatch(src, /\bfetch\b|https?:|XMLHttpRequest/, file);
  }
});

test("panel is a details below the form, beside it from 1280", () => {
  const panel = readFileSync(new URL("../seo/panel.tsx", import.meta.url), "utf8");
  const form = readFileSync(new URL("../../components/entry/entry-form.tsx", import.meta.url), "utf8");
  assert.match(panel, /<details/);
  assert.match(panel, /min-width: 1280px/);
  assert.match(form, /grid-cols-1[^"]*min-\[1280px\]:grid-cols-/);
  assert.match(form, /<SeoPanel fields=\{fields\} \/>/);
  assert.ok(form.indexOf("</form>") < form.indexOf("<SeoPanel"));
});
