import { test } from "node:test";
import assert from "node:assert/strict";
import { createCache } from "../insights/route.ts";
import type { ReviewsStatus } from "../reviews/status.ts";
import { createSafeLookup, isBlockedAddress, type Resolved } from "../reviews/safe-lookup.ts";
import { fetchReviewsStatus, WARN_LINE } from "../reviews/status-fetch.ts";

const fam = (a: string) => (a.includes(":") ? 6 : 4);

function lookupWith(addrs: string[], all = false) {
  const hook = createSafeLookup(async () => addrs.map((address): Resolved => ({ address, family: fam(address) })));
  return new Promise<{ err: Error | null; address?: unknown; family?: number }>((resolve) =>
    hook("site.example", { all }, (err, address, family) => resolve({ err, address, family })),
  );
}

const PRIVATE = [
  "10.1.2.3", "172.16.0.1", "192.168.1.1", "127.0.0.1", "169.254.169.254", "100.64.0.1", "0.0.0.0",
  "::1", "fe80::1", "fc00::1", "::ffff:10.0.0.5",
];

test("the lookup hook refuses a name resolving to any special-purpose address", async () => {
  for (const a of PRIVATE) {
    const r = await lookupWith([a]);
    assert.ok(r.err, a);
    assert.equal(r.address, undefined, a);
  }
});

test("one private address among several public ones refuses the name", async () => {
  const r = await lookupWith(["93.184.216.34", "2606:2800::1", "10.0.0.5"]);
  assert.ok(r.err);
});

test("a public name passes and the hook returns exactly the checked address", async () => {
  for (const a of ["93.184.216.34", "2606:2800::1"]) {
    const r = await lookupWith([a, "8.8.8.8"]);
    assert.equal(r.err, null, a);
    assert.equal(r.address, a);
    assert.equal(r.family, fam(a));
    const listed = await lookupWith([a, "8.8.8.8"], true);
    assert.deepEqual(listed.address, [{ address: a, family: fam(a) }]);
  }
});

test("an empty or failed resolution is refused", async () => {
  assert.ok((await lookupWith([])).err);
  const hook = createSafeLookup(async () => { throw new Error("ENOTFOUND"); });
  const err = await new Promise((r) => hook("x.example", {}, (e) => r(e)));
  assert.ok(err);
});

test("isBlockedAddress covers the embedded v4 forms and the reserved ranges", () => {
  const blocked = [
    "::ffff:127.0.0.1", "::ffff:7f00:1", "64:ff9b::a00:5", "2002:a00:5::1", "2001::1", "2001:db8::1",
    "ff02::1", "255.255.255.255", "224.0.0.1", "198.18.0.1", "192.0.2.1", "203.0.113.9", "240.0.0.1",
    "::", "fe80::1%eth0", "not-an-ip",
  ];
  for (const a of blocked) assert.equal(isBlockedAddress(a), true, a);
  for (const a of ["93.184.216.34", "8.8.8.8", "2606:2800::1", "::ffff:93.184.216.34", "2002:5db8:d822::1"]) {
    assert.equal(isBlockedAddress(a), false, a);
  }
});

test("a hanging fetch aborts and gives unknown with the warn line", async () => {
  const lines: string[] = [];
  let sawSignal = false;
  const hang = (_url: string, init: { signal: AbortSignal }) => {
    sawSignal = init.signal instanceof AbortSignal;
    return new Promise<never>(() => {});
  };
  const started = Date.now();
  const out = await fetchReviewsStatus("https://henike.ca", {
    fetchImpl: hang as any, cache: createCache<ReviewsStatus>(), warn: (l) => lines.push(l), timeoutMs: 30,
  });
  assert.deepEqual(out, { state: "unknown" });
  assert.deepEqual(lines, [WARN_LINE]);
  assert.ok(sawSignal);
  assert.ok(Date.now() - started < 2000);
});
