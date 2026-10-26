# 48 result

Files: `kc/publish/status.ts` (new), `kc/publish/status-fetch.ts` (new), `kc/client-view.ts` (optional `pagesProject`), `kc/tests/publish-status.test.ts` (new, 11 tests), `kc/tests/fixtures/deployments/mixed.json` (fake data).

Done-test: runner green (342 pass), `tsc --noEmit` and `eslint kc` exit 0.

Mutation, one run with both breaks: preview counting failed "latest production success ... ignoring a newer preview" and "no production deployment gives unknown"; failed fetch returning published failed "a 403 / a thrown fetch / bad JSON gives unknown and one clean warn line" (plus "fetch success..." which hit the preview break). Restored, rerun green.

Calls: `fetchPublishStatus` takes an optional third `warn` argument so tests capture the line. Missing account/token/project or a bad project name return unknown silently with no call (no warn; it is config, not a failure). Deployments dated after `now` are skipped. Unknown stage status gives unknown. Bad JSON body shape (no `result` array) warns with a second fixed line.

Not done: no UI. Whether the analytics token has Pages read scope is unverified (flag 8).
