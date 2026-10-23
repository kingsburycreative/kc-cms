# 19. Clients never see a GitHub sign-in

## Objective
The sign-in page shows only the email sign-in by default; the "Sign in with GitHub" button and the "Or" divider appear only at `/sign-in?staff=1`. A new `kc/sign-in-methods.ts` exports `signInMethods({ staff })`: `["email"]` when `staff` is false, `["email", "github"]` when true (and a small helper reading `staff=1` from search params, if useful). `viewFor(isClient)` in `kc/client-view.ts` gains `settings: { connectGithub: !isClient }`; `components/settings/identities.tsx` hides the GitHub row and its Connect button when that flag is false (client = no GitHub identity, read with `useUser()` and `hasGithubIdentity` as `components/about.tsx` does). Staff keep everything. `lib/auth.ts` is untouched: the GitHub provider still works server-side for Rob.

## Read first
- `D:\Dev\htdocs\kc-cms-app\.claude\project.md` (upstream-merge rules, Never list, `kc/` imports use relative `.ts` paths)
- `D:\Dev\htdocs\kc-cms-app\.claude\work\15-plan-client-experience\plan.md`, card 09 and "Wrong or missing" item 8
- `D:\Dev\htdocs\kc-cms-app\kc\client-view.ts` and `kc\tests\client-view.test.ts`: flag shape and test style

## Start here
- `components\sign-in.tsx:23` already has `useSearchParams()`; the GitHub `<Button>` and the "Or" divider are around lines 185-213. Gate both on `signInMethods(...)` including `"github"`. Keep the error-toast handling for GitHub callbacks as is.
- `components\settings\identities.tsx`: the GitHub section; smallest edit.

## Files you may touch
- `D:\Dev\htdocs\kc-cms-app\kc\sign-in-methods.ts` (new)
- `D:\Dev\htdocs\kc-cms-app\kc\client-view.ts`
- `D:\Dev\htdocs\kc-cms-app\kc\tests\sign-in-methods.test.ts` (new)
- `D:\Dev\htdocs\kc-cms-app\kc\tests\client-view.test.ts`
- `D:\Dev\htdocs\kc-cms-app\components\sign-in.tsx`
- `D:\Dev\htdocs\kc-cms-app\components\settings\identities.tsx`
- `D:\Dev\htdocs\kc-cms-app\.claude\work\19-client-signin\result.md` (new)

## Done-test
`node --test kc/tests/sign-in-methods.test.ts kc/tests/client-view.test.ts` passes, run through `node C:\Users\roban\.claude\bin\project-test.cjs` with those files. `signInMethods({ staff: false })` deep-equals `["email"]`, `{ staff: true }` includes `"github"`; `viewFor(true).settings.connectGithub` is false and `viewFor(false)` true; a source test shows `sign-in.tsx` renders the GitHub button only through `signInMethods`, and `identities.tsx` reads `connectGithub`.

Also `npx tsc --noEmit && npx eslint kc` exit 0. Mutation check, through the runner so it is on record: make `signInMethods({ staff: false })` include `"github"`, run the done-test, name the tests that failed, restore, run again green.

## Boundaries
No commit, no push, no install, nothing outward. No real network calls in tests. Never read or print a key or secrets file. No new user-facing text is expected; if you need any, it goes through the `prose` skill then `avoid-ai-writing` and `humanizer` (Skill tool) and is listed in result.md. Smallest edit in each upstream file. Do not run the full suite.

## Report
Write `result.md` beside this file, under 200 words: files changed, tests added, the mutation result naming the tests that failed, any call made and why, and what was not done.
