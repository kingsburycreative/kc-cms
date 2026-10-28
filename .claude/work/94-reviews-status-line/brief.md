# 94. Reviews-status dashboard line (Normal)

Project: D:\Dev\htdocs\kc-cms-app. Read `.claude/project.md` first (Never list, Copy rule, test rules: relative imports with `.ts`, no `@/`).

## Task
Card 02 of `.claude/work/93-plan-reviews-status/plan.md`. Read that card plus "What I found" and "Flags"; they are the spec. Wire `fetchReviewsStatus` and `reviewsLine` from `kc/reviews/` (card 01, done, see `.claude/work/93-reviews-status-fetch/result.md`) into the dashboard: fetched server-side in `kc/dashboard-server.tsx` next to `fetchPublishStatus`, drawn as one line in `kc/dashboard.tsx`. Says where the rating comes from (typed, hidden, live; never claim live more strongly than the file does) and shows a nudge only when `stale` is true. Unknown status or no `kc.site`: draw nothing. Mobile first, server-rendered, no JS needed; React-escaped text only, no `dangerouslySetInnerHTML`.

## Files you may touch
- `kc/dashboard-server.tsx`
- `kc/dashboard.tsx`
- `kc/tests/reviews-status-line.test.ts`
- `app/(main)/[owner]/[repo]/[branch]/page.tsx` (upstream file already in kc/register/customizations.json: one line passing `reviews={<Suspense fallback={<ReviewsSkeleton />}><ReviewsLine {...ref} /></Suspense>}`, plus its imports)
- `kc/dashboard-skeleton.tsx` (add `ReviewsSkeleton`: one text-line block using the `.kc-shimmer` class, same height as the line)
- `kc/tests/dashboard-sections.test.ts` (only to add the new piece to the may-draw-nothing count, if that test requires it)
- `.claude/work/94-reviews-status-line/result.md`
- `.claude/work/94-reviews-status-line/progress.md`

Do not edit `kc/reviews/` or `kc/insights/`.

## Copy
Every visible string is written with the `prose` skill, then run through `avoid-ai-writing` and `humanizer`, and the UI through `avoid-ai-design`, all via the Skill tool. If the Skill tool refuses one, stop and say so in result.md. List each string in result.md.

## Done-test
`node --test kc/tests/reviews-status-line.test.ts` passes, asserting every bullet of plan card 02's done-test; `kc/tests/dashboard-sections.test.ts` and `kc/tests/dashboard.test.ts` still pass. Then the mutation check through the runner `node C:\Users\roban\.claude\bin\project-test.cjs`: break the stale-nudge condition and the key-to-copy mapping one at a time, run, record which tests failed, restore, run green.

## Rules
- Fixtures and injected fetch only, no network.
- Keep `progress.md` beside this brief, updated after each step (done, files touched, next step, anything half-written).
- Do not commit. Write `result.md`: what was built, copy strings, tests added, mutation results.

## Round 2
Round 1 built ReviewsLine but could not wire it because page.tsx was not listed. It now is. Finish the wiring and the skeleton; keep the existing tests green and add one asserting ReviewsSkeleton uses kc-shimmer.
