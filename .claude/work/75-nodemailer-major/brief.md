# 75. nodemailer to the newest 10.x (Risky)

## Objective
nodemailer 8.0.11 carries the last fixable high advisory in `npm audit --omit=dev`; the fix is a major. Move `nodemailer` to the newest 10.x and keep email working: OTP, invite and white-label emails all go through `lib/mailer.ts`, the only importer.

## Read first
- D:/Dev/htdocs/kc-cms-app/.claude/project.md (Never list, the nodemailer-major exception)
- The nodemailer-major entry in kc/BOARD.md
- lib/mailer.ts, types/nodemailer.d.ts, kc/email.ts
- nodemailer's CHANGELOG for 9.0.0 and 10.0.0 (in node_modules/nodemailer after install, or the package's published changelog). Check every breaking change against lib/mailer.ts and list each in result.md with "affects us" or "does not, because ...".

## Start here
- Exception for this card only (Rob, 2026-10-27): you may edit package.json and package-lock.json and run `npm install nodemailer@<newest 10.x>`. Also `@types/nodemailer` if it exists in package.json and needs a matching bump. No `npm audit fix --force`, no other installs. zod stays on 3: do not touch it.
- `lib/mailer.ts` and `types/nodemailer.d.ts` are upstream files: change them only if a breaking change forces it, smallest change that works, named in result.md.

## Files you may touch
- `package.json`
- `package-lock.json`
- `lib/mailer.ts` (only if forced)
- `types/nodemailer.d.ts` (only if forced)
- `kc/tests/mailer-nodemailer.test.ts` (new)

## Done-test
New `kc/tests/mailer-nodemailer.test.ts`: build a nodemailer transport with `jsonTransport: true` or `streamTransport` (no network, no SMTP), send one message shaped the way lib/mailer.ts's SMTP path sends it (from, to, subject, html, text), and assert from, to, subject and both bodies in the output. If lib/mailer.ts can be loaded under plain `node --test` (it imports `@/kc/email`; see kc/register/load-config.ts for how the alias was handled), drive it through lib/mailer.ts's own SMTP path instead; otherwise test nodemailer directly and say so in result.md.

Mutation check through the runner: break the test's subject or body expectation source (e.g. drop `text` from the message) and show the test fails, then restore.

At the end, each exit 0 on the final tree:
- `node C:\Users\roban\.claude\bin\project-test.cjs kc/tests/mailer-nodemailer.test.ts` (the full suite and tsc/eslint are run by the gate)
- `npx tsc --noEmit`
- `npm audit --omit=dev`: no nodemailer advisory left. Name what remains by package and severity.

## Boundaries
No commit, no push, nothing outward beyond the npm registry. No .env, no secrets, no real SMTP. No user-facing copy. Public repo: advisories by package and severity only. Give before and after versions in result.md.

## Progress
Keep `progress.md` beside this file from your first step, one line per step that changes a file or finishes a unit of work: done, files, next, anything half-written. Already there? You are resuming: read it and check the disk against it first.
