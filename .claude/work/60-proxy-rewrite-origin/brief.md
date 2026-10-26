# 60. Short-address rewrite stays inside the app behind nginx (Risky)

## Objective
Board card proxy-rewrite-origin. Live since deploy 7bb697f: every short address (`/besciworks`, `/besciworks/collections/weekly`) returns 500. The box journal shows `Failed to proxy https://localhost:3000/kingsburycreative/besciworks/main Error: write EPROTO ... packet length too long`, and the response carries `x-middleware-rewrite: https://localhost:3000/...`.

Cause (re-briefed after the first run, which correctly found the protocol theory wrong): the host differs, not the protocol. The box starts Next with `next start -H 127.0.0.1 -p 3000` (kc-cms `server/deploy.sh` ExecStart). So `initUrl` is `https://127.0.0.1:3000/...` (`resolve-routes.js:116`, formatHostname(opts.hostname)). But `NextURL` normalizes any 127.x / [::1] / localhost hostname to `localhost` (`node_modules/next/dist/server/web/next-url.js:15-18`, REGEX_LOCALHOST_HOSTNAME), so `request.nextUrl.clone()` gives `https://localhost:3000/...`. Origins differ, `getRelativeURL` keeps it absolute, and Next proxies it as external: the journal error `Failed to proxy https://localhost:3000/kingsburycreative/besciworks/main`.

Fix: build the rewrite target from the raw `request.url` (`new URL(request.url)`, which NextRequest passes to `super(url)` without normalizing; confirm in `spec-extension/request.js:42`), set its pathname to `short.rewrite`, keep the search. Leave the 308 redirect path as it is (public origin). Confirm each step against the Next source before relying on it.

## Read first
- `D:\Dev\htdocs\kc-cms-app\.claude\project.md` (tests, relative `.ts` imports)
- `proxy.ts`, `kc/tests/short-url-proxy.test.ts`
- `node_modules/next/dist/server/lib/router-utils/resolve-routes.js` around line 449, `node_modules/next/dist/shared/lib/router/utils/relativize-url.js`, and how `NextRequest.nextUrl` takes the forwarded proto

## Files you may touch
- `D:\Dev\htdocs\kc-cms-app\proxy.ts`
- `D:\Dev\htdocs\kc-cms-app\kc\tests\short-url-proxy.test.ts`
- `D:\Dev\htdocs\kc-cms-app\.claude\work\60-proxy-rewrite-origin\result.md` and `progress.md` (new)

## Done-test
`node C:\Users\roban\.claude\bin\project-test.cjs kc/tests/short-url-proxy.test.ts kc/tests/short-url.test.ts kc/tests/short-url-reserved.test.ts` passes, then `npx tsc --noEmit && npx eslint proxy.ts kc` exit 0. New asserts, modelling the box: a request built the way Next builds it on the box (URL `https://127.0.0.1:3000/besciworks`, headers `host: cms.kingsburycreative.com`, `x-forwarded-proto: https`) gives an `x-middleware-rewrite` whose origin is exactly `https://127.0.0.1:3000` (not localhost) and whose path is `/kingsburycreative/besciworks/main`; the same for a nested path with a query (query kept); and a full path still 308s to `https://cms.kingsburycreative.com/besciworks` (public origin unchanged). The existing proxy tests stay green.

Mutation check, through the runner: put back `request.nextUrl.clone()` as the rewrite base; name the tests that fail, restore, run green.

## Boundaries
No commit, no push, no install, no network. No upstream file, no `package.json`, lock file or `db/migrations/`. Never read or print a secret or `.env`. No client-facing copy. Keep `progress.md` beside this brief, updated after each step that changes a file: done so far, files touched, next step, anything half-written.

## Report
`result.md` beside this file, under 200 words: files changed, tests added, which origin source you chose and the Next source line that proves it, the mutation result naming the failing tests, anything left undone.
