# 62. Add a client editor from the command line (Risky)

## Objective
Board card add-editor-script. Rob, 2026-10-26: "we need to find a workaround so you can manually add our clients to the site." Today adding an editor needs a GitHub-signed-in staff session on `/<repo>/collaborators` (`lib/actions/collaborator.ts`, gated by `requireGithubRepoWriteAccess`); an email-code session gets "Access denied". The coordinator works headless and has no browser session, but it can run commands on the box as root over ssh.

Build a server-side command that does what the Invite button does for one client repo, with no web session: `node scripts/add-editor.mts --repo kingsburycreative/<repo> --email <address> [--name "<Full Name>"] [--dry-run]`, run on the box from the current release folder with the service's environment file loaded (the same way the app gets its env). It must:
- refuse any owner other than `kingsburycreative` and any repo not in the GitHub App installation (reuse the installation check the action uses, through the app's GitHub App credentials, not a user token);
- validate the email with the same parser as the action (`parseInviteEmails` or its schema);
- reuse the existing invite code paths, not copy them: if the address has no user, create the invite exactly as `createCollaboratorInviteUrl` does and send `InviteEmailTemplate` with `inviteSubject(client)`; if it already has a user, add the collaborator and send `CollaboratorAddedEmailTemplate`; if already invited or added, say so and exit 0 without sending;
- record the inviter as "Kingsbury Creative" (no user object); 
- with `--dry-run`, print what it would do and send nothing;
- print one plain line of result, never a token, invite URL or env value.

If reusing those functions needs them extracted out of the `"use server"` action file into a plain module the action then imports, do that with no behaviour change to the action (its tests stay green). Add a short section to `docs/` (or the existing ops doc that covers `insights-map.sh`-style box commands) with the exact ssh command form, using placeholders for host and key.

Re-brief, 2026-10-26: the first run parked because the box cannot load `lib/` (path aliases, TypeScript) without `tsx`. Rob decided by the project rubric: add `tsx` as a runtime dependency (security beats an admin HTTP endpoint, which would be new attack surface). Add it to `package.json` `dependencies` at an exact pinned version (no caret) and update the lock file with the project's package manager, offline-capable if the cache has it, otherwise one network install of that package only. Run the script as `node --import tsx scripts/add-editor.mts ...` (or `npx tsx`), and check the tsconfig `paths` aliases resolve under it. Confirm deploy.sh's install step (`npm ci` or equivalent in D:\Dev\htdocs\kc-cms\server\deploy.sh) will install it on the box (not dev-only).

## Read first
- `D:\Dev\htdocs\kc-cms-app\.claude\project.md` (tests, relative `.ts` imports, how scripts run)
- `lib/actions/collaborator.ts`, `lib/collaborator-access.ts`, `lib/mailer.ts`, `kc/email.ts`, `components/email/invite.tsx`, the collaborator schema in `db/`
- how the box runs the app: `D:\Dev\htdocs\kc-cms\server\deploy.sh` (release folder, EnvironmentFile)

## Files you may touch
- new `D:\Dev\htdocs\kc-cms-app\scripts\add-editor.mts` and a test under `kc\tests\` (or the project's test folder for scripts)
- `lib/actions/collaborator.ts` and a new plain module beside it, `lib/actions/collaborator-invite.ts`, only to share the invite logic
- one doc file under `docs\`
- `package.json` and `package-lock.json` (the `tsx` dependency only)
- `D:\Dev\htdocs\kc-cms-app\.claude\work\62-add-editor-script\result.md` and `progress.md` (new)

## Done-test
New tests pass through `node C:\Users\roban\.claude\bin\project-test.cjs <new and touched test files>` and the existing collaborator tests stay green, then `npx tsc --noEmit && npx eslint scripts lib kc` exit 0. With the mailer and db mocked: a new address creates one invite row and sends one invite email with the right subject; an existing user is added and gets the added email; a repeat run sends nothing; another owner, a malformed email, and a repo outside the installation each exit non-zero with no row and no email; `--dry-run` writes nothing and sends nothing; stdout never contains the invite token.

Mutation check, through the runner: drop the owner check; name the tests that fail, restore, run green.

## Boundaries
No commit, no push, nothing run against the real box or database. The only install allowed is `tsx` as above; the only `package.json` and lock file changes are that dependency (plus at most one script line if the project already lists scripts that way). No `db/migrations/`. Never read or print a secret or `.env`. Keep `progress.md` beside this brief, updated after each step that changes a file: done so far, files touched, next step, anything half-written.

## Report
`result.md` beside this file, under 250 words: files changed, the exact command to run on the box, tests added, the mutation result naming the failing tests, anything left undone.
