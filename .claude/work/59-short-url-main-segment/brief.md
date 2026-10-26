# 59. Full-path redirect checks the right segment (Normal)

## Objective
Board card short-url-main-segment (card 54 audit finding A, `.claude/work/56-short-url-audit/result.md`). In `resolveShort`, the full-path branch (`kc/short-url.ts:79`) refuses the redirect when `looksLikeBranch(segments[5])`. The short form's third segment is the full form's segments[4], so the guard is off by one: a full path like `/kingsburycreative/site/main/x/main` redirects to `/site/x/main`, which the short branch then refuses to rewrite (its segments[2] reads as the branch), so the user lands on a 404. Change the index to 4, and add a round-trip test: for every full path the redirect accepts, the short path it gives rewrites back to exactly that full path (query kept).

## Read first
- `D:\Dev\htdocs\kc-cms-app\.claude\project.md` (tests, relative `.ts` imports)
- `kc/short-url.ts`, `kc/tests/short-url.test.ts`
- finding A in `.claude/work/56-short-url-audit/result.md`

## Files you may touch
- `D:\Dev\htdocs\kc-cms-app\kc\short-url.ts`
- `D:\Dev\htdocs\kc-cms-app\kc\tests\short-url.test.ts`
- `D:\Dev\htdocs\kc-cms-app\.claude\work\59-short-url-main-segment\result.md` and `progress.md` (new)

## Done-test
`node C:\Users\roban\.claude\bin\project-test.cjs kc/tests/short-url.test.ts kc/tests/short-url-proxy.test.ts kc/tests/short-url-reserved.test.ts` passes, then `npx tsc --noEmit && npx eslint kc` exit 0. New asserts: `/kingsburycreative/site/main/x/main` gives null (no redirect); `/kingsburycreative/site/main/main` and `/kingsburycreative/site/main/edit/main` likewise give null; and a redirect-then-rewrite round trip over a set of full paths (including ones with `main` at segments 5 and later, and with a query) returns the original full path every time a redirect is given.

Mutation check, through the runner: put the index back to 5; name the tests that fail, restore, run green.

## Boundaries
No commit, no push, no install, no network. No upstream file, no `package.json`, lock file or `db/migrations/`. Never read or print a secret or `.env`. No client-facing copy. Keep `progress.md` beside this brief, updated after each step that changes a file: done so far, files touched, next step, anything half-written.

## Report
`result.md` beside this file, under 200 words: files changed, tests added, the mutation result naming the failing tests, anything left undone.
