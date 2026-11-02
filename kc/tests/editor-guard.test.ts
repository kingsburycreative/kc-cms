import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { cacheAfterSave, isLeavingClick, needsLeaveWarning, shouldResetForm } from "../editor-guard.ts";

const read = (path: string) => readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");

const server = { title: "From server" };
const other = { title: "Changed elsewhere" };

test("a dirty form is never reset, whatever the refetch brings", () => {
  assert.equal(shouldResetForm({ isDirty: true, incoming: other, current: server }), false);
  assert.equal(shouldResetForm({ isDirty: true, incoming: server, current: server }), false);
});

test("a clean form takes fresh server data", () => {
  assert.equal(shouldResetForm({ isDirty: false, incoming: other, current: server }), true);
});

test("a refetch with the same content does not reset the form", () => {
  assert.equal(shouldResetForm({ isDirty: false, incoming: { ...server }, current: server }), false);
});

test("cacheAfterSave holds the saved content and the new sha", () => {
  const entry = { sha: "old", name: "home.json", contentObject: server };
  const cached = cacheAfterSave(entry, other, "new");
  assert.deepEqual(cached, { sha: "new", name: "home.json", contentObject: other });
  assert.equal(shouldResetForm({ isDirty: false, incoming: cached.contentObject, current: other }), false);
});

test("leaving warns only when dirty and not saving", () => {
  assert.equal(needsLeaveWarning(true, false), true);
  assert.equal(needsLeaveWarning(true, true), false);
  assert.equal(needsLeaveWarning(false, false), false);
});

test("only a link to another in-app page counts as leaving", () => {
  const here = "https://cms.example/o/r/main/file/home.json";
  assert.equal(isLeavingClick("/o/r/main/file/about.json", here, "https://cms.example"), true);
  assert.equal(isLeavingClick("#top", here, "https://cms.example"), false);
  assert.equal(isLeavingClick(here, here, "https://cms.example"), false);
  assert.equal(isLeavingClick("https://elsewhere.example/", here, "https://cms.example"), false);
  assert.equal(isLeavingClick(null, here, "https://cms.example"), false);
});

test("entry.tsx turns off the focus refetch for the entry", () => {
  const source = read("components/entry/entry.tsx");
  assert.match(source, /useSWR<EntryData>\(\s*entryApiUrl,\s*fetchEntryByUrl,\s*\{[^}]*revalidateOnFocus: false/);
});

test("entry.tsx writes the saved content into the cache after a save", () => {
  const source = read("components/entry/entry.tsx");
  const setSha = source.indexOf("if (data.data.sha !== sha) setSha(data.data.sha);");
  const resolve = source.indexOf("resolve(data);", setSha);
  assert.ok(setSha > 0 && resolve > setSha);
  assert.match(source.slice(setSha, resolve), /mutateEntry\([^;]*cacheAfterSave\(current, saved, data\.data\.sha\)[^;]*\{ revalidate: false \}\)/);
});

test("entry.tsx guards leaving with beforeunload and in-app links, removed when clean", () => {
  const source = read("components/entry/entry.tsx");
  assert.match(source, /needsLeaveWarning\(isFormDirty \|\| hasRegisteredChanges, isSaving\)/);
  assert.match(source, /if \(!leaveWarning\) return;/);
  assert.match(source, /addEventListener\("beforeunload"/);
  assert.match(source, /removeEventListener\("beforeunload"/);
  assert.match(source, /addEventListener\("click", onLinkClick, true\)/);
  assert.match(source, /removeEventListener\("click", onLinkClick, true\)/);
  assert.match(source, /window\.confirm\(LEAVE_WARNING\)/);
});

test("entry-form resets from new data only when shouldResetForm allows", () => {
  const source = read("components/entry/entry-form.tsx");
  assert.match(source, /if \(!shouldResetForm\(\{ isDirty: form\.formState\.isDirty, incoming: defaultValues/);
  assert.doesNotMatch(source, /useEffect\(\(\) => \{\s*form\.reset\(defaultValues\);/);
});

test("a failed validation shows at the field, not only in a toast", () => {
  const source = read("components/entry/entry-form.tsx");
  assert.match(source, /<FormMessage \/>/);
  const handler = source.slice(source.indexOf("const handleError"), source.indexOf("const handleFormSubmit"));
  assert.match(handler, /toast\.error/);
  assert.match(handler, /\[aria-invalid="true"\]'\)\?\.scrollIntoView/);
});
