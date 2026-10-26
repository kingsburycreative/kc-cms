# 43. Search health model (Normal)

## Objective
Board card 36 (`.claude/work/39-plan-dashboard/plan.md` card 36). A pure model that scores a whole site's entries for search health, for the dashboard to render later. No UI, no page wiring, no network.

## Read first
- `D:\Dev\htdocs\kc-cms-app\.claude\project.md` (relative `.ts` imports in `kc/`, Never list)
- Card 36 and flag 4 in `D:\Dev\htdocs\kc-cms-app\.claude\work\39-plan-dashboard\plan.md` (the spec; follow it exactly)
- `kc/seo/rules.ts` (reuse `runChecks` and the single checks; do not change their behaviour)

## Start here
- New `kc/seo/site.ts`: `seoTargets(schemaFields)`, `entryHealth(values)`, `siteHealth(entries, limit)`.
- Counted: title, description, main heading, heading order, image text; the body checks only when a body exists. Advice, not counted: opening answer, reading level. No top-level `title` means "not checked". Cap 200 entries. Returns `{checked, passing, notChecked, fix: [{title, path, name, firstProblem}]}` worst first, at most `limit`, plus the advice per entry.
- Fixtures in `kc/tests/fixtures/seo/`: a BeSciWorks Weekly-shaped entry, a page file, a paper.
- Done-test: `node C:\Users\roban\.claude\bin\project-test.cjs kc/tests/seo-site.test.ts`

## Files you may touch
- `D:\Dev\htdocs\kc-cms-app\kc\seo\site.ts` (new)
- `D:\Dev\htdocs\kc-cms-app\kc\tests\seo-site.test.ts` (new)
- `D:\Dev\htdocs\kc-cms-app\kc\tests\fixtures\seo\` (new files)
- `D:\Dev\htdocs\kc-cms-app\.claude\work\43-seo-site\result.md` and `progress.md` (new)

## Copy
No new client-facing text: `firstProblem` reuses the message `rules.ts` already returns. If you find you need a new string, stop and say so in result.md.

## Done-test
`kc/tests/seo-site.test.ts` passes, then `npx tsc --noEmit && npx eslint kc` exit 0. Asserts: a 55-character title with a 130-character description and clean body passes; a page file with title and description and no body is not failed for a missing body; a paper with no description is "not checked"; a high reading grade alone leaves the entry passing and appears in advice; a body with `# Heading` fails; 250 entries stop at 200; `fix` is capped by `limit` and ordered worst first.

Mutation check, through the runner: count the reading-grade check and name the failing advice test; remove the no-body guard and name the failing page-file test; restore and run green.

## Boundaries
No commit, no push, no install, nothing outward. No `package.json`, lock file or `db/migrations/` change. No existing file edited. Keep `progress.md` beside this brief, updated after each step that changes a file.

## Report
`result.md` beside this file, under 200 words: files changed, tests added, the mutation result naming the failing tests, what was not done.
