# 111. Clear error messages: sign-in for an unknown address, and a save GitHub refuses (job: risky)

## Objective
Two errors clients see are made clear. (1) Sign-in for an address the CMS doesn't know shows an inline error under the email field, not a toast that vanishes. It stays until the address is edited, and it is tied to the field for screen readers. (2) A save that GitHub refuses because the branch is protected says so plainly and tells the client their text is still on screen. It never says "File has changed since you last loaded it", which is reserved for a real version clash.

## Read first
- `D:\Dev\htdocs\kc-cms-app\CLAUDE.md`, `D:\Dev\htdocs\kc-cms-app\.claude\project.md` (upstream-clean rule, Copy rule, Never list)
- `C:/Users/roban/.claude/pm/traps.md`
- `D:\Dev\htdocs\kc-cms-app\kc\invite-gate.ts` (the EMAIL_NOT_INVITED error from card 109)
- `D:\Dev\htdocs\kc-cms-app\components\sign-in.tsx` (where the error is toasted today)
- `D:\Dev\htdocs\kc-cms-app\app\api\[owner]\[repo]\[branch]\files\[path]\route.ts:353-372` (the 409 handling)
- `D:\Dev\htdocs\kc-cms-app\kc\guide\parts.ts:5` (hello@kingsburycreative.com is the help address used everywhere; there is no help@)

## Context
Rob, 2026-11-18, on the toast "We don't have that address. Use the one your invite went to.": "That is a poor message. Can we do something a bit more best practices and clear?" He approved this shape, "Good enough, do it":
- Inline error under the email box, in red, staying until the address changes; red border on the box; `aria-invalid` and `aria-describedby` on the input.
- Words (final wording through the prose skill, then avoid-ai-writing and humanizer, per project.md; keep the meaning): "There's no account for this email address. Check it for typos, or use the address your invitation was sent to." Then a second line: "Still stuck? Email hello@kingsburycreative.com." with a mailto link, at least 44px tap height.
Save refusal: on 2026-11-18 client Kirk's saves on henike-contracting got a 409 from GitHub because main required a pull request and the kc-cms app wasn't on the bypass list. route.ts only matches "Repository rule violations found" (rulesets). Classic branch protection's wording fell through to "File has changed since you last loaded it", which sent everyone looking in the wrong place. Match classic protection wording too (GitHub returns messages containing "protected branch" and/or "pull request"; find the exact strings in Octokit or GitHub docs and put them in a fixture). Show the client: their change couldn't be saved because of a site setting, their text is still on screen, and to email hello@kingsburycreative.com. Log the raw GitHub message server-side (console.warn with repo and status, no tokens) so KC can see the real cause.

## Start here
- Pure classifier `kc/save-error.ts`: `classifySaveError(status, githubMessage, hadSha)` returns "protected" | "conflict" | "other", with the client message per kind. route.ts calls it in place of the inline checks (upstream: smallest hook).
- Sign-in: `kc/sign-in-error.ts` holds the copy and the mapping from error code to inline message; `components/sign-in.tsx` renders it inline under the field for EMAIL_NOT_INVITED, keeps the toast for others, and clears it on input change.
- Done-test: `node --test kc/tests/save-error.test.ts kc/tests/sign-in-error.test.ts`

## Files you may touch
- `kc/save-error.ts` (new), `kc/tests/save-error.test.ts` (new)
- `kc/sign-in-error.ts` (new), `kc/tests/sign-in-error.test.ts` (new)
- `app/api/[owner]/[repo]/[branch]/files/[path]/route.ts` (upstream: call the classifier)
- `components/sign-in.tsx` (upstream: inline error)
- `kc/invite-gate.ts` and `kc/tests/invite-gate.test.ts` (only if the message moves to sign-in-error.ts)

## Done-test
`node --test kc/tests/save-error.test.ts kc/tests/sign-in-error.test.ts` green. Covers: ruleset 409 is "protected"; classic protected-branch 409 is "protected", never "conflict"; a 409 with sha and a plain conflict message is "conflict"; no sha falls through to "other"; the protected message names hello@kingsburycreative.com and says the text is still there; EMAIL_NOT_INVITED maps to the inline copy with the mailto. Then the mutation check through `node C:\Users\roban\.claude\bin\project-test.cjs`: make classic protection return "conflict", run, name the failing tests, restore, run green. `npx tsc --noEmit` and `npx eslint kc` clean. Plus one 390px screenshot of the sign-in page showing the inline error, from a local dev server, saved in this folder (skip with a reason if a local server isn't workable).

## Boundaries
No commit, no push, no install, nothing outward, no ssh, no DB writes, no real network in tests. No change to package.json or db/migrations. project.md's Never list applies.

## Progress
Keep `progress.md` beside this file from your first step, one line per step that changes a file or finishes a unit of work: done, files, next, anything half-written. Already there? You are resuming: read it and check the disk against it first.

## Report
Write `result.md` beside this file, under 200 words: files changed, tests added, the mutation result naming the failing tests, the exact final copy of both messages and that each went through prose, avoid-ai-writing and humanizer, and the GitHub message strings matched with their source. Say what was not done.
