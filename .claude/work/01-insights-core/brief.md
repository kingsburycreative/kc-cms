# 01. Insights core: GA4 data layer

## Objective
`D:/Dev/htdocs/kc-cms-app/kc/insights/` holds a pure data layer for the Insights cards, no UI and no database: builders for GA4 Data API `runReport` request bodies, a parser turning a response into plain card data (numbers plus a one-line sentence each), and a service-account access-token request signed with `node:crypto` (RS256 JWT) with `fetch` passed in. Tests on fixtures prove it, never the network.

## Read first
- `D:/Dev/htdocs/kc-cms-app/.claude/project.md` (rules, Never list, import style)
- `D:/Dev/htdocs/kc-cms-app/kc/BOARD.md`, the insights-core card
- `D:/Dev/htdocs/kc-cms-app/kc/tests/smoke.test.ts` (test style)
- `D:/Dev/htdocs/kc-cms/PLAN.md`, step 10

## Context
- Cards: visitors (`activeUsers` or `totalUsers`, your call, say which) in the last 28 days against the 28 before (two dateRanges); top 5 pages (`pagePath`); top 5 cities (`city`); visitors by channel; average engagement time. Sentences like "412 visitors, up 18% on the month before".
- `city` and `pagePath` are confirmed. The channel dimension and the duration/engagement metric names are NOT: check them against Google's Data API schema page (https://developers.google.com/analytics/devguides/reporting/data/v1/api-schema) and cite that URL in a comment beside each name. If you cannot fetch it, say so in result.md and do not invent certainty.
- Must handle: a property with no data (empty/missing rows) and a month with zero previous visitors (no divide-by-zero, no "Infinity%"; say something plain like "new this month").
- Token: JWT header `{alg:"RS256",typ:"JWT"}`, claims iss = client_email, scope `https://www.googleapis.com/auth/analytics.readonly`, aud `https://oauth2.googleapis.com/token`, iat/exp (≤1h), POST `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=...`. Accept the key object and `fetch` and a clock as parameters. Tests generate a throwaway RSA key with `crypto.generateKeyPairSync` and verify the signature. Never log or put the private key in an error message.
- Relative imports with `.ts` extensions, never `@/`. No new dependency.

## Files you may touch
- `D:/Dev/htdocs/kc-cms-app/kc/insights/reports.ts` (new)
- `D:/Dev/htdocs/kc-cms-app/kc/insights/cards.ts` (new)
- `D:/Dev/htdocs/kc-cms-app/kc/insights/token.ts` (new)
- `D:/Dev/htdocs/kc-cms-app/kc/tests/insights.test.ts` (new)
- `D:/Dev/htdocs/kc-cms-app/kc/tests/fixtures/insights/` (new, fixture JSON files)
- `D:/Dev/htdocs/kc-cms-app/tsconfig.json` (upstream file, named on purpose: add only `"allowImportingTsExtensions": true` to compilerOptions, nothing else; valid because `noEmit` is on. Needed because `npx tsc --noEmit` fails TS5097 on the `.ts` imports project.md requires.)

## Done-test
`node --test kc/tests/insights.test.ts`, on fixture responses, covering a property with no data and a month with zero previous visitors. Then the full suite passes through the runner (`node C:\Users\roban\.claude\bin\project-test.cjs`), and `npx tsc --noEmit && npx eslint kc` exit 0. Mutation check through the runner: break the new code on purpose, run, name the tests that failed, restore, run again green.

## Boundaries
No commit, no push, no install, nothing outward, no real network calls. Do not touch upstream files, `package.json`, `package-lock.json` or `db/migrations/`. project.md's Never list applies.

## Report
Write `result.md` beside this file, under 200 words: files changed, tests added, the mutation result naming the tests that failed, which GA4 names you confirmed and how, and what was not done.
