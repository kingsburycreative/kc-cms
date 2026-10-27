# 75 result

nodemailer 8.0.11 -> 10.2.1 (newest 10.x). No @types/nodemailer in package.json.

Files: package.json, package-lock.json, kc/tests/mailer-nodemailer.test.ts (new). lib/mailer.ts and types/nodemailer.d.ts unchanged: nothing forced it.

Breaking changes:
- 9.0.0 TLS validation on remote-content fetches (attachment URLs, OAuth2, proxy CONNECT): does not affect us, lib/mailer.ts sends no attachments, no OAuth2, no proxy.
- 10.0.0 Node 20+ required: does not, local Node is 24 (deploy runtime should be checked if older than 20). TS/ESM migration ships its own types; our ambient types/nodemailer.d.ts still wins and tsc passes.

Test: drives nodemailer directly with jsonTransport (lib/mailer.ts imports "@/kc/email", which plain node --test cannot resolve), asserts from, to, subject, html, text.

Mutation: dropped `text` from the message; "nodemailer builds the message lib/mailer.ts sends over SMTP" failed; restored, green.

Final tree: tsc exit 0. npm audit --omit=dev: no nodemailer advisory; left are esbuild (moderate, via drizzle-kit) and zod (high, stays on 3 per brief), 5 total (4 moderate, 1 high).

Not met: the runner exits 1 because it runs the full suite regardless of the filter, and "every upstream file the fork changed is claimed" fails on CHANGELOG-KC.md, a file this card did not touch (pre-existing).
