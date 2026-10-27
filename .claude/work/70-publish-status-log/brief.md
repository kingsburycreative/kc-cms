# 70. Log the HTTP status when the deployments request fails (Normal)

## Objective
`fetchPublishStatus` in kc/publish/status-fetch.ts drops the HTTP status when Cloudflare refuses, so the warn line cannot say whether the token lacks Pages read. After this card a non-ok response warns `publish status unknown: deployments request failed (HTTP <status>)`; a thrown fetch (network error) keeps the old line with no status. The line never holds the token, the URL, the account id or any header.

## Read first
- D:/Dev/htdocs/kc-cms-app/.claude/project.md (Never list)
- kc/publish/status-fetch.ts (whole file) and kc/tests/publish-status.test.ts

## Start here
- Add `status?: number` to the FetchLike response type. Handle `!res.ok` outside the catch (or carry the status out of it) so the status reaches the warn line; only print it when it is an integer.
- Done-test command: `node C:\Users\roban\.claude\bin\project-test.cjs kc/tests/publish-status.test.ts` (if the runner refuses a path argument, follow what other briefs in .claude/work do).

## Files you may touch
- `kc/publish/status-fetch.ts`
- `kc/tests/publish-status.test.ts`

## Done-test
In kc/tests/publish-status.test.ts, with a fake fetch: a 403 response gives state "unknown" and exactly one warn line containing "HTTP 403" and not the token, account id or "api.cloudflare.com"; a thrown fetch gives one warn line with no "HTTP"; existing tests still pass.

Mutation check through the runner: drop the status from the warn line, run, name the tests that failed, restore, run green.

## Boundaries
No commit, no push, no install, nothing outward, no network. No user-facing copy (the warn line is a server log).

## Progress
Keep `progress.md` beside this file from your first step, one line per step that changes a file or finishes a unit of work: done, files, next, anything half-written. Already there? You are resuming: read it and check the disk against it first.

## Report
Write `result.md` beside this file, under 200 words: files changed, tests added, the mutation result naming the tests that failed, and what was not done.
