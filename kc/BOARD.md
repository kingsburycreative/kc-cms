# Board

## Now

- **insights-core**: the GA4 data layer for Insights (plan step 10), with no UI
  and no database. In `kc/insights/`: build the Data API `runReport` request
  bodies for the cards (visitors in the last 28 days against the 28 before,
  top 5 pages, top 5 cities, visitors by channel, average engagement time),
  turn a response into plain card data (numbers plus a one-line sentence each,
  like "412 visitors, up 18% on the month before"), and sign a service
  account's access token request with `node:crypto` (RS256 JWT, no new
  dependency), with `fetch` passed in so tests never touch the network. Check
  every dimension and metric name against Google's Data API schema page and
  name the page in a comment; `city` and `pagePath` are already confirmed,
  the channel and duration names are not. Done-test:
  `node --test kc/tests/insights.test.ts`, on fixture responses, covering a
  property with no data and a month with zero previous visitors.

## Next

- **upstream-watch**: the weekly upstream check (plan step 8, first half). In
  `kc/update/`: compare the fork's version with upstream's latest release
  (skip drafts and prereleases, compare as semver). A workflow
  `.github/workflows/kc-upstream-sync.yml` (weekly and on demand) that, when
  upstream has a newer release, pushes branch `upstream/<tag>` at that tag and
  opens one PR into `main`, unless one is already open. Least permissions:
  `contents: write` and `pull-requests: write` only. Done-test:
  `node --test kc/tests/update.test.ts`.
- **uptime**: `.github/workflows/kc-uptime.yml`, every 15 minutes, fetches
  `https://cms.kingsburycreative.com/` with a 20 s limit and fails on anything
  but 2xx or 3xx, so GitHub emails Rob (plan step 12). It runs only when the
  repo variable `KC_UPTIME_ENABLED` is `true`, so it stays quiet until the app
  is deployed. `permissions: {}`. Done-test: `node --test kc/tests/uptime.test.ts`
  reads the workflow file and checks the schedule, the guard, the URL and the
  empty permissions.

## Waiting on Rob

- Run `server/deploy.sh` on the box (the agent's permission check refused a
  production deploy).
- Create the GitHub App (needs his click on GitHub), then its values go in
  `/root/kc-cms-secrets/github-app.env` and `make-env.sh` runs again.
- Enable Actions on this fork: GitHub turns them off on new forks.
- Branding (plan step 9): which KC logo, colours and name on the login screen.
- `ADMIN_EMAILS`: which address he logs in with.
- GA4 property and Google Cloud project under KC's account; B2 signup.

## Blocked

## Done
