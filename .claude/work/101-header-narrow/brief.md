# 101. Header narrow (Normal)

## Objective
On a phone the dashboard page header shows the title ("Dashboard") in full, with "See live site" stacked under it or wrapping below; the title never truncates to nothing and is never squeezed against the link.

## Read first
- D:\Dev\htdocs\kc-cms-app\CLAUDE.md and D:\Dev\htdocs\kc-cms-app\.claude\project.md
- D:\Dev\htdocs\kc-cms-app\kc\page-header.tsx
- D:\Dev\htdocs\kc-cms-app\kc\dashboard.tsx (LiveSiteLink, around line 146, and where PageHeader is used)
- D:\Dev\htdocs\kc-cms-app\components\repo\repo-header-context.tsx and whatever renders the header it holds (upstream; read only unless the fix truly needs it)
- D:\Dev\htdocs\kc-cms-app\kc\tests\page-header.test.ts

## Context
Seen at 500px in session 21. Unchecked guess: the `h1` has `truncate` inside a `min-w-0` box, and the upstream header row that holds it (with the phone menu button) gives it no width, so the title collapses. Find and state the cause before fixing it.

## Start here
- `kc/page-header.tsx`: the h1 class list and the flex row.
- Done-test command: `node C:\Users\roban\.claude\bin\project-test.cjs kc/tests/page-header.test.ts`

## Files you may touch
- `kc/page-header.tsx`
- `kc/dashboard.tsx`
- `kc/tests/page-header.test.ts`
- `components/repo/repo-layout.tsx` (upstream; the fixed h-14 header was the cause, smallest hook: min-h-14 py-2)

## Done-test
Tests in `kc/tests/page-header.test.ts` assert the header markup keeps the title shrinkable but never zero width: no `truncate` without a min width or wrapping (e.g. `break-words`/`min-w-*`), and title and action stack below 768px. Then the mutation check through the runner: break the fix, run the filtered command, name the failing tests, restore, run green. Never run the full suite. Screenshots at 375px (device emulation) and 500px are wanted if you can sign in locally; if you cannot, say so in result.md, do not fake it. UI change: run `avoid-ai-design` with the Skill tool on the result; if refused, say so.

## Boundaries
No commit, no push, no install, nothing outward, no real network calls in tests. project.md's Never list applies.

## Progress
Keep `progress.md` beside this file from your first step, one line per step that changes a file or finishes a unit of work: done, files, next, anything half-written. Already there? You are resuming: read it and check the disk against it first.

## Report
Write `result.md` beside this file, under 200 words: the cause with evidence, files changed, tests added, the mutation result naming the failing tests, whether screenshots were taken. Say what was not done.
