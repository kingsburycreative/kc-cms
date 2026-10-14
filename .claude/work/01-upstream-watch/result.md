# 01 upstream-watch, round 2

Files: `kc/update/upstream.ts`, `kc/update/check.ts`, `kc/tests/update.test.ts`, `.github/workflows/kc-upstream-sync.yml` (all new, uncommitted).

Fit to brief: unchanged and still matches it. Weekly cron plus `workflow_dispatch`; workflow-level permissions are only `contents: write` and `pull-requests: write`; actions pinned by SHA; values reach `run:` only through `env:`; it pushes `upstream/<tag>` and skips when a PR is already open.

tsc and eslint report nothing in these files.

Fix: the permissions test failed on Windows because the checkout gives the workflow CRLF line endings and the block regex expects `\n`. The test now converts CRLF to LF after reading the file. The workflow is untouched.

Done-test: 23 pass, 0 fail. Full suite through the runner is green.

Mutation: I stopped skipping prereleases and let a release equal to the fork's version count as newer. Two tests failed: "drafts and prereleases are skipped" and "no newer release gives no action". After restoring, everything was green.

Not done: the workflow has not run on GitHub. No commit or push.
