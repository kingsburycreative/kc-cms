# 07. Title hook

## Objective
`components/document-title.tsx` stops calling `useConfig()` inside try/catch. It reads the config through a hook that returns null outside a config provider, and the `react-hooks/rules-of-hooks` eslint disable goes. Behaviour unchanged: a client (no GitHub identity) inside a repo sees "<client> Dashboard"; everyone else sees `formatDocumentTitle(title)`.

## Read first
- `D:\Dev\htdocs\kc-cms-app\.claude\project.md` (upstream-merge rules, Never list, test conventions)
- `D:\Dev\htdocs\kc-cms-app\kc\BOARD.md`, the **title-hook** card under Now
- `D:\Dev\htdocs\kc-cms-app\components\document-title.tsx`
- `D:\Dev\htdocs\kc-cms-app\contexts\config-context.tsx`
- Style to match: `D:\Dev\htdocs\kc-cms-app\kc\client-view.ts` and `D:\Dev\htdocs\kc-cms-app\kc\tests\client-view.test.ts`

## Context
- Smallest upstream hook: in `contexts/config-context.tsx`, add one export, `useOptionalConfig` (returns `useContext(ConfigContext)?.config ?? null`). Change nothing else in that file. Put no KC logic there.
- Pure helper in `kc/client-view.ts`, e.g. `documentTitleFor({ config, isClient, title })` returning the string: the client dashboard name when there is a config and the user is a client, else `null` (let the component fall back to `formatDocumentTitle`), or return the final string by taking the formatted fallback as an argument. Your call; say which in result.md. It must not import React or `@/`.
- `document-title.tsx` then calls `useOptionalConfig()` and the helper. No try/catch, no eslint disable.

## Files you may touch
- `D:\Dev\htdocs\kc-cms-app\components\document-title.tsx`
- `D:\Dev\htdocs\kc-cms-app\contexts\config-context.tsx` (one added export only)
- `D:\Dev\htdocs\kc-cms-app\kc\client-view.ts`
- `D:\Dev\htdocs\kc-cms-app\kc\tests\client-view.test.ts`
- `D:\Dev\htdocs\kc-cms-app\.claude\work\07-title-hook\result.md` (new)

## Done-test
`kc/tests/client-view.test.ts` gains tests for the helper: client inside a repo gets "<client> Dashboard" (and the repo-name fallback when `kc.client` is absent); a GitHub user inside a repo gets the page title; no config (outside a repo) gets the page title, for both user kinds.

Then the full suite passes through the runner (`node C:\Users\roban\.claude\bin\project-test.cjs`), and `npx tsc --noEmit && npx eslint kc components/document-title.tsx` exit 0. Mutation check, through the runner so it is on record: break the helper on purpose, run, name the tests that failed, restore, run again green.

## Boundaries
No commit, no push, no install, nothing outward; no real network call in tests. Never edit `package.json`, `package-lock.json`, `db/migrations/`, anything under `app/api/`, `lib/auth.ts`, `lib/crypto.ts`, `lib/token.ts`. Plus `project.md`'s Never list.

## Report
Write `result.md` beside this file, under 200 words: files changed, tests added, the mutation result naming the tests that failed, and any call made and why. Say what was not done.
