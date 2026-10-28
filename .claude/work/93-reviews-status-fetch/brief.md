# 93. Reviews-status fetcher and pure model (Risky)

Project: D:\Dev\htdocs\kc-cms-app. Read `.claude/project.md` first (Never list, test rules: relative imports with `.ts`, no `@/`).

## Task
Card 01 of `.claude/work/93-plan-reviews-status/plan.md`. Read that card and its "What I found" and "Flags" sections; they are the spec. Build the server-side fetcher for a site's `/reviews-status.json` and the pure model that turns it into a source-line key plus a `stale` flag. No UI, no wiring into the dashboard (that is card 02).

## Files you may touch
- `kc/reviews/status.ts`
- `kc/reviews/status-fetch.ts`
- `kc/tests/reviews-status.test.ts`
- `.claude/work/93-reviews-status-fetch/result.md`
- `.claude/work/93-reviews-status-fetch/progress.md`

Import `createCache` from `kc/insights/route.ts` and `siteUrl` patterns from `kc/client-view.ts`; edit neither. Copy the shape of `kc/publish/status-fetch.ts` (injected fetchImpl, never throws, one fixed warn line with no URL).

## Done-test
`node C:\Users\roban\.claude\bin\project-test.cjs` runs only through the runner; for the card itself run `node --test kc/tests/reviews-status.test.ts` and it passes, asserting every bullet in plan card 01's done-test. Then the mutation check through the runner: break the origin reduction, the size cap and the stale boundary one at a time, run, record which tests failed, restore, run green.

## Rules
- Fixtures and injected fetch only, no network.
- Keep `progress.md` beside this brief, updated after each step (done, files touched, next step, anything half-written).
- Do not commit. Write `result.md`: what was built, tests added, mutation results, anything left for the audit (DNS rebinding residual).
