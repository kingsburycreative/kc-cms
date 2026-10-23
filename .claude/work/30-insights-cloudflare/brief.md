# 30. Insights with Cloudflare totals and GA4 detail

## Objective
Plan card 25. A site's Insights page takes its totals (visits, page views, top pages) from Cloudflare Web Analytics when the site has a Cloudflare site tag, because that beacon is cookieless and counts everyone, and keeps the detail (cities, channels, engagement) from GA4, labelled "from visitors who allowed analytics". GA4 only: unchanged. Cloudflare only: totals cards, no detail. A Cloudflare failure falls back to GA4 alone, never a thrown page.

## Read first
- `D:\Dev\htdocs\kc-cms-app\.claude\project.md` (risky paths, Never list, Copy rule, relative `.ts` imports in `kc/`)
- `D:\Dev\htdocs\kc-cms-app\.claude\work\15-plan-client-experience\plan.md`, card 25 (the full spec; follow it)
- `D:\Dev\htdocs\kc-cms-app\kc\insights\` (all of it: `reports.ts` cites GA4 docs in comments, `cards.ts` has the sentence rules, `map.ts`, `route.ts`, `token.ts`)
- `D:\Dev\htdocs\kc-cms-app\kc\tests\insights.test.ts`, `insights-route.test.ts` and `kc\tests\fixtures\insights\` (fixture style)
- `D:\Dev\htdocs\kc-cms-app\app\(main)\[owner]\[repo]\[branch]\insights\page.tsx`

## Start here
- `kc/insights/cloudflare.ts` (new): builds the GraphQL body for `https://api.cloudflare.com/client/v4/graphql`, account-scoped, `rumPageloadEventsAdaptiveGroups` filtered by `siteTag` and date range: `sum.visits` and `count` for the last 28 days and the 28 before, top pages by `requestPath`. Parser turns a response into a visits card and a top pages card. `fetch` is passed in. Verify dataset and field names against Cloudflare's schema docs (fetch the docs; if WebFetch gets 401/403 use `mcp__fetch__fetch`) and cite the URLs in a comment. If you cannot confirm a name, say so in result.md instead of guessing silently.
- Token from `process.env.CLOUDFLARE_ANALYTICS_TOKEN`, account from `process.env.KC_CF_ACCOUNT_ID`, server side only, never logged. A failed call logs one line with the status code only. Same one-hour cache as GA4, keyed by site tag.
- `map.ts`: a value may be `{ "ga": "<property id>", "cf": "<site tag>" }`; a bare string still means GA4 only. Drop a non-numeric GA id or an empty site tag.
- Done-test command: `node C:\Users\roban\.claude\bin\project-test.cjs kc/tests/insights-cloudflare.test.ts`

## Files you may touch
- `D:\Dev\htdocs\kc-cms-app\kc\insights\cloudflare.ts` (new)
- `D:\Dev\htdocs\kc-cms-app\kc\insights\map.ts`
- `D:\Dev\htdocs\kc-cms-app\kc\insights\route.ts`
- `D:\Dev\htdocs\kc-cms-app\kc\tests\insights-cloudflare.test.ts` (new)
- `D:\Dev\htdocs\kc-cms-app\kc\tests\fixtures\insights\` (new Cloudflare fixture files only)
- `D:\Dev\htdocs\kc-cms-app\app\(main)\[owner]\[repo]\[branch]\insights\page.tsx` (upstream-path file, named by the card)
- `D:\Dev\htdocs\kc-cms-app\.claude\work\30-insights-cloudflare\result.md` (new)

## Done-test
`node --test kc/tests/insights-cloudflare.test.ts` passes. From fixtures: the request body names the site tag, account and both date ranges; the parser makes a visits card and a top pages card under `cards.ts`'s sentence rules; the map accepts both value shapes and drops a non-numeric GA id or empty site tag; with both sources the loader takes visitors and top pages from Cloudflare and cities, channels, engagement from GA4; a Cloudflare failure leaves the GA4 cards in place; a source test shows the page renders "from visitors who allowed analytics" on GA4 cards only when Cloudflare totals are shown, and no token value reaches a log line. Existing insights tests stay green unchanged. Also `npx tsc --noEmit && npx eslint kc` exit 0.

Mutation check, through the runner so it is on record: make the loader take totals from GA4 when both are present, run the done-test, name the failing tests, restore, run again green. Every run filtered to `kc/tests/insights-cloudflare.test.ts`; never the full suite.

## Context
- Copy rule: the label and any new client-facing text are written with the `prose` skill, then `avoid-ai-writing` and `humanizer`, each invoked with the Skill tool. If the Skill tool refuses one, stop and say so in result.md.
- Risky path (token-bearing outbound call, `kc/insights/`).

## Boundaries
No commit, no push, no install, nothing outward. No real network call in tests (fixtures only); fetching Cloudflare's public docs to check names is fine, calling their API is not. Never read or print a secret or `.env`. No new dependency. `project.md`'s Never list applies.

## Report
Write `result.md` beside this file, under 200 words: files changed, tests added, the mutation result naming the failing tests, copy written, doc URLs cited, any field name not confirmed, and that it was not tried against the live API or seen in a browser.
