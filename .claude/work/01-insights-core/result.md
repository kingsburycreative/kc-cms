# Result: insights-core

**Files:** `kc/insights/reports.ts`, `cards.ts`, `token.ts`, `kc/tests/insights.test.ts`, and six fixtures in `kc/tests/fixtures/insights/`.

**Tests added (8):** the request bodies, the visitors sentence ("412 visitors in the last 28 days, up 18% on the month before."), zero previous visitors ("new this month", no Infinity), a property with no data across all cards, the list and engagement cards, an RS256 JWT checked against a throwaway key, and a failed token request whose error leaves the key out. All pass, and so does the full suite (9). eslint is clean.

**Mutation:** I disabled the zero-previous guard. "zero previous visitors says new this month, no Infinity" failed. Restored it and everything passed.

**GA4 names:** I fetched the schema page with curl and found `activeUsers` (used for visitors), `sessionDefaultChannelGroup` and `userEngagementDuration` on it. The URL is cited beside each one. Average engagement time is `userEngagementDuration` / `activeUsers`.

**Round 2, tsc:** the brief now allows it, so I added `"allowImportingTsExtensions": true` to `tsconfig.json` (valid because noEmit is on). `npx tsc --noEmit` and `npx eslint kc` both exit 0 now, and no other tsc errors came up. A rerun through the runner passed 9, failed 0.
