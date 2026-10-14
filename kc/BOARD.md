# Board

## Now

- **uptime**: `.github/workflows/kc-uptime.yml`, every 15 minutes, fetches
  `https://cms.kingsburycreative.com/` with a 20 s limit and fails on anything
  but 2xx or 3xx, so GitHub emails Rob (plan step 12). It runs only when the
  repo variable `KC_UPTIME_ENABLED` is `true`, so it stays quiet until the app
  is deployed. `permissions: {}`. Done-test: `node --test kc/tests/uptime.test.ts`
  reads the workflow file and checks the schedule, the guard, the URL and the
  empty permissions.

## Next

- **insights-route**: the Insights screen and its route, after insights-core
  (PR #1) merges and a GA4 property exists to try it on. Needs a schema
  change (a GA4 property ID per repo), which this board parks, so Rob decides
  how. Two hard rules from the audit of insights-core: render every card value
  as plain text, never HTML or markdown, and length-limit `pagePath` before
  it goes into a sentence (anyone can send GA4 a fake page path); and look up
  the property ID on the server from the repo record, only after checking the
  user can open that repo, never from the request. Cache reports for an hour.

## Waiting on Rob

- Run `server/deploy.sh` on the box (the agent's permission check refused a
  production deploy).
- Create the GitHub App (needs his click on GitHub), then its values go in
  `/root/kc-cms-secrets/github-app.env` and `make-env.sh` runs again.
- Enable Actions on this fork: GitHub turns them off on new forks.
- Branding (plan step 9): which KC logo, colours and name on the login screen.
- `ADMIN_EMAILS`: which address he logs in with.
- GA4 property and Google Cloud project under KC's account; B2 signup.
- Merge PR #1 (insights-core): gated and audited, no findings.

## Blocked

- **upstream-watch** (parked, code on branch `wip/01-upstream-watch`): `npx tsc` rejects the `.ts` import paths project.md requires (TS5097). Needs Rob to allow `"allowImportingTsExtensions": true` in the upstream `tsconfig.json`, or another import rule.

## Done
