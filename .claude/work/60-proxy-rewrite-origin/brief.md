# 60. Short-address rewrite stays inside the app behind nginx (Risky)

## Objective
Board card proxy-rewrite-origin. Live since deploy 7bb697f: every short address (`/besciworks`, `/besciworks/collections/weekly`) returns 500. The box journal shows `Failed to proxy https://localhost:3000/kingsburycreative/besciworks/main Error: write EPROTO ... packet length too long`, and the response carries `x-middleware-rewrite: https://localhost:3000/...`.

Cause: `proxy.ts:40-42` clones `request.nextUrl` and rewrites to it. Behind nginx the clone's protocol is `https` (from the forwarded proto), while Next's own base URL (`initUrl`) is `http://localhost:3000`. Next 16.2.1 `server/lib/router-utils/resolve-routes.js:449-458` relativizes the rewrite against `initUrl`; a different origin leaves it absolute, so Next proxies it as an external URL over TLS to a plain-HTTP port.

Fix: build the rewrite target so its origin always equals the server's own origin, whatever the forwarded headers say (for example from `request.url` if that keeps the internal origin, or by copying the protocol and host Next uses internally). Check in Next's source which one is right; do not guess. Redirects (308) keep their current public `https://cms.kingsburycreative.com` Location.

## Read first
- `D:\Dev\htdocs\kc-cms-app\.claude\project.md` (tests, relative `.ts` imports)
- `proxy.ts`, `kc/tests/short-url-proxy.test.ts`
- `node_modules/next/dist/server/lib/router-utils/resolve-routes.js` around line 449, `node_modules/next/dist/shared/lib/router/utils/relativize-url.js`, and how `NextRequest.nextUrl` takes the forwarded proto

## Files you may touch
- `D:\Dev\htdocs\kc-cms-app\proxy.ts`
- `D:\Dev\htdocs\kc-cms-app\kc\tests\short-url-proxy.test.ts`
- `D:\Dev\htdocs\kc-cms-app\.claude\work\60-proxy-rewrite-origin\result.md` and `progress.md` (new)

## Done-test
`node C:\Users\roban\.claude\bin\project-test.cjs kc/tests/short-url-proxy.test.ts kc/tests/short-url.test.ts kc/tests/short-url-reserved.test.ts` passes, then `npx tsc --noEmit && npx eslint proxy.ts kc` exit 0. New asserts, modelling the box: a request built the way Next builds it behind nginx (internal URL `http://localhost:3000/besciworks`, headers `host`, `x-forwarded-proto: https`, `x-forwarded-host: cms.kingsburycreative.com`) gives an `x-middleware-rewrite` whose origin is `http://localhost:3000` and whose path is `/kingsburycreative/besciworks/main`; the same for a nested path with a query (query kept); and a full path still 308s to `https://cms.kingsburycreative.com/besciworks` (public origin unchanged). The existing proxy tests stay green.

Mutation check, through the runner: put back `request.nextUrl.clone()` as the rewrite base; name the tests that fail, restore, run green.

## Boundaries
No commit, no push, no install, no network. No upstream file, no `package.json`, lock file or `db/migrations/`. Never read or print a secret or `.env`. No client-facing copy. Keep `progress.md` beside this brief, updated after each step that changes a file: done so far, files touched, next step, anything half-written.

## Report
`result.md` beside this file, under 200 words: files changed, tests added, which origin source you chose and the Next source line that proves it, the mutation result naming the failing tests, anything left undone.
