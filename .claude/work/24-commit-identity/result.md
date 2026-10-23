# 24 result

Files changed: `kc/commit-identity.ts` (new), `kc/tests/commit-identity.test.ts` (new), `lib/commit-message.ts` (import plus `resolveCommitIdentity` now returns `kcCommitIdentity(...)` after the override branch).

Tests added: 6 (default constant, undefined/null/""/"bogus" give user, app and user kept, import present, default taken from kcCommitIdentity with override branch kept and old `: "app"` fallback gone).

Done-test: passes. `npx tsc --noEmit && npx eslint kc` exit 0.

Mutation: set the default to "app". Failed: "default is user", "unset or unknown values give user". Restored, run green (166 pass, 0 fail).

Calls: used the project runner `.claude/bin/project-test.cjs` (per my instructions) rather than the global path in the brief. The runner ran the whole kc suite despite the file arg (166 tests), all green.

Not done: no copy written; no commit.
