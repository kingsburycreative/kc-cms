# 113. Sign-in page builds for production again (job: code)

## Objective
`next build` succeeds. The sign-in page's browser bundle no longer pulls in `node:net`, so the box can deploy main (cards 111 and 112) tonight. A test fails if any module the sign-in page imports reaches a Node built-in again.

## Read first
- D:\Dev\htdocs\kc-cms-app\CLAUDE.md and D:\Dev\htdocs\kc-cms-app\.claude\project.md
- C:\Users\roban\.claude\pm\traps.md

## Context
Deploy of main 0ce33ac failed on the box at 2026-11-26 ~02:40Z: `Error [TurbopackInternalError]: Failed to write app endpoint /(auth)/sign-in/page`, cause `the chunking context (unknown) does not support external modules (request: node:net)`. Nothing was switched; the box still runs 3f0f1de. Full log: D:\Dev\hq\.claude\work\henike-cms-saves\deploy-112.log.
Import chain on origin/main (checked): `components/sign-in.tsx` (client) imports `@/kc/sign-in-error` (card 111) -> `kc/sign-in-error.ts` imports `NOT_INVITED_CODE` from `./invite-gate.ts` -> which imports `OTP_PATHS, emailKey` from `./otp-limit.ts` -> which imports `isIP` from `node:net`. The local suite never builds, so nothing caught it.
Fix shape: move `NOT_INVITED_CODE` (and anything else the client side needs) into a new import-free module, e.g. `kc/invite-code.ts`, and have both `invite-gate.ts` and `sign-in-error.ts` import it from there. Server code keeps its imports. Check every other `kc/` module the sign-in page and its components import for the same problem.
A client still waiting on this: Kirk's saves (card 112) can't reach him until this deploys.

## Start here
- D:\Dev\htdocs\kc-cms-app\components\sign-in.tsx:3-14 (imports; line 14 is `inlineSignInError` from `@/kc/sign-in-error`)
- D:\Dev\htdocs\kc-cms-app\kc\sign-in-error.ts:1 (`import { NOT_INVITED_CODE } from "./invite-gate.ts";`)
- D:\Dev\htdocs\kc-cms-app\kc\invite-gate.ts:1 (`import { OTP_PATHS, emailKey } from "./otp-limit.ts";`)
- D:\Dev\htdocs\kc-cms-app\kc\otp-limit.ts:1 (`import { isIP } from "node:net";`)
- Done-test: `node --test kc/tests/client-imports.test.ts kc/tests/sign-in-error.test.ts` then `npx next build`

## Files you may touch
- `kc/invite-code.ts` (new)
- `kc/invite-gate.ts`
- `kc/sign-in-error.ts`
- `kc/tests/client-imports.test.ts` (new: walks the static import graph of `components/sign-in.tsx` and every `"use client"` module under `kc/` and `components/` it reaches through `@/kc/` or relative imports, and fails on any `node:` import)
- `kc/tests/sign-in-error.test.ts`

## Done-test
`node --test kc/tests/client-imports.test.ts kc/tests/sign-in-error.test.ts` passes, then `npx next build` completes with no error (it may need the env placeholders the build expects; use whatever the repo's existing build docs or CI say, never real secrets). Then the mutation check through `node C:\Users\roban\.claude\bin\project-test.cjs`: put the `./invite-gate.ts` import back in `sign-in-error.ts`, confirm `client-imports.test.ts` fails, restore, green.

## Boundaries
No commit, no push, no install, nothing outward. No package.json, package-lock.json or db/migrations change. No deploy, no ssh. project.md's Never list applies.

## Progress
Keep `progress.md` beside this file from your first step, one line per step that changes a file or finishes a unit of work: done, files, next, anything half-written. Already there? You are resuming: read it and check the disk against it first.

## Report
Write `result.md` beside this file, under 200 words: files changed, tests added, the mutation result naming the tests that failed, whether `next build` passed, and any call made and why. Say what was not done.
