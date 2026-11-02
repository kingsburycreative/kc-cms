# 104. Admin page redirects instead of throwing (Risky)

## Objective
Opening `/admin` signed out sends the browser to `/sign-in`, and opening it as a signed-in non-admin sends it to `/`. Neither shows the masked "React error #441" page. An admin still sees the admin page. Seen live 2026-11-02 01:04:49 UTC: a leftover collaborator session hit `/admin` right after sign-in.

## Read first
- D:\Dev\htdocs\kc-cms-app\CLAUDE.md and D:\Dev\htdocs\kc-cms-app\.claude\project.md (risky paths: `lib/auth.ts`, `app/api/`; Never list; relative `.ts` imports in `kc/`)
- C:/Users/roban/.claude/pm/traps.md
- D:\Dev\htdocs\kc-cms-app\kc\tests\auth-disabled-paths.test.ts (test style for auth code)

## Start here
Read by the briefer, not run yet.
- `D:\Dev\htdocs\kc-cms-app\lib\admin.ts`: `requireAdminSession()` throws `createHttpError(..., 401)` at line 33 (no user) and `...403` at line 37 (not admin). `hasAdminAccess` (line 20) is `emailVerified === true` plus the email in `ADMIN_EMAILS`. The file imports `@/lib/auth` and `server-only`, so tests cannot load it.
- `D:\Dev\htdocs\kc-cms-app\app\(main)\admin\page.tsx:108`: `await requireAdminSession();` is the first line of the page. `app/error.tsx` then renders the error.
- `D:\Dev\htdocs\kc-cms-app\lib\actions\admin.ts:11,23` also call `requireAdminSession()`; they are server actions and keep the throw. Do not change `requireAdminSession`'s behaviour.
- `D:\Dev\htdocs\kc-cms-app\app\(auth)\sign-in\page.tsx`: a signed-in user is redirected on to `?redirect=` (or `/`). So a signed-in non-admin must NOT be sent to `/sign-in?redirect=/admin`: that loops. Signed-out goes to `/sign-in?redirect=%2Fadmin`; signed-in non-admin goes to `/`.
- Plan: new pure `kc/admin-gate.ts` with a function that takes the user (or null) plus the admin-access result and returns `{kind: "ok"}` or `{kind: "redirect", to}`. In `lib/admin.ts` add `requireAdminPage()` that gets the session as `requireAdminSession` does, calls the pure function, and uses `redirect()` from `next/navigation` for redirect cases. The admin page calls `requireAdminPage()` instead. Check whether a layout or proxy already gates `/admin` (`app/(main)/layout.tsx`) and say what you found.
- Optional, include only if small AND covered by a test: a fresh sign-in drops any existing session cookie before the new session is created (`lib/auth.ts`, `databaseHooks.session` near line 138, `hooks` near line 30). `lib/auth.ts` is a risky path. If it is more than a few lines, or cannot be tested without the network, skip it and say why in result.md.
- Done-test command: `node C:\Users\roban\.claude\bin\project-test.cjs kc/tests/admin-gate.test.ts`

## Files you may touch
- `kc/admin-gate.ts` (new)
- `lib/admin.ts` (upstream: add `requireAdminPage` only)
- `app/(main)/admin/page.tsx` (upstream: the one call on line 108 and its import)
- `kc/tests/admin-gate.test.ts` (new)
- `lib/auth.ts` (only for the optional cookie change, and only if it qualifies)

## Done-test
`kc/tests/admin-gate.test.ts` asserts:
- A signed-out request (no user) gives a redirect to `/sign-in?redirect=%2Fadmin`, and does not throw.
- A signed-in non-admin (wrong email, and right email with `emailVerified` false) gives a redirect to `/`, and does not throw.
- An admin (verified, email in the admin list, case and spacing as `hasAdminAccess` handles them) gives `ok`.
- The admin page file calls `requireAdminPage` and no longer calls `requireAdminSession`; `lib/actions/admin.ts` still calls `requireAdminSession` and it still throws 401 and 403 (read the files as text and assert).
- If the cookie change is included, its own test.
Then the mutation check through the runner (`node C:\Users\roban\.claude\bin\project-test.cjs`): point the non-admin target at `/sign-in`, then make the signed-out case return ok, run the filtered command each time, name the tests that failed, restore, run green. Run `npx tsc --noEmit` once at the end. Never run the full suite.

## Boundaries
No commit, no push, no install, nothing outward. No `package.json` or migration edits. Never read or print `.env`, real `ADMIN_EMAILS` values or any secret; tests use made-up emails. Do not change what `requireAdminSession` throws. `.claude/project.md` Never list applies. No UI built, so no copy skills. A `security-auditor` pass follows this card (the PM runs it).

## Progress
Keep `progress.md` beside this file from your first step, one line per step that changes a file or finishes a unit of work: done, files, next, anything half-written. Already there? You are resuming: read it and check the disk against it first.

## Report
Write `result.md` beside this file, under 200 words: files changed, tests added, the mutation result naming the tests that failed, what you found about other gates on `/admin`, whether the cookie change went in and why. Say what was not done.
