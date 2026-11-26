import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { applyLatest, configChanged, decideRefresh, reloadedConfig, saveWithRetry } from "../stale-sync.ts";
import { SAVE_ERROR_MESSAGES } from "../save-error.ts";

test("an unchanged sha does nothing, dirty or not", () => {
  assert.equal(decideRefresh({ currentSha: "a", incomingSha: "a", isDirty: false }), "none");
  assert.equal(decideRefresh({ currentSha: "a", incomingSha: "a", isDirty: true }), "none");
});

test("a changed sha with no edits reloads; the first load reloads", () => {
  assert.equal(decideRefresh({ currentSha: "a", incomingSha: "b", isDirty: false }), "reload");
  assert.equal(decideRefresh({ currentSha: undefined, incomingSha: "b", isDirty: false }), "reload");
});

test("a changed sha with edits shows the banner and never reloads over typed text", () => {
  assert.equal(decideRefresh({ currentSha: "a", incomingSha: "b", isDirty: true }), "banner");
});

test("a refresh never advances the sha without merging the typed text", () => {
  const next = applyLatest({
    base: { title: "Old", body: "x" },
    latest: { sha: "new", content: { title: "Old", body: "changed", faq: "kept" } },
    mine: { title: "Typed", body: "x" },
  });
  assert.equal(next.sha, "new");
  assert.deepEqual(next.content, { title: "Typed", body: "changed", faq: "kept" });
});

const reply = (status: number, message: string) => new Response(JSON.stringify({ status: "error", message }), { status });

test("a stale-sha 409 merges onto the latest file and retries once", async () => {
  const calls: Array<{ content: unknown; sha: string | undefined }> = [];
  const result = await saveWithRetry({
    sha: "old",
    base: { title: "Old", body: "x" },
    content: { title: "Typed", body: "x" },
    save: async (content, sha) => {
      calls.push({ content, sha });
      return calls.length === 1 ? reply(409, SAVE_ERROR_MESSAGES.conflict) : new Response("{}", { status: 200 });
    },
    loadLatest: async () => ({ sha: "new", content: { title: "Old", body: "changed" } }),
  });
  assert.equal(calls.length, 2);
  assert.deepEqual(calls[1], { content: { title: "Typed", body: "changed" }, sha: "new" });
  assert.equal(result.retried, true);
  assert.equal(result.response.status, 200);
});

test("a second stale 409 is not retried again", async () => {
  let count = 0;
  const result = await saveWithRetry({
    sha: "old", base: {}, content: { a: 1 },
    save: async () => { count++; return reply(409, SAVE_ERROR_MESSAGES.conflict); },
    loadLatest: async () => ({ sha: "new", content: {} }),
  });
  assert.equal(count, 2);
  assert.equal(result.response.status, 409);
});

test("a protected-branch 409 does not retry", async () => {
  let count = 0;
  let loaded = false;
  const result = await saveWithRetry({
    sha: "old", base: {}, content: { a: 1 },
    save: async () => { count++; return reply(409, SAVE_ERROR_MESSAGES.protected); },
    loadLatest: async () => { loaded = true; return { sha: "new", content: {} }; },
  });
  assert.equal(count, 1);
  assert.equal(loaded, false);
  assert.equal(result.retried, false);
});

test("the field list reloads only when the config's sha actually changes", () => {
  assert.equal(configChanged("a", "a"), false);
  assert.equal(configChanged("a", "b"), true);
  assert.equal(configChanged("a", null), false);
  assert.equal(configChanged(undefined, "b"), false);
});

test("a reloaded config takes the new fields and sha; a broken .pages.yml keeps the old one", () => {
  const old = { owner: "o", sha: "a", object: { content: [{ name: "home", fields: [{ name: "title" }] }] } };
  const object = { content: [{ name: "home", fields: [{ name: "title" }, { name: "hero" }] }] };
  assert.deepEqual(reloadedConfig(old, "b", { errors: [], object }), { owner: "o", sha: "b", object });
  assert.equal(reloadedConfig(old, "b", { errors: [{ message: "bad" }], object }), null);
});

test("entry.tsx watches the config sha and marks merged fields inline", () => {
  const entry = readFileSync(new URL("../../components/entry/entry.tsx", import.meta.url), "utf8");
  const form = readFileSync(new URL("../../components/entry/entry-form.tsx", import.meta.url), "utf8");
  assert.match(entry, /"\/entries\/\.pages\.yml"\) \?\? null;[\s\S]*\?meta=1/);
  assert.match(entry, /configChanged\(config\.sha, latestSha\)[\s\S]*setConfig\(next\)/);
  assert.match(entry, /setConflictFields\(conflicts\)/);
  assert.match(entry, /markedFields=\{conflictFields\}/);
  assert.match(form, /form\.setError\(name, \{ type: "kc-merge", message: markedNote \}\)/);
});
