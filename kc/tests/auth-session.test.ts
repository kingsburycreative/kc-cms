import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../../lib/auth.ts", import.meta.url), "utf8");

test("sign-in lasts 30 days and renews daily while in use", () => {
  const block = source.match(/\n  session: \{([^}]*)\}/);
  assert.ok(block, "a top-level session block");
  assert.match(block[1], /expiresIn: 60 \* 60 \* 24 \* 30,/);
  assert.match(block[1], /updateAge: 60 \* 60 \* 24,/);
});
