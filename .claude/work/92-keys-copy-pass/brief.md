# 92. Staff strings in the analytics IDs editor get a copy pass (Risky)

## Objective
The staff-facing strings in `kc/insights/keys.ts` (lines 22-40: NOT_ADMIN, NOT_STAFF, the TAKEN set, NOT_SAVED, the BAD_ID set, savedText) were written by hand in card 80. Run them through the `prose` skill, then `avoid-ai-writing`, then `humanizer`, each invoked with the Skill tool. Change only string values. Keep the meaning exact: the rules in BAD_ID must still describe what the validators accept (check `gaId`, `siteTag`, `pagesProject`; the Cloudflare tag allows letters, digits, dash and underscore since card 80, so the current text is wrong there). savedText keeps its three values. If the Skill tool refuses any of the three skills, stop and say so in result.md.

## Read first
- .claude/project.md (Copy rule, risky paths)
- The keys-copy-pass entry in kc/BOARD.md
- kc/insights/keys.ts and the validators it imports
- kc/tests/insights-keys.test.ts

## Files you may touch
- `kc/insights/keys.ts` (string values only, no logic)
- `kc/tests/insights-keys.test.ts` (only assertions on these strings, plus one new test that the Cloudflare BAD_ID text names underscores)
- `.claude/work/92-keys-copy-pass/result.md`, `progress.md`

## Done-test
`kc/tests/insights-keys.test.ts` passes, including a test asserting the new BAD_ID.cf text mentions underscores. Mutation check through the runner: put the old BAD_ID.cf text back; that test fails; restore.

At the end, each exit 0 on the final tree:
- `node C:\Users\roban\.claude\bin\project-test.cjs kc/tests/insights-keys.test.ts`
- `npx tsc --noEmit`, `npx eslint kc`

result.md lists every string old and new.

## Boundaries
No commit, no push, no npm install, no package.json edits, no network in tests, no .env. No logic change in keys.ts.

## Progress
Keep `progress.md` beside this file from your first step, one line per step that changes a file or finishes a unit of work: done, files, next, anything half-written. Already there? You are resuming: read it and check the disk against it first.
