# 54. Security audit of short addresses: result

Opus security-auditor, read-only, on feat/59-sidebar-pages at cd2f42f. Verdict: no high open.

Answers: no short path reaches more than the full URL; no repo name can shadow a route; the 308 cannot leave the host; the Origin check still runs first for /api/; a client still gets only main; no new existence oracle (same 403 at lib/token.ts:56).

Findings:
- Low, predates the feature: lib/auth-redirect.ts:3 accepts `/\evil.example`, an open redirect via /auth/redirect?to= (app/(auth)/auth/redirect/page.tsx:10, sign-in/page.tsx:18). Auth path, risky.
- A, fix before deploy: kc/short-url.ts:79 checks segments[5], should be segments[4]; a collection or file named main redirects to a path that is not rewritten back. Add a test that every redirect target rewrites to its source.
- B, blocks deploy: the static-asset skip at proxy.ts:19 passes any dotted last segment, so short editor links to dotted files (content%2Fpapers%2Fa.md) and dotted repo roots 404.
- C: kc/short-url.ts:84-88 rewrites other owners' paths (/acme/widgets, invite link at lib/actions/collaborator.ts:161) into kingsburycreative; only matters if a repo lives elsewhere.
- D, latent: kc/tests/short-url-reserved.test.ts:13 counts folders only; a dotless route file (app/icon.tsx) would go unreserved.
- E, latent: Location host from the Host header (proxy.ts:44); fine without a shared cache.
- F: 308s are cached by browsers, so a rollback leaves stale redirects.

Not verified: suite, tsc, and the Next 16.2 runtime behaviour behind B (reasoned from code, not run).
