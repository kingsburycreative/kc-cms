# 18. No GitHub links or third-party avatars for clients

## Objective
A client (a user without a GitHub identity, `!hasGithubIdentity(user)`) sees no link to github.com anywhere in the six components below, and no browser request goes to `unavatar.io` for anyone. `viewFor(isClient)` gains a `githubLinks` flag (false for a client, true for a GitHub user) and each component reads it to hide its github.com link. Avatars with no GitHub login show initials only; a new `kc/avatar.ts` exports `initialFor({ name, email })`: a set name gives its initials, an empty name gives the email's first letter upper-cased ("kim@example.com" gives "K"), and it never returns "U". KC staff keep their GitHub links and GitHub avatars.

## Read first
- `D:\Dev\htdocs\kc-cms-app\.claude\project.md` (upstream-merge rules, Never list, `kc/` imports use relative `.ts` paths)
- `D:\Dev\htdocs\kc-cms-app\.claude\work\15-plan-client-experience\plan.md`, card 08: the spec
- `D:\Dev\htdocs\kc-cms-app\kc\client-view.ts` and `kc\tests\client-view.test.ts`: the flag shape and test style to match

## Start here
- `kc\client-view.ts` `viewFor`: add a top-level `githubLinks: !isClient`. Existing callers: `components\about.tsx:75`, `components\repo\repo-sidebar.tsx:156`.
- `components\user.tsx:46-55`: drop the `unavatar.io` URL (no image src when there is no `githubUsername`); fallback uses `initialFor`.
- `components\file\file-options.tsx:119`, `fields\core\image\edit-component.tsx:62`, `fields\core\file\edit-component.tsx:68`: hide the "view on GitHub" link when `githubLinks` is false.
- `components\entry\entry-history.tsx:36,62-79,117-131`: no github.com avatar, commit link or "see all on GitHub" link for a client.
- `components\actions\actions-page.tsx:129,694-713,763`: drop the `unavatar.io` fallback, hide commit, profile and run links for a client.
- The user comes from `useUser()` with `hasGithubIdentity` as in `components\about.tsx`.
- `components\repo\repo-dropdown.tsx` stays untouched (nothing imports it).

## Files you may touch
- `D:\Dev\htdocs\kc-cms-app\kc\client-view.ts`
- `D:\Dev\htdocs\kc-cms-app\kc\avatar.ts` (new)
- `D:\Dev\htdocs\kc-cms-app\kc\tests\client-view.test.ts`
- `D:\Dev\htdocs\kc-cms-app\kc\tests\avatar.test.ts` (new)
- `D:\Dev\htdocs\kc-cms-app\components\user.tsx`
- `D:\Dev\htdocs\kc-cms-app\components\file\file-options.tsx`
- `D:\Dev\htdocs\kc-cms-app\fields\core\image\edit-component.tsx`
- `D:\Dev\htdocs\kc-cms-app\fields\core\file\edit-component.tsx`
- `D:\Dev\htdocs\kc-cms-app\components\entry\entry-history.tsx`
- `D:\Dev\htdocs\kc-cms-app\components\actions\actions-page.tsx`
- `D:\Dev\htdocs\kc-cms-app\.claude\work\18-client-third-party\result.md` (new)

## Done-test
`node --test kc/tests/client-view.test.ts kc/tests/avatar.test.ts` passes, run through `node C:\Users\roban\.claude\bin\project-test.cjs` with those files. `viewFor` returns `githubLinks: false` for a client and true for a GitHub user; a source test shows each of the six component files reads the flag (or, for `user.tsx`, builds no `unavatar.io` URL); `initialFor({ name: "", email: "kim@example.com" })` is "K", a set name wins, "U" is never returned; no file in the list contains `unavatar.io`.

Also `npx tsc --noEmit && npx eslint kc` exit 0. Mutation check, through the runner so it is on record: make `viewFor` return `githubLinks: true` for a client, run the done-test, name the tests that failed, restore, run again green.

## Boundaries
No commit, no push, no install, nothing outward. No real network calls in tests. Never read or print a key or secrets file. No new user-facing text; if you find you need any, it goes through the `prose` skill then `avoid-ai-writing` and `humanizer` (Skill tool) and is listed in result.md. Smallest edit in each upstream file. Do not run the full suite.

## Report
Write `result.md` beside this file, under 200 words: files changed, tests added, the mutation result naming the tests that failed, any call made and why, and what was not done.
