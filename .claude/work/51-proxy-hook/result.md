# 51. Hook the proxy: result

Files changed: `proxy.ts` (one import, a 10-line hook after the Origin check and after `x-return-to` is set). Added: `kc/tests/short-url-proxy.test.ts` (8 tests).

The runner can't import `proxy.ts` directly, because Node's ESM resolver needs `next/server.js`. So the test copies the real `proxy.ts` source to a temp `.mts` file, points its two imports at absolute paths, and runs it against real `NextRequest` objects. Every plan assert runs against the real code: rewrite plus `x-return-to`, the 308 on the same host, the POST method check, the 403 with no rewrite, the webhook, pass-throughs, the import scan, and the 10-repo byte-for-byte access test.

Call: every `/api/` path is reserved, so the order of the hook and the Origin check makes no difference you can observe. The 403 test also checks in the source that the Origin check sits above the hook (plan flag 4).

Mutation check, one at a time, each restored:
- Hook above the Origin check: "a cross-origin POST to /api/x/y/main/files/a answers 403..." failed.
- `x-return-to` set after the rewrite: "a short GET is rewritten and x-return-to is the short path" failed.
- Redirect on POST (method forced to GET): "method: a POST to a full path is not redirected" failed.

Final run green (361 pass). `tsc` and `eslint kc` exit 0. The runner ran the full suite even with file args.
