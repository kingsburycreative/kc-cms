# 112. Open editors stay current: refresh, update banner, merge on clash, longer sign-in (job: risky)

## Objective
A client editing a page never gets a save refused because the file changed underneath them (by us, by another tab, by a PR). The editor keeps its file version current while open, shows a banner when the file changed and they have unsaved edits, merges their edits onto the new version field by field, and on a 409 at save does that merge and saves once more by itself. Sign-in lasts 30 days, renewed on use, and an expired sign-in at save keeps the form and says so plainly. Gmail addresses match invites with or without dots.

## Read first
- D:\Dev\htdocs\kc-cms-app\CLAUDE.md and D:\Dev\htdocs\kc-cms-app\.claude\project.md (upstream files: smallest hook into `kc/`; copy goes through the prose skills; risky paths)
- C:\Users\roban\.claude\pm\traps.md
- D:\Dev\htdocs\kc-cms-app\.claude\work\107-editor-keeps-unsaved-text\brief.md and result.md (why focus refetch was turned off: it wiped unsaved text; do not bring that back)
- D:\Dev\htdocs\kc-cms-app\.claude\work\111-clear-error-messages\result.md (save-error classifier)

## Context
Proven 2026-11-25 from the box's nginx log: client Kirk (Henike) saved home.json on 2026-11-19 19:18Z and got 409, 3.5 hours after a PR outside the CMS rewrote that file. His tab still held the old sha because card 107 set `revalidateOnFocus: false` (components/entry/entry.tsx:241); upstream Pages CMS has it on, which is why stock Pages CMS doesn't strand a tab. Same 409 eleven times on 2026-11-18. He then thought the site "stopped tracking my changes". Nothing told us.
Rob's spec, word for word in intent: when the file changes while the page is open, the editor refreshes it even if the user is on the page; if they have unsaved edits, a banner (not a modal; must not block typing) says the page was updated and offers to load the latest while keeping their changes. Never lose typed text.
Behaviour wanted:
1. While an entry is open: check the file's sha on window focus and every 60 s (a light request; reuse the entry fetch or a sha-only fetch). Unchanged: nothing. Changed and no unsaved edits: load the new version silently. Changed with unsaved edits: show the banner.
2. Banner "Load the latest": fetch the new version, apply the user's edited fields on top (three-way: what they loaded, what's on GitHub now, what they typed). Same field changed both sides: keep the user's text, mark that field, say what changed.
3. Save returns 409 (stale sha, not the protected-branch case card 111 classifies): do the same merge automatically and retry the save once. Second failure: keep the form, plain message.
4. Session: better-auth `session.expiresIn` 30 days, `updateAge` 1 day (rolling). A 401 on save keeps the form and says "You were signed out. Sign in again in a new tab, then press Save." (final wording through the prose skills).
5. Invite check (kc/otp-limit.ts `emailKey` and the invite lookup): for gmail.com and googlemail.com, ignore dots and anything after "+" in the local part, on both sides of the comparison.
6. Close the silent-overwrite path an independent review found (2026-11-25, Fable, proven in code): a reconnect refetch updates the sha in entry.tsx:252-256 while entry-form.tsx:1062-1068 keeps the typed form, so old text saves cleanly over newer content. Never move the sha forward without the baseline the user's edits were made against; route every refresh through the same merge as 1 and 2.
7. Old-tab field list: the editor's field list is fixed at page load, so a tab opened before a `.pages.yml` change drops fields added since (the 2026-11-04 Henike data loss, commit 98ce106). Keep fields present in the file but not in the tab's field list when saving (the intent of 1048ffb, backed out in 46d1e9a; read both and say why it was backed out before reusing it), and reload the field list when the config's sha changes.
8. Save route (app/api/[owner]/[repo]/[branch]/files/[path]/route.ts:255-275): a cache-update error after GitHub has committed is reported as a failed save. Once GitHub has accepted the commit, the response is success; log the cache error.
Put the logic in new `kc/` modules (pure functions, tested): the sha-change decision, the three-way field merge, the gmail normaliser. entry.tsx only calls them.

## Start here
- D:\Dev\htdocs\kc-cms-app\components\entry\entry.tsx:231-260 (useSWR with `revalidateOnFocus: false`; the effect that sets entry and sha; `mutateEntry`)
- D:\Dev\htdocs\kc-cms-app\kc\editor-guard.ts (`cacheAfterSave`; `shouldResetForm` already does part of "don't overwrite edited fields")
- D:\Dev\htdocs\kc-cms-app\kc\save-error.ts (`classifySaveError`: keep protected-branch 409 separate from stale-sha 409)
- D:\Dev\htdocs\kc-cms-app\lib\auth.ts:137-170 (betterAuth config; add session expiresIn/updateAge)
- D:\Dev\htdocs\kc-cms-app\lib\session-server.ts:16 (bare 401)
- D:\Dev\htdocs\kc-cms-app\kc\otp-limit.ts:44 (`emailKey`)
- Done-test command:
  `node --test kc/tests/field-merge.test.ts kc/tests/stale-sync.test.ts kc/tests/email-normalise.test.ts kc/tests/otp-limit.test.ts kc/tests/editor-guard.test.ts kc/tests/save-error.test.ts kc/tests/auth-session.test.ts`

## Files you may touch
- `components/entry/entry.tsx` (upstream file: smallest hook only)
- `components/entry/entry-form.tsx` (upstream file: smallest hook only)
- `app/api/[owner]/[repo]/[branch]/files/[path]/route.ts` (upstream file, risky path: the post-commit cache error only)
- `lib/auth.ts` (upstream file: session options only)
- `lib/session-server.ts` (upstream file: 401 body only, if needed)
- `kc/editor-guard.ts`
- `kc/save-error.ts`
- `kc/otp-limit.ts`
- `lib/collaborator-access.ts` (upstream file: invite lookup uses kc/email-normalise.ts only; added by the coordinator, round 2)
- `kc/tests/invite-gmail.test.ts` (new, round 2)
- `kc/field-merge.ts` (new)
- `kc/stale-sync.ts` (new)
- `kc/email-normalise.ts` (new)
- `kc/components/update-banner.tsx` (new)
- `kc/tests/field-merge.test.ts` (new)
- `kc/tests/stale-sync.test.ts` (new)
- `kc/tests/email-normalise.test.ts` (new)
- `kc/tests/auth-session.test.ts` (new)
- `kc/tests/otp-limit.test.ts`
- `kc/tests/editor-guard.test.ts`
- `kc/tests/save-error.test.ts`

## Done-test
The command in Start here passes, covering at least: unchanged sha does nothing; changed sha with no edits reloads; changed sha with edits shows the banner and never drops typed text; three-way merge keeps both sides on different fields and keeps the user's text on the same field; a stale-sha 409 merges and retries once, a protected-branch 409 does not retry; session config is 30 days rolling; "first.last@gmail.com", "firstlast+x@googlemail.com" and "FirstLast@gmail.com" all match one invite, and non-Gmail addresses keep their dots; a refresh never advances the sha without merging; a save from a tab with an old field list keeps fields it doesn't know; a cache error after a GitHub commit returns success. Then `npx tsc --noEmit && npx eslint kc`. Then the mutation check through `node C:\Users\roban\.claude\bin\project-test.cjs`: break the merge (drop the user's field) and the sha decision, name the tests that fail, restore, green.

## Boundaries
No commit, no push, no install, nothing outward. No package.json, package-lock.json or db/migrations change (park the card if one seems needed). No real network in tests. No deploy, no ssh. project.md's Never list applies. Alerting to Rob on failed saves is card 113, not this one; a structured console.warn on each refused save is fine.

## Progress
Keep `progress.md` beside this file from your first step, one line per step that changes a file or finishes a unit of work: done, files, next, anything half-written. Already there? You are resuming: read it and check the disk against it first.

## Report
Write `result.md` beside this file, under 200 words: files changed, tests added, the mutation result naming the tests that failed, each piece of copy written, and any call made and why. Say what was not done.
