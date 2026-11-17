// Henike's Services page lost its plain answers and FAQ in a save on 4 November.
// Does opening the old version in History and saving it bring them back? This
// runs the real read, restore and save code over a trimmed copy of that case.
// The finding is in .claude/work/108-01-restore-check/finding.md.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { loadCoreConfig } from "../register/load-config.ts";
import { restoreState } from "../history/restore.ts";
import { parse, stringify } from "../../lib/serialization.ts";

const fixture = (name: string) => readFileSync(new URL(`./fixtures/${name}`, import.meta.url), "utf8");
const before = fixture("henike-services-before.json");
const after = fixture("henike-services-after.json");

type Field = { name: string; fields?: Field[]; [key: string]: unknown };

const wiped = ["answer", "source", "faq"];
const without = (fields: Field[], names: string[]): Field[] =>
  fields
    .filter((field) => !names.includes(field.name))
    .map((field) => (field.fields ? { ...field, fields: without(field.fields, names) } : field));

async function pipeline(fields: Field[]) {
  const { schema } = await loadCoreConfig();
  const { deepMap, initializeState, generateZodSchema, sanitizeObject } = schema as any;
  const identity = (value: unknown) => value;

  // app/api/[owner]/[repo]/[branch]/entries/[path]/route.ts, parseContent: what the
  // editor and the History restore receive for a file at a given version.
  const read = (raw: string) => deepMap(parse(raw, { format: "json" }), fields, identity);

  // app/api/[owner]/[repo]/[branch]/files/[path]/route.ts, POST: validate, map to
  // the schema, sanitise, serialise.
  const save = (values: Record<string, unknown>) => {
    const checked = generateZodSchema(fields).safeParse(values);
    assert.equal(checked.success, true, "the restored values pass validation");
    const mapped = deepMap(checked.data, fields, identity);
    return JSON.parse(stringify(sanitizeObject(JSON.parse(JSON.stringify(mapped))), { format: "json" }));
  };

  // components/entry/entry.tsx: the restore keeps the current sha and loads the old
  // content into the form, then the normal save runs.
  const restoreThenSave = () => {
    const state = restoreState({ sha: "current", contentObject: read(after) }, { sha: "old", contentObject: read(before) });
    return { state, saved: save(initializeState(fields, state.values as Record<string, unknown>)) };
  };

  return { read, save, restoreThenSave };
}

async function schemaFields(): Promise<Field[]> {
  const { config } = await loadCoreConfig();
  const parsed = config.parseConfig(fixture("henike-services-pages.yml"));
  assert.deepEqual(parsed.errors, []);
  const object = config.normalizeConfig(parsed.document.toJSON());
  return object.content.find((entry: { name: string }) => entry.name === "services").fields;
}

test("when the schema lists the answers and FAQ, restore then save brings them back", async () => {
  const fields = await schemaFields();
  const { state, saved } = (await pipeline(fields)).restoreThenSave();
  const original = JSON.parse(before);

  assert.deepEqual((state.values as any).services.interlock.faq, original.services.interlock.faq);
  assert.deepEqual(saved.services.interlock.faq, original.services.interlock.faq);
  assert.deepEqual(saved.services.decks.faq, original.services.decks.faq);
  assert.equal(saved.services.interlock.answer, original.services.interlock.answer);
  assert.deepEqual(saved.services.interlock.source, original.services.interlock.source);
  assert.deepEqual(saved.faq, original.faq);
});

test("when the schema does not list them, restore then save leaves them gone", async () => {
  const fields = without(await schemaFields(), wiped);
  const run = await pipeline(fields);
  const { state, saved } = run.restoreThenSave();

  // Dropped on the way in: the old version arrives at the editor already without them.
  const arrived = (state.values as any).services.interlock;
  assert.equal("faq" in arrived, false);
  assert.equal("answer" in arrived, false);
  assert.equal("faq" in (state.values as any), false);

  // Dropped on the way out too: handing the save the full old content still loses them.
  const direct = run.save(JSON.parse(before));
  assert.equal("faq" in direct.services.interlock, false);
  assert.equal("faq" in direct, false);

  // What lands in the file is the wiped page again.
  assert.deepEqual(saved, JSON.parse(after));
});
