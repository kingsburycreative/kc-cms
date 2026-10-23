# 23. Name the client when inviting them

## Objective
When KC invites a client, the invite form takes an optional name beside the email(s). It is stored on the invite in one new nullable `name` text column on `collaborator_invite` (Rob approved this migration, plan card 05). When the invited person signs in and the invite is bound to their user, their `user.name` is set from the invite name, but only when their current name is blank. New pure module `kc/invite-name.ts` exports `cleanInviteName(raw)` (trim, empty to null, refuse over 80 characters or any control character) and `nameToApply(current, invited)` (returns the cleaned invite name only when `current` is blank after trimming, otherwise null).

## Read first
- `D:\Dev\htdocs\kc-cms-app\.claude\project.md` (upstream-merge rules, Never list, Copy rule, `kc/` imports use relative `.ts` paths)
- `D:\Dev\htdocs\kc-cms-app\.claude\work\15-plan-client-experience\plan.md`, cards 05 and 13
- `D:\Dev\htdocs\kc-cms-app\db\schema.ts` (`collaboratorInviteTable`, ~line 101) and the latest migration `db/migrations/0012_collaborator_invites.sql` with `meta/`
- `D:\Dev\htdocs\kc-cms-app\lib\collaborator-access.ts` (where an invite is bound at sign-in)
- `D:\Dev\htdocs\kc-cms-app\lib\actions\collaborator.ts` (invite action, ~line 149 onwards)

## Files you may touch
- `D:\Dev\htdocs\kc-cms-app\db\schema.ts` (add `name: text("name")` only)
- `D:\Dev\htdocs\kc-cms-app\db\migrations\` (one new migration plus its `meta/` snapshot and journal entry; generate with `npx drizzle-kit generate --name invite_name`, which needs no database; if it asks for a database or prompts, write the SQL `ALTER TABLE "collaborator_invite" ADD COLUMN "name" text;` and the meta by hand in the same shape as 0012)
- `D:\Dev\htdocs\kc-cms-app\kc\invite-name.ts` (new)
- `D:\Dev\htdocs\kc-cms-app\kc\tests\invite-name.test.ts` (new)
- `D:\Dev\htdocs\kc-cms-app\components\collaborators.tsx`
- `D:\Dev\htdocs\kc-cms-app\lib\actions\collaborator.ts`
- `D:\Dev\htdocs\kc-cms-app\lib\collaborator-access.ts`
- `D:\Dev\htdocs\kc-cms-app\.claude\work\23-invite-name\result.md` (new)

## Done-test
`node --test kc/tests/invite-name.test.ts` passes, run through `node C:\Users\roban\.claude\bin\project-test.cjs` with that file. Unit tests: `nameToApply` returns the invite name for a blank or whitespace current name, null when current is set, null when the invite name is null; `cleanInviteName` trims, gives null for empty, refuses 81 characters and a control character (`\n`, `\u0000`), accepts 80. Source tests: `lib/collaborator-access.ts` sets `name` on the user only through `nameToApply` (no other write of `name`); the migration adds exactly one nullable `name` column to `collaborator_invite`; the invite action stores the name only through `cleanInviteName`. Also `npx tsc --noEmit && npx eslint kc` exit 0.

Mutation check, through the runner so it is on record: make `nameToApply` return the invite name even when current is set, run the done-test, name the tests that failed, restore, run again green.

## Boundaries
No commit, no push, no install, nothing outward, never run `db:migrate` or touch a database. Never edit `package.json` or `package-lock.json`. No real network calls in tests. Never read or print a key, `.env` or secrets file. One name applies to every email in a multi-email invite; an invalid name rejects the whole submission with an error, nothing half-written. The new form label, placeholder and error text are client-facing copy: draft them with the `prose` skill, then run `avoid-ai-writing` and `humanizer`, all via the Skill tool; if the Skill tool refuses one, stop and say so. Smallest edit in each upstream file. Do not run the full suite.

## Report
Write `result.md` beside this file, under 200 words: files changed, tests added, the mutation result naming the tests that failed, each piece of copy written, any call made and why, and what was not done.
