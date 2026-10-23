# 25. History data: result

Resumed from `wip/c15-history-data` (fc8da0c). The six code files came over uncommitted: `kc/history/site.ts`, `kc/history/ref-check.ts`, `kc/tests/history-site.test.ts`, `kc/tests/fixtures/history/site-lists.json`, `app/api/[owner]/[repo]/[branch]/history/route.ts` and `app/api/[owner]/[repo]/[branch]/entries/[path]/route.ts`. I made no code changes beyond that.

Mutation check, run through the runner: `refIsOnBranch` was changed to always return true. 2 of 174 tests failed:
- "a ref is readable only when the branch is ahead of it or identical"
- "the compare helper puts the ref as base and the branch as head"

After restoring the code, the run was green (174/174). `npx tsc --noEmit && npx eslint kc` exited 0.

Note: the runner ran the whole suite even though it was given the file argument. The runner was not refused this time.

Not done: nothing is outstanding.
