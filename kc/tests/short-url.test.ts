import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveShort, shortHref } from "../short-url.ts";

const FULL = "/kingsburycreative/besciworks/main";

test("short paths rewrite to the full path, query kept", () => {
  assert.deepEqual(resolveShort("/besciworks", "GET"), { rewrite: FULL });
  assert.deepEqual(resolveShort("/besciworks/", "GET"), { rewrite: FULL });
  assert.deepEqual(
    resolveShort("/besciworks/collection/papers/edit/a%2Fb.md?x=1", "GET"),
    { rewrite: `${FULL}/collection/papers/edit/a%2Fb.md?x=1` },
  );
  assert.deepEqual(resolveShort("/besciworks/history", "POST"), {
    rewrite: `${FULL}/history`,
  });
});

test("the full path redirects to the short one", () => {
  assert.deepEqual(resolveShort(`${FULL}/history`, "GET"), {
    redirect: "/besciworks/history",
  });
  assert.deepEqual(resolveShort(`${FULL}/history?a=1#b`, "HEAD"), {
    redirect: "/besciworks/history?a=1#b",
  });
});

test("other owners, branches and an encoded branch give null", () => {
  assert.equal(resolveShort("/kingsburycreative/besciworks/%6Dain", "GET"), null);
  assert.equal(resolveShort("/other-owner/x/main", "GET"), null);
  assert.equal(resolveShort("/kingsburycreative/x/dev/y", "GET"), null);
});

test("a POST to a full path gives null", () => {
  assert.equal(resolveShort(`${FULL}/history`, "POST"), null);
});

test("reserved and odd first segments give null", () => {
  for (const p of [
    "/api/x",
    "/sign-in",
    "/%61pi/x",
    "/Admin",
    "/_next/x",
    "/kingsburycreative",
    "/",
    "/.git/x",
    "/%2e%2e/x",
    "/a%5Cb",
    "/a%2Fb",
    "/%00x",
    "/%2561pi",
    "/%E0%A4%A",
  ]) {
    assert.equal(resolveShort(p, "GET"), null, p);
  }
});

test("no redirect ever starts with //", () => {
  for (const p of ["/kingsburycreative//evil.com", "//evil.com", "/kingsburycreative/x/main//evil.com"]) {
    const r = resolveShort(p, "GET");
    if (r && "redirect" in r) assert.ok(!r.redirect.startsWith("//"), p);
  }
  assert.equal(resolveShort("/kingsburycreative//evil.com", "GET"), null);
  assert.equal(resolveShort("//evil.com", "GET"), null);
});

test("shortHref leaves other paths alone", () => {
  assert.equal(shortHref("/acme/x/main/y"), "/acme/x/main/y");
  assert.equal(shortHref("/kingsburycreative/x/dev/y"), "/kingsburycreative/x/dev/y");
  assert.equal(shortHref("/kingsburycreative/api/main/y"), "/kingsburycreative/api/main/y");
  assert.equal(shortHref("/KingsburyCreative/x/main/y?q=1#h"), "/x/y?q=1#h");
});

test("20 sample full paths round trip", () => {
  const rests = [
    "",
    "/history",
    "/settings",
    "/media",
    "/collection/papers",
    "/collection/papers/new",
    "/collection/papers/edit/a%2Fb.md",
    "/collection/papers/edit/a%2Fb.md?x=1",
    "/file/home",
    "/file/home#top",
  ];
  const paths: string[] = [];
  for (const repo of ["besciworks", "acme-site"]) {
    for (const rest of rests) paths.push(`/kingsburycreative/${repo}/main${rest}`);
  }
  assert.equal(paths.length, 20);
  for (const p of paths) {
    const short = shortHref(p);
    assert.notEqual(short, p);
    assert.deepEqual(resolveShort(short, "GET"), { rewrite: p }, p);
  }
});
