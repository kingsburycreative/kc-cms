import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  CreateSchema,
  CREATE_CONFLICT_MESSAGE,
  createConflictMode,
  createRequestBody,
} from "../create-conflict.ts";

const read = (path: string) =>
  readFileSync(new URL(`../../${path}`, import.meta.url), "utf8").replace(/\r\n/g, "\n");

test("CreateSchema accepts the two modes and an empty object", () => {
  assert.ok(CreateSchema.safeParse({ onConflict: "error" }).success);
  assert.ok(CreateSchema.safeParse({ onConflict: "rename" }).success);
  assert.ok(CreateSchema.safeParse({}).success);
});

test("CreateSchema rejects an unknown mode and an unknown key", () => {
  assert.equal(CreateSchema.safeParse({ onConflict: "skip" }).success, false);
  assert.equal(CreateSchema.safeParse({ other: 1 }).success, false);
});

test("createConflictMode reads the collection option", () => {
  assert.equal(createConflictMode({ create: { onConflict: "error" } }), "error");
  assert.equal(createConflictMode({}), "rename");
  assert.equal(createConflictMode({ create: {} }), "rename");
  assert.equal(createConflictMode({ create: { onConflict: "junk" } }), "rename");
  assert.equal(createConflictMode(undefined), "rename");
});

test("a create in an error collection sends onConflict", () => {
  const schema = { type: "collection", create: { onConflict: "error" } };
  assert.deepEqual(createRequestBody({ path: undefined, schema }), { onConflict: "error" });
});

test("a create without the option sends no onConflict key", () => {
  const body = createRequestBody({ path: undefined, schema: { type: "collection" } });
  assert.equal("onConflict" in body, false);
});

test("saving an existing entry never sends onConflict", () => {
  const schema = { type: "collection", create: { onConflict: "error" } };
  assert.equal("onConflict" in createRequestBody({ path: "posts/a.md", schema }), false);
});

test("a file schema never sends onConflict", () => {
  const schema = { type: "file", create: { onConflict: "error" } };
  assert.equal("onConflict" in createRequestBody({ path: undefined, schema }), false);
});

test("the 409 message is the agreed copy", () => {
  assert.equal(
    CREATE_CONFLICT_MESSAGE,
    "A file with this name already exists. Open the existing entry to change it.",
  );
});

test("the editor and schema are wired, and the route still reads onConflict", () => {
  const entry = read("components/entry/entry.tsx");
  assert.match(entry, /createRequestBody\(/);
  assert.match(entry, /CREATE_CONFLICT_MESSAGE/);
  assert.match(read("lib/config-schema.ts"), /create: CreateSchema\.optional\(\)/);
  assert.match(
    read("app/api/[owner]/[repo]/[branch]/files/[path]/route.ts"),
    /data\.onConflict === "error"/,
  );
});
