# Plan: stem token and admin redirect

Two independent Risky cards queued by the PM, 2026-11-02. No order between them. Files are disjoint.

## What I found

- `interpolate()` (`lib/schema.ts:353`) reads tokens from the data object with `safeAccess`. The reference route (`app/api/[owner]/[repo]/[branch]/references/[name]/route.ts:80-83`, items built at lines 141-189) passes items shaped `{name, path, primary, fields}`, so `{name}` is the file name with its extension and nothing gives the name without it. The filename generator (`lib/schema.ts:412-437`) slugifies, so a reference value cannot produce a bare file stem through it.
- `requireAdminSession()` (`lib/admin.ts:33,37`) throws a 401 or 403 error. `app/(main)/admin/page.tsx:108` calls it as a page, so Next shows `app/error.tsx` with a masked production error. `lib/actions/admin.ts` also calls it and should keep the throw.
- The sign-in page (`app/(auth)/sign-in/page.tsx`) sends any signed-in user on to `?redirect=`. A signed-in non-admin sent to `/sign-in?redirect=/admin` would bounce back to `/admin` forever, so that case goes to `/`.
- Tests cannot import `@/` aliases, so new logic goes in `kc/` as pure functions with relative `.ts` imports; `lib/` gets the smallest hook.

## Cards

### 103. Stem token for interpolate (Risky)
- Role: implementer (Opus)
- Risky path: yes (feeds `app/api/`)
- Files: `kc/interpolate.ts`, `lib/schema.ts`, `kc/tests/interpolate-stem.test.ts`
- Done-test: `node --test kc/tests/interpolate-stem.test.ts`. A reference value `{stem}` over an entry named `deck-permit-ottawa.md` yields `deck-permit-ottawa`; `{path}`, `{name}`, `{primary}`, `{fields.x}`, bare `{x}` with the `fields` fallback, and escaped braces are unchanged.

### 104. Admin page redirects instead of throwing (Risky)
- Role: implementer (Opus)
- Risky path: yes (auth)
- Files: `kc/admin-gate.ts`, `lib/admin.ts`, `app/(main)/admin/page.tsx`, `kc/tests/admin-gate.test.ts`
- Done-test: `node --test kc/tests/admin-gate.test.ts`. Signed-out and non-admin requests to `/admin` get a redirect, never a throw; an admin gets the page.
