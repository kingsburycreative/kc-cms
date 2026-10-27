# 68. Same-origin paths only in the auth redirect (Risky)

## Objective
`getSafeRedirect` in lib/auth-redirect.ts returns only a same-origin path. Anything else becomes "/". Today it passes a value starting with a slash then a backslash, which browsers treat as protocol-relative. After this card it refuses: a backslash anywhere; an encoded slash or backslash (%2f, %5c, any case) anywhere in the first path segment; control characters (U+0000 to U+001F, U+007F) or whitespace anywhere; anything not starting with exactly one "/". Ordinary paths with query strings and fragments still pass unchanged.

## Read first
- D:/Dev/htdocs/kc-cms-app/.claude/project.md (upstream-file rule, Never list)
- D:/Dev/htdocs/kc-cms-app/lib/auth-redirect.ts (whole file) and its callers: app/(auth)/auth/redirect/page.tsx, app/(auth)/sign-in/page.tsx, components/sign-in.tsx, components/github-auth-expired.tsx
- One kc helper and its test for style, e.g. kc/github-email.ts and kc/tests/github-email.test.ts

## Start here
- Put the check in a new pure helper `kc/safe-redirect.ts` (e.g. `isSameOriginPath(value: string): boolean`), and make the upstream edit in lib/auth-redirect.ts a one-line call to it, kc/ imported with a relative path.
- Also decode once (decodeURIComponent in a try; a throw means refuse) and re-check the decoded value, so a double-encoded value cannot slip through.
- Done-test command: `node C:\Users\roban\.claude\bin\project-test.cjs kc/tests/safe-redirect.test.ts` (if the runner refuses a path argument, run `node --test kc/tests/safe-redirect.test.ts` under it as other briefs in .claude/work do).

## Files you may touch
- `lib/auth-redirect.ts`
- `kc/safe-redirect.ts` (new)
- `kc/tests/safe-redirect.test.ts` (new)

## Done-test
`kc/tests/safe-redirect.test.ts` passes, testing both the helper and getSafeRedirect (import lib/auth-redirect.ts relatively if the runner loads it; else test the helper alone and say so): `/`, `/owner/repo/main`, `/a?b=c#d` pass unchanged; refused to "/": empty, `//x`, `/\x`, `\x`, `/%5cx`, `/%5Cx`, `/%2fx`, `/%2F%2Fx`, `/%255cx`, a tab, newline or NUL anywhere, a leading space, `https://x`, `javascript:x`, a malformed `%` sequence.

Mutation check through the runner: remove the backslash refusal, run, name the tests that failed, restore; then remove the encoded-character check, run, name failures, restore, run green.

## Boundaries
No commit, no push, no install, nothing outward, no network. project.md's Never list applies. No user-facing copy. This repo is public: result.md describes the fix, not an attack.

## Progress
Keep `progress.md` beside this file from your first step, one line per step that changes a file or finishes a unit of work: done, files, next, anything half-written. Already there? You are resuming: read it and check the disk against it first.

## Report
Write `result.md` beside this file, under 200 words: files changed, tests added, the mutation result naming the tests that failed, any call made, and what was not done.
