# 42. Dashboard model: quick actions and visits summary (Normal)

## Objective
Board card 35 (`.claude/work/39-plan-dashboard/plan.md` card 35). Pure functions the new dashboard will render: quick actions from the `.pages.yml` config, a one-week visits summary, and a safe site URL. No UI, no page wiring.

## Read first
- `D:\Dev\htdocs\kc-cms-app\.claude\project.md` (relative `.ts` imports in `kc/`, the Copy rule, Never list)
- Card 35 in `D:\Dev\htdocs\kc-cms-app\.claude\work\39-plan-dashboard\plan.md` (the spec; follow it exactly)
- `kc/dashboard.ts`, `kc/client-view.ts`, `kc/insights/series.ts` (import only types from it)
- The mockup's quick actions: `.claude/work/39-plan-dashboard/mockup/index.html`

## Start here
- `kc/dashboard.ts`: add `quickActions(config, ctx)`; keep `recentEdits` and `dashboardTiles` unchanged.
- New `kc/dashboard-visits.ts`: `weekSummary(days)` gives last 7 total, previous 7 total, change, sentence.
- `kc/client-view.ts`: add `siteUrl(kc)`, `https:` only, else null; update the comment that says there is one `kc` key.
- Done-test: `node C:\Users\roban\.claude\bin\project-test.cjs kc/tests/dashboard.test.ts kc/tests/dashboard-visits.test.ts kc/tests/client-view.test.ts`

## Files you may touch
- `D:\Dev\htdocs\kc-cms-app\kc\dashboard.ts`
- `D:\Dev\htdocs\kc-cms-app\kc\dashboard-visits.ts` (new)
- `D:\Dev\htdocs\kc-cms-app\kc\client-view.ts`
- `D:\Dev\htdocs\kc-cms-app\kc\tests\dashboard.test.ts`
- `D:\Dev\htdocs\kc-cms-app\kc\tests\dashboard-visits.test.ts` (new)
- `D:\Dev\htdocs\kc-cms-app\kc\tests\client-view.test.ts`
- `D:\Dev\htdocs\kc-cms-app\.claude\work\42-dashboard-model\result.md` and `progress.md` (new)

## Copy
"Add to <label>", "Upload a PDF", the week sentence, "new" and "No visits yet this week" are client-facing: write them with the `prose` skill, then run them through `avoid-ai-writing` and `humanizer`, each with the Skill tool. If the Skill tool refuses any, stop and say so in result.md. List each string in result.md.

## Done-test
The three test files pass, then `npx tsc --noEmit && npx eslint kc` exit 0. Asserts as card 35 lists: `siteUrl` keeps `https://besciworks.com`, null for `javascript:alert(1)`, `http://...`, empty and missing; `kc.actions` labels win over "Add to"; a BeSciWorks-shaped config gives the three labelled actions plus Upload a PDF, config order, encoded hrefs; none for `file` nodes; no collection gives none; `weekSummary` on 14 known days gives exact totals and percent; previous week zero gives "new", no divide error; all zeros gives "No visits yet this week"; 1 visit is singular. Existing tests in those files keep passing unchanged.

Mutation check, through the runner: drop the `collection` filter and name the failing file-node test; swap the two weeks and name the failing change test; restore and run green.

## Boundaries
No commit, no push, no install, nothing outward. No `package.json`, lock file or `db/migrations/` change. No existing test weakened or removed. Keep `progress.md` beside this brief, updated after each step that changes a file.

## Report
`result.md` beside this file, under 200 words: files changed, tests added, the mutation result naming the failing tests, the copy written and which skills ran, what was not done.
