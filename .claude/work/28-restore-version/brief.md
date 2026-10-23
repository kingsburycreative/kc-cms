# 28. Restore an old version

## Objective
Plan card 18. On the one-edit history page (`kc/history/history-view.tsx`, `EntryHistory`), a "Restore this version" link opens the editor at `?restore=<sha>`. The editor (`components/entry/entry.tsx`) then loads that old version's content into the form while keeping the file's current sha, so the normal Save commits the old content as a new edit through the existing POST. Restore only loads; Save commits. Nothing saves on its own.

## Read first
- `D:\Dev\htdocs\kc-cms-app\.claude\project.md` (upstream-merge rules, Never list, Copy rule, `kc/` imports use relative `.ts` paths)
- `D:\Dev\htdocs\kc-cms-app\.claude\work\15-plan-client-experience\plan.md`, cards 17 and 18
- `D:\Dev\htdocs\kc-cms-app\kc\history\history-view.tsx` and `kc\history\diff.ts` (card 17)
- `D:\Dev\htdocs\kc-cms-app\components\entry\entry.tsx` (sha state near 102 and 249, save near 380 and 628)
- `D:\Dev\htdocs\kc-cms-app\app\api\[owner]\[repo]\[branch]\entries\[path]\route.ts` (how an old version is read with `ref`; read only)
- `C:\personas\cas\memory\design-slop.md`

## Start here
- `kc/history/restore.ts`: pure, no React, no network. `restoreParam(searchParams)` returns a valid sha (hex, 7 to 40 chars) or null. `restoreState(current, old)` takes the current entry data (with its sha) and the old version's entry data and returns `{ sha: current.sha, values: old content as form values }`; never the old sha.
- `entry.tsx`: smallest change. Read `?restore=` only through `restoreParam`, fetch the old version via the existing entries route with `ref`, apply `restoreState`, and mark the form dirty so Save is enabled. A short note above the form says an old version is loaded and Save will keep it. The save path itself is unchanged.
- Done-test command: `node C:\Users\roban\.claude\bin\project-test.cjs kc/tests/history-restore.test.ts`

## Files you may touch
- `D:\Dev\htdocs\kc-cms-app\kc\history\restore.ts` (new)
- `D:\Dev\htdocs\kc-cms-app\kc\tests\history-restore.test.ts` (new)
- `D:\Dev\htdocs\kc-cms-app\kc\history\history-view.tsx`
- `D:\Dev\htdocs\kc-cms-app\components\entry\entry.tsx` (upstream file, named by the card)
- `D:\Dev\htdocs\kc-cms-app\.claude\work\28-restore-version\result.md` (new)

## Done-test
`node --test kc/tests/history-restore.test.ts` passes. It asserts `restoreState` keeps the current sha and returns the old content as form values; `restoreParam` rejects non-hex and wrong-length values; a source test shows `entry.tsx` reads `restore` only through `restoreParam`/`restoreState` and that the save request body still sends the `sha` state as before; `history-view.tsx` links to the editor with `?restore=`. Also `npx tsc --noEmit && npx eslint kc` exit 0.

Mutation check, through the runner so it is on record: make `restoreState` return the old sha, run the done-test, name the tests that failed, restore, run again green.

## Copy and design
Every label and note a client reads goes through the `prose` skill, then `avoid-ai-writing` and `humanizer` (Skill tool). Run `avoid-ai-design` on the link and note. Check against `design-slop.md`: no eyebrow, no filled-plus-outlined pair, no beige, no comma in a heading. If the Skill tool refuses one, stop and say so in result.md. A browser check is not possible headless: say so rather than claim it.

## Boundaries
No commit, no push, no install, nothing outward. Never edit `package.json`, `package-lock.json` or `db/migrations/`. Do not touch `app/api/` or any risky path; if restore needs an API change, stop and say so in result.md. No real network calls in tests. Never read or print a key, `.env` or secrets file. Do not run the full suite.

## Report
Write `result.md` beside this file, under 200 words: files changed, tests added, the mutation result naming the tests that failed, each piece of copy written, any call made and why, and what was not done.
