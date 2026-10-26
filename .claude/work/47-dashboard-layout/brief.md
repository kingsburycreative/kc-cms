# 47. Dashboard layout and page wiring (Risky)

## Objective
Board card 40 (`.claude/work/39-plan-dashboard/plan.md` card 40). Rebuild the site dashboard to the approved mockup and wire the server panels from card 39 into the branch page, with a server-side access check before any panel reads repo content.

## Read first
- `D:\Dev\htdocs\kc-cms-app\.claude\project.md` (upstream-file rule, relative `.ts` imports in `kc/`, Copy rule, Never list)
- Card 40 and Flags 3, 6, 7 and 8 in `.claude/work/39-plan-dashboard/plan.md` (the spec)
- The mockup: `.claude/work/39-plan-dashboard/mockup/index.html`, `mockup.css`, `mockup.js`, and the 375/1024/1280 screenshots
- `kc/dashboard.tsx`, `kc/dashboard.ts`, `kc/dashboard-visits.ts`, `kc/dashboard-server.tsx`, `kc/dashboard-skeleton.tsx`, `kc/tests/dashboard.test.ts`
- `app/(main)/[owner]/[repo]/[branch]/page.tsx` and where `getRepoReadContext` is defined (grep for it)

## Start here
- `page.tsx` (upstream file, already KC-edited; smallest change): call `getRepoReadContext` first, then render `VisitsPanel`, `SearchHealthPanel` and `VersionLine` each inside `Suspense` with its skeleton as fallback, passed into the dashboard as props. Keep the no-config and redirect branches.
- `kc/dashboard.tsx`: the new layout. Header with site name and the "See live site" link (only when `kc.site` is https, as card 35 gives it); quick actions as one list of quiet tinted links, rendered before the visits panel; recent changes still fetched with `history?limit=`; the old tile grid goes. Mobile first: base styles for the phone, the grid with Tailwind v4 `@container` size variants on the main panel so the chart and tiles stack below about 900px of panel width. No `max-width` query, no `uppercase`, no em dash in copy. Publish status is card 43's; leave a spot, build nothing for it.

## Files you may touch
- `D:\Dev\htdocs\kc-cms-app\kc\dashboard.tsx`
- `D:\Dev\htdocs\kc-cms-app\app\(main)\[owner]\[repo]\[branch]\page.tsx` (upstream file, named here on purpose)
- `D:\Dev\htdocs\kc-cms-app\kc\tests\dashboard.test.ts`
- `D:\Dev\htdocs\kc-cms-app\.claude\work\47-dashboard-layout\result.md` and `progress.md` (new)

## Copy
Any new or changed client-facing text (labels, empty states, aria text) is written with the `prose` skill, then `avoid-ai-writing` and `humanizer`, via the Skill tool. Run `avoid-ai-design` on the layout, and check it against the design-slop list in your instructions (no eyebrow labels, no filled-plus-outlined button pair, no beige, no comma in a headline). If the Skill tool refuses one, stop and say so in result.md. List each string in result.md.

## Done-test
`node C:\Users\roban\.claude\bin\project-test.cjs kc/tests/dashboard.test.ts` passes, then `npx tsc --noEmit && npx eslint kc` exit 0. Source asserts: `page.tsx` calls `getRepoReadContext` before any panel; each panel sits in `Suspense` with its skeleton; `kc/dashboard.tsx` has no `max-width` query and no `uppercase`; quick actions render before the visits panel; the old tile grid class is gone; recent edits still fetch `history?limit=`; no em dash in copy. Keep the existing tests in the file passing unless they assert the old tile grid, which goes.

Mutation check, through the runner: move `getRepoReadContext` below the panels and name the failing order test; restore and run green.

## Boundaries
No commit, no push, no install, no network in tests, nothing outward. No `package.json`, lock file or `db/migrations/` change; no upstream file other than the one page.tsx above. Never read or print a secret or `.env`. Keep `progress.md` beside this brief, updated after each step that changes a file: done so far, files touched, next step, anything half-written.

## Report
`result.md` beside this file, under 200 words: files changed, tests added, the mutation result naming the failing test, copy strings, what was not done (it will not have been seen in a browser; say so).
