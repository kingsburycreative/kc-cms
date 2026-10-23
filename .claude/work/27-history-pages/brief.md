# 27. History pages with the change shown

## Objective
Plan card 17. Two new in-CMS pages replace every GitHub link in history: a site history page at `/<owner>/<repo>/<branch>/history` (the dashboard's History tile already points there) listing recent edits from card 15's site feed, and an entry history page at `/<owner>/<repo>/<branch>/history/entry?path=<path>&sha=<sha>` that shows what one edit changed, field by field, with the schema's labels. "See all changes" in the editor's history panel points at the in-CMS page, not GitHub. Mobile first: one column at 375 wide, wider layouts from `min-width` queries.

## Read first
- `D:\Dev\htdocs\kc-cms-app\.claude\project.md` (upstream-merge rules, Never list, Copy rule, `kc/` imports use relative `.ts` paths)
- `D:\Dev\htdocs\kc-cms-app\.claude\work\15-plan-client-experience\plan.md`, cards 15, 16, 17, 18
- `D:\Dev\htdocs\kc-cms-app\components\entry\entry-history.tsx` (GitHub links at about lines 41, 86, 142)
- `D:\Dev\htdocs\kc-cms-app\kc\history\site.ts`, `kc\history\ref-check.ts`, `app\api\[owner]\[repo]\[branch]\history\route.ts`, and `app\api\[owner]\[repo]\[branch]\entries\[path]\route.ts` (how an old version is read with `ref`)
- `D:\Dev\htdocs\kc-cms-app\kc\dashboard.ts`, `kc\dashboard.tsx` and `app\(main)\[owner]\[repo]\[branch]\page.tsx` (card 16's pattern for a KC page)
- `C:\personas\cas\memory\design-slop.md` (never ship these)

## Start here
- `kc/history/diff.ts`: pure, no React, no network. Given the old and new content objects and the schema fields, return changed, added and removed fields labelled with the schema's `label` (falling back to the name); nested objects and lists labelled by path (e.g. "Team > 2 > Name"); the body diffed line by line; unchanged fields omitted.
- `kc/history/history-view.tsx`: client components for the site list and the one-edit view, reading the existing API routes (the entry at `sha` and at its parent through `ref`). Author name and date only, no email, no avatar URL from GitHub.
- The two `page.tsx` files render those components; keep them thin.
- `entry-history.tsx`: smallest change. Drop every `github.com` URL (the avatar falls back to initials); each history item and "See all changes" link to the in-CMS pages.
- Done-test command: `node C:\Users\roban\.claude\bin\project-test.cjs kc/tests/history-diff.test.ts`

## Files you may touch
- `D:\Dev\htdocs\kc-cms-app\kc\history\diff.ts` (new)
- `D:\Dev\htdocs\kc-cms-app\kc\history\history-view.tsx` (new)
- `D:\Dev\htdocs\kc-cms-app\kc\tests\history-diff.test.ts` (new)
- `D:\Dev\htdocs\kc-cms-app\kc\tests\fixtures\history-diff\` (new files)
- `D:\Dev\htdocs\kc-cms-app\app\(main)\[owner]\[repo]\[branch]\history\page.tsx` (new)
- `D:\Dev\htdocs\kc-cms-app\app\(main)\[owner]\[repo]\[branch]\history\entry\page.tsx` (new)
- `D:\Dev\htdocs\kc-cms-app\components\entry\entry-history.tsx` (upstream file, named by the card)
- `D:\Dev\htdocs\kc-cms-app\kc\tests\client-view.test.ts` (only to drop `components/entry/entry-history.tsx` from the githubLinks file list near line 68: this card removes every GitHub link from that file, and the new source test checks that)
- `D:\Dev\htdocs\kc-cms-app\.claude\work\27-history-pages\result.md` (new)

## Done-test
`node --test kc/tests/history-diff.test.ts` passes. From fixtures it asserts two content objects give changed, added and removed fields with schema labels; nested objects and lists are labelled by path; the body diffs line by line; unchanged fields are omitted. A source test finds no `github.com` in any file listed above, and that "See all changes" in `entry-history.tsx` points at `/history`. Also `npx tsc --noEmit && npx eslint kc` exit 0.

Mutation check, through the runner so it is on record: make the diff keep unchanged fields, run the done-test, name the tests that failed, restore, run again green.

## Copy and design
Every label, heading and empty line a client reads goes through the `prose` skill, then `avoid-ai-writing` and `humanizer` (Skill tool). Run `avoid-ai-design` on the layout. Check it against `design-slop.md`: no eyebrow labels, no filled-plus-outlined button pair, no beige, no comma in a heading. If the Skill tool refuses one, stop and say so in result.md. A browser check at 375 and 1280 is not possible headless: say so in result.md rather than claim it.

## Boundaries
No commit, no push, no install, nothing outward. Never edit `package.json`, `package-lock.json` or `db/migrations/`. Do not touch `app/api/` or any risky path; if the pages need an API change, stop and say so in result.md. No real network calls in tests. Never read or print a key, `.env` or secrets file. Do not run the full suite.

## Report
Write `result.md` beside this file, under 200 words: files changed, tests added, the mutation result naming the tests that failed, each piece of copy written, any call made and why, and what was not done.
