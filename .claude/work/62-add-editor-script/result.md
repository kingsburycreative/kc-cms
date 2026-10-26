# 62 add-editor-script: result

Files changed
- new `scripts/add-editor.mts`: `addEditor(argv, deps)` plus real wiring (GitHub App credentials, db, mailer, templates) loaded only when run.
- new `lib/actions/collaborator-invite.ts`: `parseInviteEmails`, `createCollaboratorInviteUrl` (now takes `db`), `isRepoInInstallation`, `clientNameFor`, moved out of the action. `lib/actions/collaborator.ts` imports them; no behaviour change.
- new `docs/add-editor.md`.
- `package.json`: `"tsx": "4.23.15"` in dependencies. Lock: tsx 4.21.0 (was dev-only, transitive) -> 4.23.15 as prod, which pulls esbuild 0.27.4 -> 0.28.2 (its own dependency). One network install of tsx only.

Command on the box
`ssh -i <key> root@<host> 'cd /srv/kc-cms/current && set -a && . /srv/kc-cms/shared/env && set +a && node --import tsx scripts/add-editor.mts --repo kingsburycreative/<repo> --email <address> --name "<Full Name>" --dry-run'`

Tests added: `kc/tests/add-editor.test.ts` (7 tests: new invite, existing user, repeat run, other owner, bad email, repo outside installation, dry run; token never in output). Collaborator/invite-name/email tests green; `tsc --noEmit` and `eslint scripts lib kc` exit 0. Checked locally that `node --import tsx` resolves the `@/` aliases and the .tsx templates (a refused run exits 1 before touching anything).

Mutation: dropped the owner check; "another owner is refused" failed; restored, green.

Calls: installation check uses the App's own token (`GET /repos/{o}/{r}/installation`, then the installation's repo list) with the action's shared match predicate, since the action's user-token path cannot run headless. `invitedBy` is null; "Kingsbury Creative" is the inviter name in the email.

Not done: the real GitHub/db wiring is untested beyond loading; nothing run against the box.
