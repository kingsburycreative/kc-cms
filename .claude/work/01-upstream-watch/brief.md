# 01. Weekly upstream release check

## Objective
KC's fork learns each week whether upstream Pages CMS (`hunvreus/pagescms`) has published a newer release. A pure module under `kc/update/` decides that from a list of releases; a GitHub Actions workflow runs it weekly and on demand and, when upstream is ahead, pushes branch `upstream/<tag>` at that tag and opens one PR into `main`, unless such a PR is already open.

## Read first
- `D:\Dev\htdocs\kc-cms-app\.claude\project.md` (rules, Never list, risky paths)
- `D:\Dev\htdocs\kc-cms-app\kc\BOARD.md`, card **upstream-watch**
- `D:\Dev\htdocs\kc-cms-app\kc\tests\smoke.test.ts` (test style)
- `D:\Dev\htdocs\kc-cms-app\package.json` (read only: the fork's `version` field is the fork's version)

## Context
- No `.github/workflows/` folder exists yet; create it.
- KC code imports with relative paths and `.ts` extensions, no `@/` alias, no new dependencies. Hand-roll the semver compare (major.minor.patch, leading `v` allowed, prerelease tags ignored/treated as lower).
- The workflow may run the module with `node` (Node 24 strips types) and use `gh` / `git` already on GitHub runners. Upstream releases come from `gh api repos/hunvreus/pagescms/releases`.
- Permissions exactly `contents: write` and `pull-requests: write`, nothing else, at workflow level. Triggers: `schedule` (weekly cron) and `workflow_dispatch`. No `pull_request_target`, no untrusted input interpolated into `run:` via `${{ }}` (pass values through `env:`). Pin third-party actions by full commit SHA or use none.

## Files you may touch
- `D:\Dev\htdocs\kc-cms-app\kc\update\upstream.ts` (new)
- `D:\Dev\htdocs\kc-cms-app\kc\update\check.ts` (new, optional CLI entry the workflow calls)
- `D:\Dev\htdocs\kc-cms-app\kc\tests\update.test.ts` (new)
- `D:\Dev\htdocs\kc-cms-app\.github\workflows\kc-upstream-sync.yml` (new)

## Done-test
`node --test kc/tests/update.test.ts` passes. It must cover: drafts and prereleases skipped; semver compare (e.g. 2.1.10 > 2.1.9, v-prefix); no newer release gives no action; newer release gives the tag; and it reads the workflow file to check the weekly schedule, `workflow_dispatch`, permissions exactly those two, the `upstream/<tag>` branch and the already-open-PR guard. Fixtures only, no network.
Then the full suite passes through the runner (`node C:\Users\roban\.claude\bin\project-test.cjs`), and the mutation check, run through the runner too: break the new code on purpose, run, name the tests that failed, restore, run again green.

## Boundaries
No commit, no push, no install, nothing outward. Never edit `package.json`, `package-lock.json`, `db/migrations/` or any upstream file. Plus `project.md`'s Never list.

## Report
Write `result.md` beside this file, under 200 words: files changed, tests added, the mutation result naming the tests that failed, and any call made and why. Say what was not done.

## Round 2 (2026-10-14)
The four files above were restored, uncommitted, from branch `wip/01-upstream-watch` onto main, which now has `allowImportingTsExtensions`. Check they still fit the brief, fix anything that fails `npx tsc --noEmit` or `npx eslint kc` in those files, then rerun the done-test and the mutation check through the runner, and rewrite result.md.
