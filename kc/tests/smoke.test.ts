import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// The fork must keep upstream's licence: MIT requires the notice to travel.
test("upstream MIT licence is still in the fork", () => {
  const licence = readFileSync(new URL("../../LICENSE", import.meta.url), "utf8");
  assert.match(licence, /MIT License/);
});
