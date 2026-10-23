# 16 result

Files: new `kc/branch-lock.ts` (pure `isBranchAllowed`, `visibleBranches`), new `kc/branch-lock-server.ts` (`assertBranchAllowed`, 403 via cached `getRepoSnapshot`, skips user tokens). Hooked after every `getToken` in the seven listed routes, after `getToken` in `getRepoReadContext`, and in both layouts. Branches POST refuses a user without `githubUsername` (403) before getting a token.

Tests: `kc/tests/branch-lock.test.ts`, 9 tests (pure decision, server helper shape, folder walk requiring the lock after each `getToken`, read-context coverage, branches POST gate, both layouts).

Green: done-test, `tsc --noEmit`, `eslint kc`. Note: the runner ran all 124 tests even with the file argument.

Mutation: removed the first lock call in `files/[path]/route.ts`; failed "every [branch] API route that gets a token applies the lock after each getToken". Restored, 124/124 green.

Calls made:
- The repo layout filters branches after its empty-repo check, so a client is not shown "Empty repository".
- The branch layout has no branch list, so it calls `assertBranchAllowed` there; a client on another branch gets the existing "Access denied" screen.
- A missing default branch counts as a refusal for a client.
- The branch name is URL-decoded before it is compared.

Not done: nothing outstanding.
