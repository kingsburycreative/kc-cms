// Card 108.01: would restoring the old Services page in History, then saving,
// have brought back the FAQ Kirk Henike's save of 2026-11-04 (commit 98ce106)
// wiped? The fixtures are trimmed copies of that file before and after the save
// and of Henike's .pages.yml at that commit. The save path is run with core's
// own functions, in the order the editor and the save route call them.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { restoreState } from "../history/restore.ts";
import { loadCoreConfig } from "../register/load-config.ts";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");
const before = JSON.parse(read("./fixtures/henike-services-before.json"));
const after = JSON.parse(read("./fixtures/henike-services-after.json"));
const pagesYml = read("./fixtures/henike-pages.yml");

const WIPED = ["answer", "source", "faq"];

async function servicesFields(): Promise<any[]> {
  const { config } = await loadCoreConfig();
  const parsed = config.parseAndValidateConfig(pagesYml);
  assert.deepEqual(parsed.parseErrors, []);
  assert.deepEqual(parsed.validationErrors, []);
  return (parsed.document as any).toJS().content.find((item: any) => item.name === "services").fields;
}

// The same schema with the three wiped keys removed from each service.
function withoutWiped(fields: any[]): any[] {
  return fields.map((field) =>
    field.name === "services"
      ? {
          ...field,
          fields: field.fields.map((service: any) => ({
            ...service,
            fields: service.fields.filter((inner: any) => !WIPED.includes(inner.name)),
          })),
        }
      : field,
  );
}

// What the editor sends and the route writes for a loaded entry that is saved
// untouched: components/entry/entry-form.tsx builds the form values with
// initializeState(fields, sanitizeObject(content)), the form posts them, and
// app/api/.../files/[path]/route.ts validates with generateZodSchema, maps with
// deepMap, then sanitizeObject before stringify.
async function save(fields: any[], content: unknown): Promise<any> {
  const { schema } = await loadCoreConfig();
  const formValues = schema.initializeState(fields, schema.sanitizeObject(content));
  const zod = schema.generateZodSchema(fields).safeParse(formValues);
  assert.equal(zod.success, true, zod.success ? "" : JSON.stringify(zod.error.errors));
  const mapped = schema.deepMap(zod.data, fields, (value: unknown) => value);
  return JSON.parse(JSON.stringify(schema.sanitizeObject(mapped)));
}

test("fixture: the save of 98ce106 dropped the answer, source and faq of every service", () => {
  for (const service of ["interlock", "decks"]) {
    for (const key of WIPED) {
      assert.ok(key in before.services[service], `before has ${service}.${key}`);
      assert.ok(!(key in after.services[service]), `after lacks ${service}.${key}`);
    }
  }
  assert.equal(before.services.decks.faq.length, 3);
});

test("the editor and the save route build values through the functions this test runs", () => {
  const root = (path: string) => read(`../../${path}`);
  assert.match(root("components/entry/entry-form.tsx"), /initializeState\(fields, sanitizeObject\(contentObject\)\)/);
  const route = root("app/api/[owner]/[repo]/[branch]/files/[path]/route.ts");
  assert.match(route, /generateZodSchema\(contentFields\)/);
  assert.match(route, /deepMap\(\s*zodValidation\.data,\s*contentFields,/);
  assert.match(route, /stringify\(\s*sanitizeObject\(finalContentObject\)/);
});

test("Henike's schema at 98ce106 lists answer, source and faq for every service", async () => {
  const fields = await servicesFields();
  const services = fields.find((field) => field.name === "services");
  for (const service of services.fields) {
    for (const key of WIPED) {
      assert.ok(service.fields.some((inner: any) => inner.name === key), `${service.name}.${key} is in the schema`);
    }
  }
});

test("Result: restores. Restoring the old version and saving writes the FAQ back, word for word", async () => {
  const fields = await servicesFields();
  const state = restoreState({ sha: "currentsha", contentObject: after }, { sha: "oldsha", contentObject: before });
  const saved = await save(fields, state.values);
  assert.equal(state.sha, "currentsha");
  assert.deepEqual(saved.services.interlock.faq, before.services.interlock.faq);
  assert.deepEqual(saved.services.decks.faq, before.services.decks.faq);
  assert.equal(saved.services.decks.answer, before.services.decks.answer);
  assert.deepEqual(saved.services.decks.source, before.services.decks.source);
  assert.deepEqual(saved, before);
});

test("control: saving the wiped version unchanged keeps it wiped", async () => {
  const fields = await servicesFields();
  const saved = await save(fields, after);
  assert.equal(saved.services.interlock.faq, undefined);
  assert.equal(saved.services.decks.faq, undefined);
  assert.deepEqual(saved, after);
});

test("a schema that does not list the faq drops it on save even from the restored content", async () => {
  const fields = withoutWiped(await servicesFields());
  const state = restoreState({ sha: "currentsha", contentObject: after }, { sha: "oldsha", contentObject: before });
  const saved = await save(fields, state.values);
  for (const service of ["interlock", "decks"]) {
    for (const key of WIPED) assert.equal(saved.services[service][key], undefined, `${service}.${key}`);
  }
});
