# 02. Uptime: result

Files changed: `.github/workflows/kc-uptime.yml` (new), `kc/tests/uptime.test.ts` (new).

Workflow: cron `*/15 * * * *` plus `workflow_dispatch`, top-level `permissions: {}`, job guarded by `vars.KC_UPTIME_ENABLED == 'true'`, `timeout-minutes: 2`, one `run:` step with `curl --max-time 20 -o /dev/null -w '%{http_code}'`. A `case` exits 0 on `2??|3??` and 1 otherwise. A curl failure (timeout, DNS) becomes code 000, so the step fails. No actions, no checkout.

Tests added (5, text and regex only, no network): the schedule and dispatch, the guard, the empty permissions, the exact URL and 20 s limit, and the 2xx/3xx pass with exit 1 otherwise.

Full suite through the runner: 6/6 pass.

Mutation: changed `--max-time 20` to 30 and `3??` to `4??`. Two tests failed: "fetches the exact URL with a 20 s limit" and "passes only on 2xx or 3xx". Restored the file and the suite went green again.

Not done: `extra_checks` (tsc and eslint) were not run. The workflow has not run on GitHub, and the security-auditor pass on this path is still open.
