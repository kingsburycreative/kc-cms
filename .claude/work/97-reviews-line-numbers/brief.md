# 97. Reviews line shows the rating (Normal)

Project: D:\Dev\htdocs\kc-cms-app. Read `.claude/project.md` first (Never list, Copy rule, test rules: relative imports with `.ts`, no `@/`).

## Task
Board card **reviews-line-numbers** in `kc/BOARD.md` (Rob, 2026-10-28). The dashboard reviews line (`ReviewsLine` and the `reviews-copy-start`/`-end` block in `kc/dashboard-server.tsx`) says where the rating comes from but not the rating. When the source is `typed`, the line also gives the stars, the review count and the date it was typed, read from the status file, e.g. "5 stars from 24 reviews, typed in by hand on Oct 12." Format the rating plainly (4.8, 5; no trailing .0), singular "review" for a count of 1, the date as a short month and day in English (add the year when it is not the current year), computed from `asOf` in UTC so the test is stable.

- `reviewsLine` in `kc/reviews/status.ts` returns only a key and a flag today. Extend the known case to also carry `rating`, `count` and `asOf` from the validated status (numbers and the ISO date only). Never carry or render the remote `error` field.
- Hidden and live copy unchanged. The six-month stale nudge stays, appended as now.
- `reviewsText` stays pure and inside the copy block, so the test can still cut it out and run it. Numbers rendered as React text only.

## Files you may touch
- `kc/reviews/status.ts`
- `kc/dashboard-server.tsx`
- `kc/tests/reviews-status-line.test.ts`
- `kc/tests/reviews-status.test.ts` (only if an existing assertion on `reviewsLine`'s shape needs the new fields)
- `.claude/work/97-reviews-line-numbers/result.md`
- `.claude/work/97-reviews-line-numbers/progress.md`

## Copy
The typed sentence is written with the `prose` skill, then run through `avoid-ai-writing` and `humanizer`, all via the Skill tool. If the Skill tool refuses one, stop and say so in result.md. List each string in result.md.

## Done-test
`node --test kc/tests/reviews-status-line.test.ts` passes with new tests asserting: a typed status of rating 5, count 24, asOf 2026-10-12 (now 2026-10-28) gives a line containing "5 stars", "24 reviews" and "Oct 12"; rating 4.8 shows "4.8"; count 1 says "1 review"; a typed status carrying an `error` string never shows it; hidden and live text equal their copy unchanged; the stale nudge still appends for an old typed figure. All of `kc/tests/reviews-*.test.ts` still pass. Then the mutation check through the runner `node C:\Users\roban\.claude\bin\project-test.cjs`: break the count in the typed text, then the plural rule, one at a time; run, record which tests failed, restore, run green.

## Rules
- Fixtures only, no network.
- Keep `progress.md` beside this brief, updated after each step (done, files touched, next step, anything half-written).
- Do not commit. Write `result.md`: what was built, copy strings, tests added, mutation results.
