import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// The uptime workflow is read as text: no YAML dependency, no network.
const yml = readFileSync(new URL("../../.github/workflows/kc-uptime.yml", import.meta.url), "utf8");

test("runs every 15 minutes and on demand", () => {
  assert.match(yml, /^\s*-\s*cron:\s*["']\*\/15 \* \* \* \*["']\s*$/m);
  assert.match(yml, /^\s*workflow_dispatch:\s*$/m);
});

test("stays silent until KC_UPTIME_ENABLED is true", () => {
  assert.match(yml, /^\s*if:\s*\$\{\{\s*vars\.KC_UPTIME_ENABLED\s*==\s*'true'\s*\}\}\s*$/m);
});

test("has no token permissions", () => {
  assert.match(yml, /^permissions:\s*\{\}\s*$/m);
});

test("fetches the exact URL with a 20 s limit", () => {
  assert.match(yml, /curl\b[^\n]*\shttps:\/\/cms\.kingsburycreative\.com\/(\s|$)/m);
  assert.match(yml, /curl\b[^\n]*--max-time 20\b/);
});

test("passes only on 2xx or 3xx", () => {
  assert.match(yml, /^\s*2\?\?\|3\?\?\)\s*exit 0\s*;;/m);
  assert.match(yml, /^\s*\*\)[^\n]*exit 1\s*;;/m);
});
