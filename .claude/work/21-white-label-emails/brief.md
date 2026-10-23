# 21. White-label the three emails

## Objective
The invite, login and collaborator-added emails read as Kingsbury Creative, not Pages CMS or GitHub. New `kc/email.ts` exports `withSenderName(from)`: a bare address becomes `Kingsbury Creative <address>`; a From that already has a display name is returned unchanged. `lib/mailer.ts` applies it to the From. Invite and collaborator-added subjects use the site's `kc.client` name (read server-side with `getConfig`, falling back to `clientName()` from `kc/client-view.ts`) and never contain `owner/repo`. The three templates drop `invitedByUrl`, every `github.com` link and "Pages CMS".

## Read first
- `D:\Dev\htdocs\kc-cms-app\.claude\project.md` (upstream-merge rules, Never list, copy rule, `kc/` imports use relative `.ts` paths)
- `D:\Dev\htdocs\kc-cms-app\.claude\work\15-plan-client-experience\plan.md`, card 11
- `D:\Dev\htdocs\kc-cms-app\kc\client-view.ts` (`clientName`) and `kc\tests\brand.test.ts` (the existing brand source test; fix it to collapse whitespace across lines before matching)

## Start here
- `lib/mailer.ts` `getFromEmail` (line 39): wrap the result in `withSenderName`.
- `lib/actions/collaborator.ts`: where the invite and collaborator-added emails are rendered and sent; build the subject from the client name, stop passing `invitedByUrl`.
- `components/email/*.tsx`: remove GitHub links, `invitedByUrl` and Pages CMS wording.
- `lib/auth.ts` keeps its subject line: do not touch it.

## Files you may touch
- `D:\Dev\htdocs\kc-cms-app\kc\email.ts` (new)
- `D:\Dev\htdocs\kc-cms-app\kc\tests\email.test.ts` (new)
- `D:\Dev\htdocs\kc-cms-app\kc\tests\brand.test.ts`
- `D:\Dev\htdocs\kc-cms-app\components\email\invite.tsx`
- `D:\Dev\htdocs\kc-cms-app\components\email\login.tsx`
- `D:\Dev\htdocs\kc-cms-app\components\email\collaborator-added.tsx`
- `D:\Dev\htdocs\kc-cms-app\lib\actions\collaborator.ts`
- `D:\Dev\htdocs\kc-cms-app\lib\mailer.ts`
- `D:\Dev\htdocs\kc-cms-app\.claude\work\21-white-label-emails\result.md` (new)

## Done-test
`node --test kc/tests/email.test.ts kc/tests/brand.test.ts` passes, run through `node C:\Users\roban\.claude\bin\project-test.cjs` with those files. `withSenderName("noreply@kingsburycreative.com")` gives `Kingsbury Creative <noreply@kingsburycreative.com>`; `withSenderName("Someone <a@b.c>")` is unchanged. A subject helper in `kc/email.ts` takes the client name and contains no `owner/repo`; a source test shows `collaborator.ts` uses it and `mailer.ts` calls `withSenderName`. A source test finds no `invitedByUrl`, `github.com` or "Pages CMS" in the three templates after collapsing whitespace across lines.

Also `npx tsc --noEmit && npx eslint kc` exit 0. Mutation check, through the runner so it is on record: break `withSenderName` (return input unchanged), run the done-test, name the tests that failed, restore, run again green.

## Boundaries
No commit, no push, no install, nothing outward. No real network calls in tests. Never read or print a key, `.env` or secrets file. Every subject line and email body text is client-facing copy: write it with the `prose` skill, then run `avoid-ai-writing` and `humanizer` (Skill tool); if the Skill tool refuses, stop and say so in result.md. Smallest edit in each upstream file. Do not run the full suite.

## Report
Write `result.md` beside this file, under 200 words: files changed, tests added, the mutation result naming the tests that failed, each piece of copy written, any call made and why, and what was not done.
