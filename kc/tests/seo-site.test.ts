import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { entryHealth, seoTargets, siteHealth, MAX_ENTRIES } from "../seo/site.ts";

const fixture = (name: string) =>
  JSON.parse(readFileSync(new URL(`./fixtures/seo/${name}.json`, import.meta.url), "utf8"));

const title55 = "T".repeat(55);
const desc130 = "d".repeat(130);
const cleanBody = "A short plain paragraph.\n\n## Heading\n\nMore text.";

test("a 55-character title, 130-character description and clean body passes", () => {
  const h = entryHealth({ title: title55, description: desc130, body: cleanBody });
  assert.equal(h.status, "pass");
});

test("the weekly fixture passes", () => {
  assert.equal(entryHealth(fixture("weekly")).status, "pass");
});

test("a page file with no body is not failed for a missing body", () => {
  const h = entryHealth(fixture("page"));
  assert.equal(h.status, "pass");
  assert.deepEqual(h.advice, []);
});

test("a paper with no description is not checked", () => {
  assert.equal(entryHealth(fixture("paper")).status, "notChecked");
  assert.equal(entryHealth({ description: desc130 }).status, "notChecked");
});

test("a high reading grade alone leaves the entry passing and shows as advice", () => {
  const hard =
    "Notwithstanding considerable epistemological disagreements, institutional administrators characteristically " +
    "operationalize interdisciplinary methodologies, notwithstanding unprecedented organizational complications " +
    "and extraordinarily multidimensional circumstances.";
  const h = entryHealth({ title: title55, description: desc130, body: hard });
  assert.equal(h.status, "pass");
  assert.ok(h.advice.some((a) => a.key === "grade"));
});

test("a body with a # Heading fails", () => {
  const h = entryHealth({ title: title55, description: desc130, body: "# Heading\n\nText." });
  assert.equal(h.status, "fail");
  assert.ok(h.status === "fail" && h.problems.some((p) => p.key === "h1"));
});

test("250 entries stop at 200", () => {
  const entries = Array.from({ length: 250 }, (_, i) => ({
    name: "weekly",
    path: `p${i}.md`,
    values: { title: title55, description: desc130, body: cleanBody },
  }));
  const s = siteHealth(entries, 5);
  assert.equal(MAX_ENTRIES, 200);
  assert.equal(s.checked, 200);
  assert.equal(s.passing, 200);
});

test("fix is capped by limit and ordered worst first", () => {
  const mk = (path: string, values: object) => ({ name: "weekly", path, values });
  const entries = [
    mk("one.md", { title: title55, description: desc130, body: "# A\n\nText." }),
    mk("two.md", { title: "short", description: "short", body: "# A\n\n#### B" }),
    mk("three.md", { title: title55, description: "short", body: cleanBody }),
    mk("ok.md", { title: title55, description: desc130, body: cleanBody }),
    mk("paper.md", { title: "x" }),
  ];
  const s = siteHealth(entries, 2);
  assert.equal(s.checked, 4);
  assert.equal(s.passing, 1);
  assert.equal(s.notChecked, 1);
  assert.deepEqual(s.fix.map((f) => f.path), ["two.md", "one.md"]);
});

test("seoTargets reads top-level field names", () => {
  assert.deepEqual(seoTargets([{ name: "title" }, { name: "body" }]), { title: true, description: false, body: true });
  assert.deepEqual(seoTargets(undefined), { title: false, description: false, body: false });
});
