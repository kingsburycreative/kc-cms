# 21 result

Files changed: kc/email.ts (new), kc/tests/email.test.ts (new), kc/tests/brand.test.ts (collapses whitespace before matching "Pages CMS"), lib/mailer.ts, lib/actions/collaborator.ts, components/email/invite.tsx, components/email/collaborator-added.tsx. login.tsx needed no change (no GitHub, Pages CMS or invitedByUrl).

Tests added: 5 in email.test.ts (sender name, unchanged display name, subjects, source checks for collaborator.ts and mailer.ts, template ban list).

Mutation: withSenderName returned input unchanged; "a bare address gets the Kingsbury Creative name" failed (149 pass, 1 fail). Restored, green (150 pass). tsc and eslint kc exit 0. The runner ran the whole kc suite, not only the two files.

Copy (prose, avoid-ai-writing and humanizer run; no changes after the checks):
- Invite subject: "You're invited to edit {client}"
- Added subject: "You now have access to {client}"
- Invite body: "{name} invited you to edit {client} on Kingsbury Creative CMS. Use this link to get started:"; heading "Edit {client} on Kingsbury Creative CMS"; button "Edit {client}"
- Added body: "{name} gave you access to {client} on Kingsbury Creative CMS. There is nothing to accept."; heading "You now have access to {client}"; button "Open {client}"

Calls: templates keep the repoName prop but receive the client name. getConfig is read on branch "main" with bootstrapOnMiss false, falling back to the repo name on any failure; a repo whose config sits on another branch gets the fallback name.
