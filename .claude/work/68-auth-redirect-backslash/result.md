# 68 result

Files: new kc/safe-redirect.ts (`isSameOriginPath`), lib/auth-redirect.ts now calls it in one line (relative import `../kc/safe-redirect`, extensionless like lib/auth.ts). New kc/tests/safe-redirect.test.ts: 3 pass cases, 17 refuse cases from the brief.

The helper requires exactly one leading "/", refuses backslashes, whitespace and control characters, and %2f/%5c (any case) in the first segment; then decodes once (a throw refuses) and re-checks.

Tests cover the helper only: node's test runner cannot load lib/auth-redirect.ts because its kc import has no extension. getSafeRedirect is now just `!x ? "/" : isSameOriginPath(x) ? x : "/"`.

Mutation: backslash refusal removed: `refuses "/\\x"` failed. Encoded check removed: `refuses "/%255cx"` failed (single-encoded cases are still caught by the decoded re-check). Restored, green: 463 pass. The runner runs the whole suite even with a path argument.
