import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { diffEntry, diffLines } from "../history/diff.ts";

const load = (name: string) => JSON.parse(readFileSync(new URL(`./fixtures/history-diff/${name}.json`, import.meta.url), "utf8"));
const fields = load("fields");
const before = load("before");
const after = load("after");

test("changed, added and removed fields carry the schema label", () => {
  const { fields: changes } = diffEntry(before, after, fields);
  const by = (label: string) => changes.find((c) => c.label === label);
  assert.deepEqual(by("Page title"), { label: "Page title", kind: "changed", before: "Welcome", after: "Welcome home" });
  assert.equal(by("Tagline")?.kind, "added");
  assert.equal(by("Phone")?.kind, "removed");
});

test("nested objects and lists are labelled by path", () => {
  const labels = diffEntry(before, after, fields).fields.map((c) => c.label);
  assert.ok(labels.includes("Hero > Heading"));
  assert.ok(labels.includes("Team > 2 > Role"));
});

test("unchanged fields are omitted", () => {
  const labels = diffEntry(before, after, fields).fields.map((c) => c.label);
  assert.deepEqual(labels.sort(), ["Hero > Heading", "Page title", "Phone", "Tagline", "Team > 2 > Role"]);
  assert.deepEqual(diffEntry(before, before, fields), { fields: [], body: [] });
});

test("a field with no label falls back to its name", () => {
  const { fields: changes } = diffEntry({ subtitle: "a" }, { subtitle: "b" }, fields);
  assert.equal(changes[0].label, "subtitle");
});

test("a list item added whole is one change", () => {
  const next = { ...before, team: [...before.team, { name: "Di", role: "Crew" }] };
  const changes = diffEntry(before, next, fields).fields;
  assert.deepEqual(changes.map((c) => [c.label, c.kind]), [["Team > 4 > Name", "added"], ["Team > 4 > Role", "added"]]);
});

test("a new file whose field is an object of strings is one labelled row per string", () => {
  const { fields: changes } = diffEntry(null, { hero: { heading: "Hi", image: "/a.jpg" } }, fields);
  assert.deepEqual(changes.map((c) => [c.label, c.kind, c.after]), [["Hero > Heading", "added", "Hi"], ["Hero > Image", "added", "/a.jpg"]]);
  assert.ok(!JSON.stringify(changes.map((c) => [c.before, c.after])).includes("{"));
});

test("a changed nested object with no fields in the schema is labelled by key", () => {
  const schema = [{ name: "seo", label: "SEO" }];
  const { fields: changes } = diffEntry({ seo: { title: "a", extra: { deep: "x" } } }, { seo: { title: "b", extra: { deep: "y" } } }, schema);
  assert.deepEqual(changes.map((c) => [c.label, c.before, c.after]), [["SEO > title", "a", "b"], ["SEO > extra > deep", "x", "y"]]);
});

test("a nested object uses schema labels, and keys the schema skips use the key", () => {
  const schema = [{ name: "hero", label: "Hero", fields: [{ name: "breadcrumb", label: "Breadcrumb label" }] }];
  const { fields: changes } = diffEntry({ hero: { breadcrumb: "Home", alt: "a" } }, { hero: { breadcrumb: "Privacy", alt: "b" } }, schema);
  assert.deepEqual(changes.map((c) => [c.label, c.after]), [["Hero > Breadcrumb label", "Privacy"], ["Hero > alt", "b"]]);
});

test("a list of objects with no fields is numbered, and no value is an object", () => {
  const { fields: changes } = diffEntry({ links: [{ a: "1" }] }, { links: [{ a: "1" }, { a: "2" }] }, [{ name: "links", label: "Links" }]);
  assert.deepEqual(changes.map((c) => [c.label, c.kind]), [["Links > 2 > a", "added"]]);
});

test("the body diffs line by line", () => {
  const { body } = diffEntry(before, after, fields);
  assert.deepEqual(body, [
    { kind: "same", text: "One" },
    { kind: "removed", text: "Two" },
    { kind: "added", text: "Two and a half" },
    { kind: "same", text: "Three" },
    { kind: "added", text: "Four" },
  ]);
  assert.deepEqual(diffLines("", "x"), [{ kind: "added", text: "x" }]);
});

test("no file for this card points at GitHub, and See all changes goes to /history", () => {
  const host = "github" + ".com";
  const files = [
    "../history/diff.ts",
    "../history/history-view.tsx",
    "./history-diff.test.ts",
    "../../app/(main)/[owner]/[repo]/[branch]/history/page.tsx",
    "../../app/(main)/[owner]/[repo]/[branch]/history/entry/page.tsx",
    "../../components/entry/entry-history.tsx",
  ];
  for (const file of files) {
    assert.ok(!readFileSync(new URL(file, import.meta.url), "utf8").includes(host), file);
  }
  const source = readFileSync(new URL("../../components/entry/entry-history.tsx", import.meta.url), "utf8");
  const link = source.slice(source.lastIndexOf("href", source.indexOf("See all changes")));
  assert.match(link.slice(0, 200), /\/history/);
});
