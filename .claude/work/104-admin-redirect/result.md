# 104 result

Files: `kc/admin-gate.ts` (new, pure `adminPageGate`), `lib/admin.ts` (added `requireAdminPage`, which redirects via `next/navigation`; `requireAdminSession` unchanged), `app/(main)/admin/page.tsx` (import and line 108 now call `requireAdminPage`), `kc/tests/admin-gate.test.ts` (new, 5 tests).

Done-test green. tsc --noEmit clean.

Mutation: non-admin target to `/sign-in` failed "a signed-in non-admin goes home, not to sign-in"; signed-out returning ok failed "signed out goes to sign-in with a return to /admin". Restored, green.

Other gates: `app/(main)/layout.tsx` already redirects signed-out users to `/sign-in?redirect=...`, so signed-out requests likely never reached the page throw; the live 441 was the signed-in non-admin 403 case, now a redirect to `/`.

Cookie change: skipped. It is a risky-path change in `lib/auth.ts` and testing it needs a running better-auth instance, not a pure unit.

Note: the admin case-and-spacing test mirrors `hasAdminAccess` in the test (the real one is server-only) and pins its source text.
