# 09 Insights gate: result

Files changed: `kc/insights/gate.ts` (new, pure `canSeeInsights`), `kc/insights/route.ts` (cities and channels now go through `trimRows`), `lib/api-repo-context.ts` (added export `getInsightsAccess`; `getRepoReadContext` untouched), the insights `page.tsx` (denied unless `getInsightsAccess`), the repo `layout.tsx` (sidebar flag also needs `getInsightsAccess`).

Push permission: one extra `repos.get` call, GitHub-login users only. Neither `checkRepoAccess` (caches a boolean, skips the call on a cache hit) nor `getToken` returns permissions, and changing them meant touching files outside the brief.

Calls: login type is "github" when the user has a linked GitHub id. A GitHub-login user with a collaborator row but no push is denied, per the card ("email-login collaborator"). Collaborator means `getToken` returned the installation source, which comes from the existing collaborator-row match for that repo.

Tests added: `kc/tests/insights-gate.test.ts` (admin, push, read-only, email collaborator, stranger); one test in `insights-route.test.ts` for the 80-char trim of cities, channels and pages.

Mutation: gate allowing any GitHub permissions, plus dropping the cities trim, failed "a read-only GitHub user is denied..." and "cities, channel labels and page paths are each cut to 80 characters". Restored: full suite 61/61 green, tsc and eslint exit 0.

Not done: no test of `getInsightsAccess` itself (needs DB and GitHub).
