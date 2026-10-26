// Card 48: proxy.ts hooks resolveShort after the /api/ Origin check.
// proxy.ts imports "next/server", which Node's ESM resolver cannot load without
// the .js extension, so the test loads a copy of the real source with the two
// import specifiers pointed at absolute files. The logic run is proxy.ts as written.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { createRequire } from "node:module";
import { resolveShort } from "../short-url.ts";

const root = resolve(import.meta.dirname, "..", "..");
const source = readFileSync(join(root, "proxy.ts"), "utf8");
const require = createRequire(join(root, "package.json"));
const nextServer = require.resolve("next/server.js");
const shortUrl = pathToFileURL(join(root, "kc", "short-url.ts")).href;

const patched = source
  .replaceAll('"next/server"', JSON.stringify(pathToFileURL(nextServer).href))
  .replace('"./kc/short-url.ts"', JSON.stringify(shortUrl));
const dir = mkdtempSync(join(tmpdir(), "kc-proxy-"));
const file = join(dir, "proxy.mts");
writeFileSync(file, patched);

const { proxy } = await import(pathToFileURL(file).href);
const { NextRequest } = require("next/server.js");

const HOST = "cms.kingsburycreative.com";

function req(path: string, method = "GET", headers: Record<string, string> = {}) {
  return new NextRequest(`https://${HOST}${path}`, {
    method,
    headers: { host: HOST, ...headers },
  });
}

function rewriteTarget(res: Response): string | null {
  return res.headers.get("x-middleware-rewrite");
}

function forwardedHeader(res: Response, name: string): string | null {
  return res.headers.get(`x-middleware-request-${name}`);
}

test("a short GET is rewritten and x-return-to is the short path", () => {
  const res = proxy(req("/besciworks/history?x=1"));
  const target = rewriteTarget(res);
  assert.ok(target);
  assert.equal(new URL(target).pathname, "/kingsburycreative/besciworks/main/history");
  assert.equal(forwardedHeader(res, "x-return-to"), "/besciworks/history?x=1");
});

test("a full GET answers 308 to the short form on the same host", () => {
  const res = proxy(req("/kingsburycreative/besciworks/main/history?x=1"));
  assert.equal(res.status, 308);
  const loc = new URL(res.headers.get("location")!);
  assert.equal(loc.host, HOST);
  assert.equal(loc.pathname, "/besciworks/history");
  assert.equal(loc.search, "?x=1");
});

test("method: a POST to a full path is not redirected", () => {
  const res = proxy(req("/kingsburycreative/besciworks/main/history", "POST"));
  assert.notEqual(res.status, 308);
  assert.equal(res.headers.get("location"), null);
});

test("a cross-origin POST to /api/x/y/main/files/a answers 403 and is never rewritten", () => {
  const res = proxy(req("/api/x/y/main/files/a", "POST", { origin: "https://evil.example" }));
  assert.equal(res.status, 403);
  assert.equal(rewriteTarget(res), null);
  // Every /api/ path is reserved, so behaviour alone cannot show the order;
  // the Origin check must sit above the hook in the source (plan flag 4).
  const originCheck = source.indexOf("status: 403");
  const hook = source.indexOf("resolveShort(pathname");
  assert.ok(originCheck > 0 && hook > originCheck, "Origin check runs before the short-address hook");
});

test("/api/webhook/github is unchanged", () => {
  const res = proxy(req("/api/webhook/github", "POST", { origin: "https://evil.example" }));
  assert.equal(res.status, 200);
  assert.equal(rewriteTarget(res), null);
  assert.equal(res.headers.get("location"), null);
});

test("/sign-in and /_next/x pass through", () => {
  for (const p of ["/sign-in", "/_next/x", "/api/app/version"]) {
    const res = proxy(req(p));
    assert.equal(res.status, 200, p);
    assert.equal(rewriteTarget(res), null, p);
    assert.equal(res.headers.get("location"), null, p);
  }
});

test("proxy.ts imports nothing about sessions, tokens or fetch", () => {
  const imports = [...source.matchAll(/^import .* from "([^"]+)";$/gm)].map((m) => m[1]);
  assert.deepEqual(imports.sort(), ["./kc/short-url.ts", "next/server", "next/server"]);
  assert.doesNotMatch(source, /fetch\(|getToken|session|auth|crypto/i);
});

test("access: for 10 repos the rewritten pathname equals the full pathname byte for byte", () => {
  const repos = [
    "besciworks", "henike-contracting", "sembr", "unreachable-repo", "private-x",
    "dev-default", "master-default", "A-Mixed-Case", "repo_with_underscore", "r2",
  ];
  for (const repo of repos) {
    const full = `/kingsburycreative/${repo}/main/collection/papers`;
    const res = proxy(req(`/${repo}/collection/papers`));
    const target = rewriteTarget(res);
    assert.ok(target, repo);
    assert.equal(new URL(target).pathname, full, repo);
    const fromCore = resolveShort(`/${repo}/collection/papers`, "GET");
    assert.deepEqual(fromCore, { rewrite: full }, repo);
  }
});
