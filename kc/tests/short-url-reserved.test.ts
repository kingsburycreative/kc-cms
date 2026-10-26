import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { RESERVED } from "../short-url.ts";

const root = join(import.meta.dirname, "..", "..");

// Top-level route names under app/: route groups flattened, dynamic dropped.
function appNames(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    if (!statSync(join(dir, name)).isDirectory()) continue;
    if (name.startsWith("(")) out.push(...appNames(join(dir, name)));
    else if (!name.startsWith("[") && !name.startsWith("_")) out.push(name);
  }
  return out;
}

test("every top-level app/ folder is reserved", () => {
  const names = appNames(join(root, "app"));
  assert.ok(names.includes("admin") && names.includes("sign-in"));
  for (const n of names) assert.ok(RESERVED.has(n.toLowerCase()), `app/${n}`);
});

test("every top-level public/ entry is reserved", () => {
  const names = readdirSync(join(root, "public"));
  assert.ok(names.length > 0);
  for (const n of names) assert.ok(RESERVED.has(n.toLowerCase()), `public/${n}`);
});

test("fixed names are reserved", () => {
  for (const n of ["_next", "images", "favicon.ico", "kingsburycreative"]) {
    assert.ok(RESERVED.has(n), n);
  }
});
