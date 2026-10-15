# 10. Insights placeholder labels

## Objective
GA4's placeholder values, `(not set)`, `(other)` and an empty or whitespace-only string, show as "Unknown" in the Insights lists (top pages, top cities, channels), and never become the card's sentence. Each sentence names the top real value, or says there is none known.

## Read first
- `D:\Dev\htdocs\kc-cms-app\.claude\project.md` (upstream-merge rules, Never list, test conventions)
- `D:\Dev\htdocs\kc-cms-app\kc\BOARD.md`, the **insights-labels** card under Now: it is the spec
- `D:\Dev\htdocs\kc-cms-app\kc\insights\cards.ts`, `D:\Dev\htdocs\kc-cms-app\kc\tests\insights.test.ts`
- `D:\Dev\htdocs\kc-cms-app\kc\insights\route.ts` (it trims labels to 80 characters; keep that working with "Unknown")

## Context
- The fix belongs in `listCard` in `cards.ts`: one placeholder check, the label mapped to "Unknown", the sentence built from the first non-placeholder item. A row with a missing dimension value counts as a placeholder too.
- Placeholder rows stay in the list (as "Unknown") with their counts and order unchanged.
- Sentences when every item is a placeholder: cities "Most visitors' towns aren't known yet." (exact, from the card); pages "Your most visited pages aren't known yet."; channels "Most visitors' traffic sources aren't known yet." An empty response keeps its existing sentence.

## Files you may touch
- `D:\Dev\htdocs\kc-cms-app\kc\insights\cards.ts`
- `D:\Dev\htdocs\kc-cms-app\kc\tests\insights.test.ts`
- `D:\Dev\htdocs\kc-cms-app\.claude\work\10-insights-labels\result.md` (new)

## Done-test
For each of the three list cards and each of `(not set)`, `(other)` and `""`: the placeholder shows as "Unknown" in the items; when it is the top row the sentence names the next real value; when every row is a placeholder the sentence is the "aren't known yet" one above. Existing tests still pass unchanged.

Then the full suite passes through the runner (`node C:\Users\roban\.claude\bin\project-test.cjs`), and `npx tsc --noEmit && npx eslint kc` exit 0. Mutation check, through the runner so it is on record: break the new code on purpose, run, name the tests that failed, restore, run again green.

## Boundaries
No commit, no push, no install, nothing outward. No real network calls in tests. Never read or print a key, `.env` or secrets file. `project.md`'s Never list applies.

## Report
Write `result.md` beside this file, under 200 words: files changed, tests added, the mutation result naming the tests that failed, any call made and why. Say what was not done.
