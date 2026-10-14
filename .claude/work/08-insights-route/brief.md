# 08. Insights route

## Objective
A server-rendered Insights screen at `app/(main)/[owner]/[repo]/[branch]/insights/page.tsx` shows GA4 cards for a repo whose `owner/repo` appears in a server-side property map, after the same repo-access check other repo pages use. The sidebar shows an "Insights" item only when the map has that repo. No property ID or key material ever reaches the browser or a log.

## Read first
- `D:\Dev\htdocs\kc-cms-app\.claude\project.md` (upstream-merge rules, Never list, test conventions)
- `D:\Dev\htdocs\kc-cms-app\kc\BOARD.md`, the **insights-route** card under Now: it is the spec, follow every point
- `D:\Dev\htdocs\kc-cms-app\kc\insights\token.ts`, `reports.ts`, `cards.ts` and `D:\Dev\htdocs\kc-cms-app\kc\tests\insights.test.ts`
- `D:\Dev\htdocs\kc-cms-app\lib\api-repo-context.ts` (`getRepoReadContext`) and `D:\Dev\htdocs\kc-cms-app\app\(main)\[owner]\[repo]\[branch]\layout.tsx`, `...\settings\page.tsx`: find the existing repo-access check and reuse it
- `D:\Dev\htdocs\kc-cms-app\components\repo\repo-sidebar.tsx`

## Context
- Map file path from env `KC_INSIGHTS_MAP`, key file path from env `KC_GA4_KEY_FILE`. Both read server-side only. Missing env, missing file, malformed JSON or non-numeric ID all mean "not set up", never a throw.
- Put all logic (map parsing, lookup, cache with injectable clock, pagePath trim, error handling) in new pure modules under `kc/insights/` with relative `.ts` imports, so tests load them without Next. The page and sidebar stay thin.
- Error path logs one line with the HTTP status code only: no body, no URL, no token.
- The sidebar gets a boolean from the server; how it gets there is your call, the smallest upstream hook. Say which in result.md.

## Files you may touch
- `D:\Dev\htdocs\kc-cms-app\app\(main)\[owner]\[repo]\[branch]\insights\page.tsx` (new)
- `D:\Dev\htdocs\kc-cms-app\components\repo\repo-sidebar.tsx` (smallest hook)
- `D:\Dev\htdocs\kc-cms-app\app\(main)\[owner]\[repo]\[branch]\layout.tsx` and `D:\Dev\htdocs\kc-cms-app\components\repo\repo-layout.tsx` (only if needed to pass the boolean to the sidebar, smallest hook)
- `D:\Dev\htdocs\kc-cms-app\kc\insights\map.ts` (new)
- `D:\Dev\htdocs\kc-cms-app\kc\insights\route.ts` (new: cache, trim, error handling, card assembly)
- `D:\Dev\htdocs\kc-cms-app\kc\tests\insights-route.test.ts` (new)
- `D:\Dev\htdocs\kc-cms-app\kc\tests\fixtures\` (new fixture files only)
- `D:\Dev\htdocs\kc-cms-app\.claude\work\08-insights-route\result.md` (new)

## Done-test
From the card: tests in `kc/tests/insights-route.test.ts`, fixtures only: map parsing (good, malformed, non-numeric, missing file), lookup by owner/repo, the cache's one-hour expiry with an injected clock, pagePath trimming, and the error path.

Then the full suite passes through the runner (`node C:\Users\roban\.claude\bin\project-test.cjs`), and `npx tsc --noEmit && npx eslint kc` exit 0. Mutation check, through the runner so it is on record: break the new code on purpose, run, name the tests that failed, restore, run again green.

## Boundaries
No commit, no push, no install, nothing outward. No real network calls (inject the fetch). Never read or print a real key, `.env` or secrets file. No `dangerouslySetInnerHTML` or markdown rendering. No property ID read from the request. `project.md`'s Never list applies.

## Report
Write `result.md` beside this file, under 200 words: files changed, tests added, the mutation result naming the tests that failed, and any call made and why. Say what was not done.
