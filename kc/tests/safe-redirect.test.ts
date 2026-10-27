import { test } from "node:test";
import assert from "node:assert/strict";
import { isSameOriginPath } from "../safe-redirect.ts";

for (const value of ["/", "/owner/repo/main", "/a?b=c#d"]) {
  test(`passes ${JSON.stringify(value)}`, () => {
    assert.equal(isSameOriginPath(value), true);
  });
}

const refused = [
  "", "//x", "/\\x", "\\x", "/%5cx", "/%5Cx", "/%2fx", "/%2F%2Fx", "/%255cx",
  "/a\tb", "/a\nb", "/a\u0000b", "\t/x", " /x", "https://x", "javascript:x", "/%E0%A4%A",
];
for (const value of refused) {
  test(`refuses ${JSON.stringify(value)}`, () => {
    assert.equal(isSameOriginPath(value), false);
  });
}
