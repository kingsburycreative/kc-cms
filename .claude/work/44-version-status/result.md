# 44 result

Files added: `kc/update/status.ts`, `kc/update/status-fetch.ts`, `kc/tests/version-status.test.ts`, fixtures `newer.json`, `equal.json`, `unstable-only.json` in `kc/tests/fixtures/releases/`. No existing file edited.

Tests added: 11 (current, behind, prerelease/draft ignored, unparseable running version, fetch pass-through, 403, thrown fetch, bad JSON, non-array body, unreadable package.json, source test for no real network).

Mutation: made the unknown helper in `status-fetch.ts` return current. Failed: "a 403 is unknown...", "a thrown fetch...", "bad JSON...", "a non-array body...", "an unreadable running version...". Restored, run green (the runner reports the whole suite, 314 pass).

Calls: `getVersionStatus(deps)` takes `fetchFn`, `readRunning`, `warn`. Log lines use fixed reason text, never the error message, so no URL or header can leak. The runner path in the brief (`~/.claude/bin`) differs from the project copy; I used the project copy.

Not done: `tsc` and `eslint` (extra_checks, left to the gate); no client-facing copy written.
