// Card 77: oversized JSON bodies under /api are refused with 413 before any parse.
// Loads proxy.ts the same way short-url-proxy.test.ts does.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { createRequire } from "node:module";
import { checkFilesBody } from "../save-size.ts";
import { throwIfTooLarge, PAGE_TOO_LARGE, FILE_TOO_LARGE } from "../save-error.ts";

const root = resolve(import.meta.dirname, "..", "..");
const require = createRequire(join(root, "package.json"));
const nextServer = require.resolve("next/server.js");
const patched = readFileSync(join(root, "proxy.ts"), "utf8")
  .replaceAll('"next/server"', JSON.stringify(pathToFileURL(nextServer).href))
  .replace('"./kc/short-url.ts"', JSON.stringify(pathToFileURL(join(root, "kc", "short-url.ts")).href))
  .replace('"./kc/save-size.ts"', JSON.stringify(pathToFileURL(join(root, "kc", "save-size.ts")).href));
const file = join(mkdtempSync(join(tmpdir(), "kc-size-")), "proxy.mts");
writeFileSync(file, patched);
const { proxy } = await import(pathToFileURL(file).href);
const { NextRequest } = require("next/server.js");

const HOST = "cms.kingsburycreative.com";
const MB = 1024 * 1024;

function req(path: string, method: string, headers: Record<string, string> = {}) {
  return new NextRequest(`https://${HOST}${path}`, {
    method,
    headers: { host: HOST, origin: `https://${HOST}`, ...headers },
  });
}
const json = (len: number) => ({ "content-type": "application/json", "content-length": String(len) });
const ENTRY = "/api/o/r/main/entries/a.md";
const FILES = "/api/o/r/main/files/a.md";

test("over-cap JSON on an entries path is refused with 413 and the error shape", async () => {
  const res = proxy(req(ENTRY, "POST", json(2 * MB)));
  assert.equal(res.status, 413);
  const body = await res.json();
  assert.equal(body.status, "error");
  assert.equal(typeof body.message, "string");
});

test("a body method without Content-Length is refused", () => {
  assert.equal(proxy(req(ENTRY, "POST", { "content-type": "application/json" })).status, 413);
});

test("under-cap JSON passes", () => {
  assert.equal(proxy(req(ENTRY, "POST", json(200 * 1024))).status, 200);
});

test("multipart over the cap passes", () => {
  const res = proxy(req(ENTRY, "POST", { "content-type": "multipart/form-data; boundary=x", "content-length": String(30 * MB) }));
  assert.equal(res.status, 200);
});

test("/files/ allows 5 MB and refuses 30 MB", () => {
  assert.equal(proxy(req(FILES, "POST", json(5 * MB))).status, 200);
  assert.equal(proxy(req(FILES, "POST", json(30 * MB))).status, 413);
});

test("route check refuses a 2 MB non-media body and passes 2 MB media", () => {
  assert.equal(checkFilesBody({ type: "content" }, 2 * MB)?.status, 413);
  assert.equal(checkFilesBody({ type: "media" }, 2 * MB), null);
  assert.equal(checkFilesBody({ type: "content" }, 100), null);
});

test("webhook is exempt", () => {
  assert.equal(proxy(req("/api/webhook/github", "POST", json(30 * MB))).status, 200);
});

test("GET is untouched", () => {
  assert.equal(proxy(req(ENTRY, "GET", json(30 * MB))).status, 200);
});

test("non-/api paths are untouched", () => {
  const res = proxy(req("/sign-in", "POST", json(30 * MB)));
  assert.notEqual(res.status, 413);
});

test("the mapper turns a 413 into the friendly message", () => {
  const r413 = new Response(null, { status: 413 });
  assert.throws(() => throwIfTooLarge(r413, "save"), { message: PAGE_TOO_LARGE });
  assert.throws(() => throwIfTooLarge(r413, "upload"), { message: FILE_TOO_LARGE });
  assert.doesNotMatch(PAGE_TOO_LARGE, /something went wrong|413/i);
  assert.match(PAGE_TOO_LARGE, /Kingsbury Creative/);
  throwIfTooLarge(new Response(null, { status: 500 }), "save");
});
