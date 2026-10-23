# 32 result

Files changed: `app/api/[owner]/[repo]/[branch]/branches/route.ts` (after the lock and token check, refuses `source !== "user"` and calls `requireOwnRepoPush(user, params.owner, params.repo, ...)`, both before `request.json()` and octokit; existing 403 copy reused), `kc/branch-lock.ts` (decode removed, exact compare), `kc/tests/branch-lock.test.ts` (`feat%2Fx` line now expects false; new `%6Dain` case), new `kc/tests/branch-create-gate.test.ts` (3 tests).

Next params: Next 16.2.1. `node_modules/next/dist/shared/lib/router/utils/route-matcher.js` runs `decodeURIComponent` on every param once, so API routes get `params.branch` decoded and pass that string to GitHub. The lock now compares that string exactly. The layout's own `decodedBranch` (a second decode, upstream code) was left alone: the lock still compares what the layout uses.

Mutation: deleted the `source !== "user"` line; "branches POST refuses a non-user token before reading the body or calling GitHub" failed. Restored, green (215 pass). tsc and eslint kc exit 0.

Note: the runner with two file args still reported 215 tests, so it seems to run the full glob plus the args.

Not done: the layout's double decode is still there.
