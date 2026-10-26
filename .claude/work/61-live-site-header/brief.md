# 61. "See live site" sits in the top bar, right (Normal)

## Objective
Board card live-site-header. Rob, 2026-10-26, with a screenshot of the dashboard: "the live site link should be in the header, top right." Today `kc/dashboard.tsx` (around line 104-111) renders `<PageHeader title="Dashboard" />`, then a second `<header>` with the client `<h1>` and `<LiveSiteLink site={site} />` on the right below it. Move `LiveSiteLink` into the top bar that `PageHeader` draws (the bar with "Dashboard" on the left), right-aligned, the same place the Collaborators page puts its "Invite" button. The `<h1>` client name and the publish slot stay where they are. If `PageHeader` has no right-side slot, add an optional one (other pages unchanged) or reuse the slot the Collaborators page uses; find it in the source, do not guess.

On a phone (375px) the link stays visible in the top bar, does not wrap the title, keeps a 44px target, and nothing scrolls sideways. Nothing renders in the slot when `siteUrl(object.kc)` gives no site.

## Read first
- `D:\Dev\htdocs\kc-cms-app\.claude\project.md`
- `kc/dashboard.tsx`, whatever file defines `PageHeader`, and the Collaborators page header (`app/(main)/[owner]/[repo]/[branch]/collaborators/page.tsx` and `components/collaborators.tsx`)
- the dashboard tests under `kc/tests/` that render the header

## Files you may touch
- `D:\Dev\htdocs\kc-cms-app\kc\dashboard.tsx`
- `D:\Dev\htdocs\kc-cms-app\kc\page-header.tsx` (defines `PageHeader`; optional right slot only)
- `D:\Dev\htdocs\kc-cms-app\kc\tests\dashboard.test.ts`
- `D:\Dev\htdocs\kc-cms-app\kc\tests\page-header.test.ts`
- `D:\Dev\htdocs\kc-cms-app\kc\tests\dashboard-sections.test.ts` (only the line-ending fix: line 123 splits on "\n" and a CRLF checkout leaves "\r" before `$`)
- `D:\Dev\htdocs\kc-cms-app\.claude\work\61-live-site-header\result.md` and `progress.md` (new)

## Done-test
The dashboard tests pass through `node C:\Users\roban\.claude\bin\project-test.cjs <the dashboard test files>`, then `npx tsc --noEmit && npx eslint kc components` exit 0. New asserts: the live-site link renders inside the PageHeader bar (not inside the dashboard's own `<header>`), with `target="_blank"` and `rel` including `noopener`; it is absent when there is no site; the client `<h1>` is still rendered once.

Mutation check, through the runner: put `<LiveSiteLink>` back in the dashboard `<header>`; name the tests that fail, restore, run green.

## Boundaries
No commit, no push, no install, no network. No upstream file beyond `PageHeader`'s optional slot, no `package.json`, lock file or `db/migrations/`. Never read or print a secret or `.env`. Keep `progress.md` beside this brief, updated after each step that changes a file: done so far, files touched, next step, anything half-written.

## Report
`result.md` beside this file, under 200 words: files changed, tests added, the mutation result naming the failing tests, anything left undone.
