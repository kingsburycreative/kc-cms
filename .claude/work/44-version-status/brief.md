# 44. Version status (Normal)

## Objective
Board card 37 (`.claude/work/39-plan-dashboard/plan.md` card 37). A server-side model that tells the dashboard whether the running CMS is current with upstream Pages CMS releases. No UI, no page wiring, no real network in tests.

## Read first
- `D:\Dev\htdocs\kc-cms-app\.claude\project.md` (relative `.ts` imports in `kc/`, Never list)
- Card 37 in `D:\Dev\htdocs\kc-cms-app\.claude\work\39-plan-dashboard\plan.md` (the spec; follow it exactly)
- `kc/update/upstream.ts` (reuse `newerRelease`; do not change its behaviour)

## Start here
- New `kc/update/status.ts`: `versionStatus(running, releases)` returns `{state: "current"}`, `{state: "behind", tag}` or `{state: "unknown"}`. Prereleases and drafts ignored.
- New `kc/update/status-fetch.ts`: server fetch of `https://api.github.com/repos/hunvreus/pagescms/releases`, `next: { revalidate: 3600 }`, no token. On any failure (non-2xx, thrown fetch, bad JSON, unparseable running version) it returns unknown, logs one warn line with no URL query or header, never throws. Running version read from `package.json` in `process.cwd()`. Make the fetch and the package reader injectable so tests pass fakes.
- Fixtures in `kc/tests/fixtures/releases/`.
- Done-test: `node C:\Users\roban\.claude\bin\project-test.cjs kc/tests/version-status.test.ts`

## Files you may touch
- `D:\Dev\htdocs\kc-cms-app\kc\update\status.ts` (new)
- `D:\Dev\htdocs\kc-cms-app\kc\update\status-fetch.ts` (new)
- `D:\Dev\htdocs\kc-cms-app\kc\tests\version-status.test.ts` (new)
- `D:\Dev\htdocs\kc-cms-app\kc\tests\fixtures\releases\` (new files)
- `D:\Dev\htdocs\kc-cms-app\.claude\work\44-version-status\result.md` and `progress.md` (new)

## Copy
No client-facing text. If you find you need a string a client reads, stop and say so in result.md.

## Done-test
`kc/tests/version-status.test.ts` passes, then `npx tsc --noEmit && npx eslint kc` exit 0. Asserts from fixtures: equal version gives current; a newer stable release gives behind with that tag; prerelease and draft ignored; a 403, a thrown fetch and bad JSON each give unknown and log exactly one line with no URL query or header; a source test finds no real network call in the test file.

Mutation check, through the runner: make a failed fetch return current and name the failure tests that fail; restore and run green.

## Boundaries
No commit, no push, no install, nothing outward. No `package.json`, lock file or `db/migrations/` change. No existing file edited. Keep `progress.md` beside this brief, updated after each step that changes a file.

## Report
`result.md` beside this file, under 200 words: files changed, tests added, the mutation result naming the failing tests, what was not done.
