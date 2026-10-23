# 37. Phone menu on the KC pages, and labelled nested fields in History

## Objective
Board card 26 (`.claude/work/15-plan-client-experience/plan.md` card 26). On a phone the site dashboard, History and Insights pages show the header with the `md:hidden` menu button, so the sidebar can be opened; today they set no header, so `RepoHeader` renders nothing. And the History change view never shows a nested object as raw JSON: every nested value is its own row labelled by path with the schema's labels, down to plain values ("Hero > Breadcrumb label: Privacy").

## Read first
- `D:\Dev\htdocs\kc-cms-app\.claude\project.md` (relative `.ts` imports in `kc/`, no upstream file edits, the Copy rule)
- Card 26 in `D:\Dev\htdocs\kc-cms-app\.claude\work\15-plan-client-experience\plan.md`

## Start here
- `components/repo/repo-layout.tsx:18-33`: `RepoHeader` renders the header and `SidebarTrigger` only when header content is set. Do not edit it.
- `components/repo/repo-header-context.tsx:81` `useOptionalRepoHeader({ header }, { enabled })`; used at `components/media/media-view.tsx:600`.
- New `kc/page-header.tsx`: a `"use client"` component `PageHeader({ title })` that calls `useOptionalRepoHeader({ header: <h1 ...>{title}</h1> })` (memoise the node) and renders null. Import the hook by relative path if the runner needs it; match how other `kc/*.tsx` files import components.
- Render it from `kc/dashboard.tsx` (`Dashboard`, line 16) with "Dashboard", `kc/history/history-view.tsx` (`SiteHistory` line 25 and `EntryHistory` line 93) with "History", and `app/(main)/[owner]/[repo]/[branch]/insights/page.tsx` (server component; render the client component inside it) with "Insights". These three titles are the only new copy, and they are the existing sidebar names.
- `kc/history/diff.ts:14-47`: `compare` only recurses when the schema field has `fields`. When a value is a plain object (or an array of objects) and the schema has no matching nested fields, or has keys the schema does not name, it falls to the raw push and the view prints JSON. Recurse into objects and arrays always: label with the schema field's `label || name` where one matches, else the key itself; list items by number as now. Keep "a list item that appeared or vanished whole is one change" only when it is a plain value; an added object becomes one row per plain value.
- Check how `kc/history/history-view.tsx` formats `before`/`after` values; after this no row value should be an object.
- Done-test: `node C:\Users\roban\.claude\bin\project-test.cjs kc/tests/page-header.test.ts kc/tests/history-diff.test.ts`

## Files you may touch
- `D:\Dev\htdocs\kc-cms-app\kc\page-header.tsx` (new)
- `D:\Dev\htdocs\kc-cms-app\kc\dashboard.tsx`
- `D:\Dev\htdocs\kc-cms-app\kc\history\history-view.tsx`
- `D:\Dev\htdocs\kc-cms-app\kc\history\diff.ts`
- `D:\Dev\htdocs\kc-cms-app\app\(main)\[owner]\[repo]\[branch]\insights\page.tsx` (upstream path named by the card: one import and one element)
- `D:\Dev\htdocs\kc-cms-app\kc\tests\page-header.test.ts` (new)
- `D:\Dev\htdocs\kc-cms-app\kc\tests\history-diff.test.ts`
- `D:\Dev\htdocs\kc-cms-app\kc\tests\dashboard.test.ts`, `history-site.test.ts`, `insights-route.test.ts` (only if a source-text assertion there must follow)
- `D:\Dev\htdocs\kc-cms-app\.claude\work\37-phone-menu-nested-fields\result.md` (new)

## Done-test
`node --test kc/tests/page-header.test.ts kc/tests/history-diff.test.ts` passes. Source tests show the dashboard, History and Insights each render the header component with their title; a diff test turns a new file whose field is an object of strings into one labelled row per string, with no `{` in any value. Add a test for a changed nested object with no `fields` in the schema (labelled by key) and one with schema labels ("Hero > Breadcrumb label"). Existing tests keep passing unweakened. `npx tsc --noEmit && npx eslint kc` exit 0. The 375 browser check is not yours: note it as not done.

Mutation check, through the runner: drop the header component from the dashboard, run the done-test command, name the failing tests, restore, run green. Every run filtered to these test files; never the full suite.

## Boundaries
No commit, no push, no install, nothing outward. No `package.json` or `db/migrations/` change. No real network calls in tests. Never read a secret or `.env`. No client-facing text beyond the three titles. Do not edit `components/` files.

## Report
`result.md` beside this file, under 200 words: files changed, tests added, the mutation result naming the failing tests, copy written, what was not done.
