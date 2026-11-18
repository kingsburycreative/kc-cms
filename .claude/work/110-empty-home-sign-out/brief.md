# 110. Empty home page says who you are and lets you sign out (job: code)

## Objective
The "No repositories yet" page shows which address the person is signed in as, and has a visible "Sign out" button right there, so someone who signed in with the wrong address can see it and fix it themselves. Today the only sign-out is inside the small avatar menu at the top right, and a client (Kirk, Henike, 2026-11-18) could not find it. Rob: "that's a priority."

## Read first
- `D:\Dev\htdocs\kc-cms-app\CLAUDE.md`, `D:\Dev\htdocs\kc-cms-app\.claude\project.md` (upstream-clean rule, Copy rule, Never list)
- `C:/Users/roban/.claude/pm/traps.md`
- `D:\Dev\htdocs\kc-cms-app\app\(main)\page.tsx:94-105` (the empty state)
- `D:\Dev\htdocs\kc-cms-app\components\user.tsx:32-98` (useUser, signOut then `window.location.assign("/sign-in")`, the pattern to reuse)
- `D:\Dev\htdocs\kc-cms-app\components\invite-sign-in.tsx:160-180` (an existing inline Sign out button to match)

## Context
Kirk invited under one Gmail address, signed in with another, got a brand-new empty account and this page, and was stuck. The new copy says, in plain words: you are signed in as <email>; if your invite went to a different address, sign out and sign in with that one. Final words through the prose skill, then avoid-ai-writing and humanizer, per project.md. One action on the page (the Sign out button), no second button beside it.

## Start here
- New client component `kc/empty-home-account.tsx` (or under components/ if kc/ can't hold a client component in this build; say which in result.md): shows the email from `useUser()` and a Sign out button using the same `signOut()` then `window.location.assign("/sign-in")` as user.tsx. Keep the decision of what text to show in a pure function in `kc/empty-home-copy.ts` so it can be tested under node --test.
- `app/(main)/page.tsx`: render it inside the existing `<Empty>` after `EmptyHeader` (upstream file: one import, one element).
- Done-test: `node --test kc/tests/empty-home-copy.test.ts`

## Files you may touch
- `kc/empty-home-copy.ts` (new)
- `kc/empty-home-account.tsx` (new) or `components/empty-home-account.tsx` (new), one of them
- `kc/tests/empty-home-copy.test.ts` (new)
- `app/(main)/page.tsx` (upstream: one import, one element)

## Done-test
`node --test kc/tests/empty-home-copy.test.ts` green: the copy names the signed-in email; it handles a missing name; it never shows an empty "signed in as". Then the mutation check through `node C:\Users\roban\.claude\bin\project-test.cjs`: drop the email from the copy, run, name the failing tests, restore, run green. `npx tsc --noEmit` and `npx eslint kc` clean. Plus one phone-width (390px) screenshot of the page signed in as an account with no repos, on a local dev server, saved in this folder.

## Boundaries
No commit, no push, no install, nothing outward, no ssh, no DB writes. No change to package.json or db/migrations. project.md's Never list applies.

## Progress
Keep `progress.md` beside this file from your first step, one line per step that changes a file or finishes a unit of work: done, files, next, anything half-written. Already there? You are resuming: read it and check the disk against it first.

## Report
Write `result.md` beside this file, under 200 words: files changed, tests added, the mutation result naming the failing tests, the exact copy and that it went through prose, avoid-ai-writing and humanizer, and the screenshot path. Say what was not done.
