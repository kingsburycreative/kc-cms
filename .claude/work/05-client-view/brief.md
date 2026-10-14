# 05. Client view

## Objective
A client (a user without a GitHub identity, `hasGithubIdentity` in `lib/authz-shared.ts`) sees "<client> Dashboard" and only their own site's content and media; Rob (GitHub identity) keeps the full view. The client name comes from an optional `kc.client` string in `.pages.yml`, falling back to the repo name with dashes as spaces and words capitalised (`henike-tree-service` gives "Henike Tree Service"). This is UI shaping only; existing access control is unchanged.

## Read first
- `D:\Dev\htdocs\kc-cms-app\.claude\project.md` (upstream-merge rules, Never list, test conventions)
- `D:\Dev\htdocs\kc-cms-app\kc\BOARD.md`, the **client-view** card under Now (the full spec)
- `D:\Dev\htdocs\kc-cms-app\lib\config-schema.ts`, `D:\Dev\htdocs\kc-cms-app\lib\authz-shared.ts`
- `D:\Dev\htdocs\kc-cms-app\components\repo\repo-sidebar.tsx`, `D:\Dev\htdocs\kc-cms-app\components\document-title.tsx`, `D:\Dev\htdocs\kc-cms-app\app\(main)\page.tsx`, `D:\Dev\htdocs\kc-cms-app\components\about.tsx`
- Style to match: `D:\Dev\htdocs\kc-cms-app\kc\brand.ts` and `D:\Dev\htdocs\kc-cms-app\kc\tests\brand.test.ts`

## Context
- KC code under `kc/` imports with relative paths and `.ts` extensions, never `@/`, so `node --test` can load it. Upstream files may import from `kc/` with `@/kc/...`.
- Upstream file edits are the smallest hook into `kc/`: put logic (name fallback, `kc` schema piece, the client-vs-Rob visibility helper) in `kc/client-view.ts` and call it from the upstream files.
- The `kc` schema object is strict: accepts `{ client?: string }`, rejects any other key under `kc`.

## Round 2 (added by the coordinator)
Round 1 left two things undone because `repo-select.tsx` was not on the list; it is now. In `components/repo/repo-select.tsx`, for a client only: (1) when the unfiltered repo list for the account comes back with exactly one repo, `router.replace` to that repo's dashboard (the same href the list's link uses); (2) each repo in the list shows its dashboard name. Decision: the list uses the fallback name (`dashboardName(undefined, repo)`, e.g. "Henike Tree Service Dashboard"), not `kc.client`, because reading each repo's `.pages.yml` from the list would mean a fetch per repo. Rob keeps the list as it is. Put the client-only decisions (redirect or not, label) in pure helpers in `kc/client-view.ts` and test them in `kc/tests/client-view.test.ts`. Keep round 1's work. Overwrite `result.md`.

## Files you may touch
- `D:\Dev\htdocs\kc-cms-app\kc\client-view.ts` (new)
- `D:\Dev\htdocs\kc-cms-app\kc\tests\client-view.test.ts` (new)
- `D:\Dev\htdocs\kc-cms-app\lib\config-schema.ts`
- `D:\Dev\htdocs\kc-cms-app\components\repo\repo-sidebar.tsx`
- `D:\Dev\htdocs\kc-cms-app\components\document-title.tsx`
- `D:\Dev\htdocs\kc-cms-app\app\(main)\page.tsx`
- `D:\Dev\htdocs\kc-cms-app\components\about.tsx`
- `D:\Dev\htdocs\kc-cms-app\components\repo\repo-select.tsx`
- `D:\Dev\htdocs\kc-cms-app\.claude\work\05-client-view\result.md` (new)

## Done-test
`kc/tests/client-view.test.ts` covers the name fallback, the `kc.client` override, the schema accepting `kc.client` and rejecting other keys under `kc`, and a pure helper deciding which sidebar and home pieces a client sees versus Rob.

Then the full suite passes through the runner (`node C:\Users\roban\.claude\bin\project-test.cjs`), and `npx tsc --noEmit && npx eslint kc` exit 0. Mutation check, through the runner so it is on record: break the new code on purpose, run, name the tests that failed, restore, run again green.

## Boundaries
No commit, no push, no install, nothing outward. Never edit `package.json`, `package-lock.json`, `db/migrations/`, or anything under `app/api/`, `lib/auth.ts`, `lib/crypto.ts`, `lib/token.ts`. No change to who can access what on the server; only what is shown. Plus `project.md`'s Never list.

## Report
Write `result.md` beside this file, under 200 words: files changed, tests added, the mutation result naming the tests that failed, and any call made and why. Say what was not done.
