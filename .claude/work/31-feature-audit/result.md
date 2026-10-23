# Card 23: security audit of the client-experience feature

Opus security-auditor, read-only. No high finding. ?ref=, restore, other repos, redaction, branch-lock coverage and token handling all checked and closed.

- Low, live: branches/route.ts:24 trusts githubUsername alone; a client who links GitHub can create branches. Fix: requireOwnRepoPush or refuse source !== "user"; update kc/tests/branch-lock.test.ts:62.
- Latent (high if password sign-up or another provider is added): lib/auth.ts:39 trustedProviders, lib/collaborator-access.ts:12-15 unclaimed invite matched on email without emailVerified, lib/admin.ts:22-24 admin by email alone.
- Latent low: files/[path]/route.ts:500 and rename/route.ts:69-98 delete guard checks the named schema, not the file path (startsWith prefix). Media DELETE skips isMediaPathAllowed.
- Observation: kc/branch-lock.ts decodes the branch once more than GitHub calls do (%6Dain passes as main).
Not verified: suite not run by the auditor (no shell), GitHub email-verification behaviour, BeSciWorks .pages.yml.
