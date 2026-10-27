Files: kc/register/customizations.json, kc/register/customizations.ts, kc/tests/register-customizations.test.ts (all new).

upstreamBase: 6f4e860a35d934406580287e7042e5e111e207a1, from `git merge-base HEAD upstream/main` (local ref, no fetch).

31 entries: every area the brief lists, plus safe-redirect, deps (claims package.json and package-lock.json), client-guides (next.config.mjs, public/guides) and tooling (.claude/**, tsconfig.json, scripts/setup-github-app.mjs, kc/register). Each entry has id, title, files, watch and tests. client-guides has no tests because no kc test covers the guides.

customizations.ts: loadRegister, globToRegExp (`**`/`*`, brackets literal for route folders), claimsOf, unclaimed.

Tests (4): full-sha base; unique ids and every file/test exists; every changed file outside kc/ and kc-* workflows is claimed, and the message lists the unclaimed ones; every file importing kc/ is claimed. The first run caught two unclaimed files, components/collaborators.tsx and components/repo/repo-layout.tsx, which are now claimed.

Mutation: removed the short-url entry. Two tests failed, "every upstream file the fork changed is claimed" (message names proxy.ts) and "every upstream file importing kc/ is claimed". Restored, green (476/476).

Not done: the runner runs the full suite on every call. Whether each file sits under the right feature is my judgement from the kc imports and the diffs.
