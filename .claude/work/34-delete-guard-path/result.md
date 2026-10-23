# 34 result

Files changed:
- `kc/content-ops.ts`: new pure `isSingleFilePath(content, path)`, true when any `type: "file"` schema's path matches (slashes at either end ignored).
- Files route DELETE: content case refuses installation tokens on a single-file path, same 403 and message, as a separate `if` after `clientMayDelete` so the existing content-ops source test still matches. Media case now uses `isMediaPathAllowed`, same error text.
- Rename route: content case refuses when the old or new path is a single-file path, same error as the `schema.type === "file"` line.

Tests added: `kc/tests/delete-guard-path.test.ts` (5 tests: function true/false cases, and source checks on both routes).

Checks: done-test green, `tsc --noEmit` and `eslint kc` exit 0.

Mutation: `isSingleFilePath` forced to false; "a file schema's path is a single-file path, slashes at the ends ignored" failed (1 fail). Restored, green.

Note: the runner run with a file arg reported 220 tests, so it appears to run the whole kc suite regardless of the filter. Brief's done-test path pointed at the global runner; I used the project copy per standing instructions.

Not done: nothing outstanding.
