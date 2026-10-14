# Board

## Now

- **upstream-watch**: code on branch `wip/01-upstream-watch`, gated once and parked only on the tsconfig line, which is now in main. Rebase it onto main, rerun the gate, and open the PR. Its workflow needs "Allow GitHub Actions to create pull requests" turned on for the repo.

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

- Create the GitHub App (needs his click on GitHub), then its values go in
  `/root/kc-cms-secrets/github-app.env` and `make-env.sh` runs again.
- Branding (plan step 9): which KC logo, colours and name on the login screen.
- `ADMIN_EMAILS`: which address he logs in with.
- GA4 property and Google Cloud project under KC's account; B2 signup.

## Blocked

## Done

- **insights-core**: PR #1, merged.
- **uptime**: PR #3, merged. Stays quiet until the repo variable `KC_UPTIME_ENABLED` is `true`.
