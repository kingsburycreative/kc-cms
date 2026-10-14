# 02. Uptime check workflow

## Objective
A GitHub Actions workflow checks every 15 minutes that `https://cms.kingsburycreative.com/` answers 2xx or 3xx within 20 seconds, and fails otherwise so GitHub emails Rob. It stays silent until the repo variable `KC_UPTIME_ENABLED` is `true`.

## Read first
- `D:\Dev\htdocs\kc-cms-app\.claude\project.md` (rules, Never list, risky paths)
- `D:\Dev\htdocs\kc-cms-app\kc\BOARD.md`, card **uptime**
- `D:\Dev\htdocs\kc-cms-app\kc\tests\smoke.test.ts` (test style)

## Context
- No `.github/workflows/` folder exists yet; create it.
- Triggers: `schedule` with cron `*/15 * * * *`, and `workflow_dispatch`. Job-level `if: ${{ vars.KC_UPTIME_ENABLED == 'true' }}`. Top-level `permissions: {}`. No third-party actions, no checkout; a single `run:` step with `curl` (e.g. `--max-time 20`, `-o /dev/null -w '%{http_code}'`) that exits non-zero unless the code is 2xx/3xx. Set `timeout-minutes` small on the job.
- The test must import only `node:` modules (no imports between `.ts` files: `npx tsc` rejects `.ts` import paths in this repo right now). Parse the YAML with plain string/regex checks, no new dependency.

## Files you may touch
- `D:\Dev\htdocs\kc-cms-app\.github\workflows\kc-uptime.yml` (new)
- `D:\Dev\htdocs\kc-cms-app\kc\tests\uptime.test.ts` (new)

## Done-test
`node --test kc/tests/uptime.test.ts` passes. It reads the workflow file and checks: the 15-minute cron, `workflow_dispatch`, the `KC_UPTIME_ENABLED` guard, the exact URL, the 20 s limit, the 2xx/3xx check, and `permissions: {}`. Fixtures only, no network.
Then the full suite passes through the runner (`node C:\Users\roban\.claude\bin\project-test.cjs`), and the mutation check, run through the runner too: break the workflow on purpose, run, name the tests that failed, restore, run again green.

## Boundaries
No commit, no push, no install, nothing outward. Never edit `package.json`, `package-lock.json`, `db/migrations/` or any upstream file. Plus `project.md`'s Never list.

## Report
Write `result.md` beside this file, under 200 words: files changed, tests added, the mutation result naming the tests that failed, and any call made and why. Say what was not done.
