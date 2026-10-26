# 58. Dashboard matches the approved mockup (Risky)

## Objective
Board card 60. Take the dashboard to the approved mockup, exactly as `.claude/work/41-plan-dashboard-fix/plan.md` card 60 describes (its "What it does" steps 1 to 10, the section guard, unit tests and mutation check). That plan is the spec; this brief adds the rules.

## Read first
- `D:\Dev\htdocs\kc-cms-app\.claude\project.md` (upstream files, relative `.ts` imports, copy rule, risky paths)
- `.claude/work/41-plan-dashboard-fix/plan.md` (the whole file)
- `.claude/work/39-plan-dashboard/mockup/index.html`, `mockup.css`, `mockup.js`, `desktop-1280.png`
- the files listed below, before editing them

## Files you may touch
- `kc/dashboard.tsx`, `kc/dashboard-server.tsx`, `kc/dashboard-skeleton.tsx`, `kc/dashboard.ts`, `kc/dashboard-visits.ts`
- `kc/insights/chart.tsx`, `kc/insights/map.ts`, `kc/insights/route.ts`, `kc/client-view.ts`
- `kc/publish/status.ts`, `kc/publish/status-fetch.ts`
- `app/(main)/[owner]/[repo]/[branch]/page.tsx` (upstream file, smallest hook)
- `kc/tests/dashboard-sections.test.ts` (new); may extend `kc/tests/dashboard.test.ts`, `kc/tests/dashboard-server.test.ts`, `kc/tests/dashboard-visits.test.ts`, `kc/tests/publish-status.test.ts`, `kc/tests/insights-chart.test.ts`, `kc/tests/insights-route.test.ts`, `kc/tests/insights.test.ts`, `kc/tests/insights-series.test.ts`, `kc/tests/dashboard-mockup.test.ts`
- new files under `kc/` only if a component needs its own file (name each in result.md)
- `.claude/work/58-dashboard-mockup/result.md` and `progress.md`

If a test you need sits in another existing file, say so in result.md instead of touching it.

## Done-test
`node C:\Users\roban\.claude\bin\project-test.cjs kc/tests/dashboard-sections.test.ts kc/tests/dashboard.test.ts kc/tests/dashboard-server.test.ts kc/tests/dashboard-visits.test.ts kc/tests/publish-status.test.ts kc/tests/insights-chart.test.ts kc/tests/insights-route.test.ts` passes, then `npx tsc --noEmit && npx eslint kc` exit 0.

Mutation check through the runner, one at a time, as plan card 60 lists (four mutations); name the failing test for each, restore, run green.

## Copy and design
Every client-facing string goes through the `prose` skill, then `avoid-ai-writing` and `humanizer`, via the Skill tool. UI through `avoid-ai-design`. If the Skill tool refuses one, stop and say so in result.md. Mobile first, `min-width` queries only, 44px targets, no em dash, no comma in an h1 to h3, a skeleton with shimmer for every panel that loads after render (still under `prefers-reduced-motion`).

## Boundaries
No commit, no push, no install, no network (fixtures only). No other upstream file, no `package.json`, lock file or `db/migrations/`. Never read or print a secret or `.env`. Only state and time of publish status, and nothing staff-only, reach a client's payload. Keep `progress.md` beside this brief, updated after each step that changes a file: done so far, files touched, next step, anything half-written.

## Report
`result.md` beside this file, under 300 words: files changed, tests added, the mutation result naming the failing tests, each copy string written, anything left undone.
