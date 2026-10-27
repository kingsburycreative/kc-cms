# 67. GitHub sign-in needs a verified email (Risky)

## Objective
A GitHub sign-in is refused unless GitHub's emails list marks the chosen email verified. When the emails list cannot be read (fetch throws, non-ok status, bad JSON), the sign-in is refused too, never falling back to the profile email. The user sees a plain sign-in error, not a crash or a 500.

## Read first
- D:/Dev/htdocs/kc-cms-app/CLAUDE.md and D:/Dev/htdocs/kc-cms-app/.claude/project.md (upstream-file rule, Never list, copy rule)
- D:/Dev/htdocs/kc-cms-app/lib/auth.ts:60-125 (the github provider's getUserInfo)
- One existing kc helper and its test for style, e.g. D:/Dev/htdocs/kc-cms-app/kc/sign-in-methods.ts and its test in kc/tests/

## Start here
- lib/auth.ts:88-107: emails is fetched in a try with an empty catch; `emailVerified` is computed and passed through as false instead of refusing.
- Move the decision into a new pure helper `kc/github-email.ts`, e.g. `pickVerifiedGithubEmail(profileEmail, emails | undefined): string | null` returning the email to use, or null to refuse. Rule: emails undefined or not an array -> null; prefer the entry matching profile.email if verified, else the primary entry if verified; anything unverified -> null.
- In lib/auth.ts the hook is: call the helper; on null, log a warn (no token, no email address in the log) and return null from getUserInfo; else set email and emailVerified: true. Keep the upstream edit to a few lines, kc/ import with a relative path.
- Find in node_modules/better-auth (read only) what a null from getUserInfo does in the callback: confirm it redirects to the error page with an error code rather than throwing. If it would throw or show a raw code, map that code to a plain message where KC's sign-in page shows errors (name the file you touch in result.md; it must be in the list below or stop and report).
- Done-test command: `node C:\Users\roban\.claude\bin\project-test.cjs kc/tests/github-email.test.ts` (if the runner refuses a path argument, use `node --test kc/tests/github-email.test.ts` under it as the other briefs in .claude/work do).

## Files you may touch
- `lib/auth.ts`
- `kc/github-email.ts` (new)
- `kc/tests/github-email.test.ts` (new)
- `kc/sign-in-methods.ts` (only if a plain error message for the refusal belongs there)

## Done-test
`kc/tests/github-email.test.ts` passes, with fixture profiles and emails lists (no network): verified matching email passes; unverified matching email refused; unverified primary refused; emails list undefined (fetch failed) refused; empty list refused; profile email missing but verified primary present passes with the primary.

Mutation check through the runner: make the helper return the profile email when emails is undefined, run, name the tests that failed, restore; then drop the verified check, run, name failures, restore, run green.

## Boundaries
No commit, no push, no install, nothing outward, no real network calls. project.md's Never list applies. Any user-facing error text goes through the prose, avoid-ai-writing and humanizer skills (Skill tool); if refused, stop and report. This repo is public: result.md describes the fix, not an attack.

## Progress
Keep `progress.md` beside this file from your first step, one line per step that changes a file or finishes a unit of work: done, files, next, anything half-written. Already there? You are resuming: read it and check the disk against it first.

## Report
Write `result.md` beside this file, under 200 words: files changed, tests added, the mutation result naming the tests that failed, what better-auth does with a null from getUserInfo, and any call made. Say what was not done.
