import { test } from "node:test";
import assert from "node:assert/strict";
import { loadCoreConfig } from "../register/load-config.ts";

const base = `
content:
  - name: home
    label: Home
    type: file
    path: content/home.md
    fields:
      - name: title
        type: string
  - name: posts
    label: Posts
    type: collection
    path: content/posts
    fields:
      - name: title
        type: string
`;

test("a minimal config with a kc block has no errors", async () => {
  const { config } = await loadCoreConfig();
  const r = config.parseAndValidateConfig(`${base}kc:\n  client: acme\n`);
  assert.deepEqual(r.parseErrors, []);
  assert.deepEqual(r.validationErrors, []);
});

test("an unknown field type is an error naming the field", async () => {
  const { config } = await loadCoreConfig();
  const source = base.replace("type: string", "type: bogus");
  const r = config.parseAndValidateConfig(source);
  assert.ok(r.validationErrors.length > 0);
  // The message does not name the field; the error's source range points at the bad type value.
  assert.ok(
    r.validationErrors.some((e: any) => /field type/.test(e.message) && source.slice(e.from, e.to) === "bogus"),
  );
});

test("a kc block with an unknown key fails", async () => {
  const { config } = await loadCoreConfig();
  const r = config.parseAndValidateConfig(`${base}kc:\n  client: acme\n  nope: 1\n`);
  assert.ok(r.validationErrors.some((e: any) => /nope/.test(e.message)));
});
