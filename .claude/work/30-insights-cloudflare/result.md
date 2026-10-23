# 30. Result

Files: `kc/insights/cloudflare.ts` (new), `kc/insights/map.ts`, `kc/insights/route.ts` (new `loadSiteInsights`, `defaultCloudflareCache`; `loadInsights` unchanged), `app/(main)/[owner]/[repo]/[branch]/insights/page.tsx`, `kc/tests/insights-cloudflare.test.ts` (new, 9 tests), `kc/tests/fixtures/insights/cloudflare.json` (new).

Tests: 211 pass, tsc and `eslint kc` clean. The runner ran the whole glob even with the file argument. The existing insights tests pass unchanged.

Mutation: the loader took totals from GA4 when both sources answered. "with both sources, totals come from Cloudflare and detail from GA4" failed. Restored, then 211 green.

Copy: "From visitors who allowed analytics" went through prose, avoid-ai-writing and humanizer with no change.

Docs: I had no WebFetch, so I used curl on Cloudflare's public docs (llms-full.txt). Only the dataset name `rumPageloadEventsAdaptiveGroups` is confirmed, at https://developers.cloudflare.com/data-localization/metadata-boundary/graphql-datasets/. NOT confirmed: `siteTag`, `date_geq`/`date_leq`, `sum.visits`, `count`, `dimensions.requestPath`, `count_DESC` and the `string!`/`Date!` variable types. The comment in cloudflare.ts says to check them by introspection.

Calls: a 200 response carrying GraphQL `errors` counts as a failure. If the env token or account is missing, the loader falls back to GA4 without logging.

Not tried against the live API. Not seen in a browser.
