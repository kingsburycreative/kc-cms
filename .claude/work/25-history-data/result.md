# 25 result

Files: new `kc/history/site.ts` (contentPaths, mergeSiteFeed), `kc/history/ref-check.ts` (pure refIsOnBranch, async refOnBranch over compareCommits, base=ref head=branch, errors are false), `app/api/[owner]/[repo]/[branch]/history/route.ts` (session, getToken, assertBranchAllowed, listCommits per content path, limit default 30, max 100), `kc/tests/history-site.test.ts`, `kc/tests/fixtures/history/site-lists.json`. Edited entries `[path]/route.ts`: `ref` query param checked with refOnBranch before getContent, 404 when off-branch.

Tests: 8 added, covering path picking, merge order, dedupe, cap, client settings drop and redaction, refIsOnBranch statuses, compare args, and source checks on both routes. Green; tsc and eslint exit 0.

Note: the runner ran the full glob (174 tests) even with a file arg.

Not done: mutation check. The auto-mode classifier refused the run with refIsOnBranch forced to true ("Security Test Removal"). I restored the code and did not try to get around it. Expected failure: "a ref is readable only when the branch is ahead of it or identical" and "the compare helper..." (diverged case). Rob needs to allow it or run it himself.

No client copy beyond "Not found".
