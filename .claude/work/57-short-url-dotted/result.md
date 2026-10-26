# 57 result

Files changed: `proxy.ts` (static check is now one call), `kc/short-url.ts` (new exported `isStaticPath(pathname, method)`), `kc/tests/short-url-proxy.test.ts`.

`isStaticPath`: `/api/` never skips; `/_next/` and `/favicon.ico` skip; a dotted path skips only when `resolveShort` gives nothing.

Shape call: no separate public/ guard. The public/ names (`images`, `favicon.ico`, `icon.svg`) are already in RESERVED, so `resolveShort` returns null for them, and a second list would be dead code. RESERVED is the guard. Also, `/api/` dotted paths no longer skip, so a POST to `/api/x.json` without Origin now gets 403 (before, it skipped the check).

Tests added (proxy, through real NextRequest): dotted edit link rewrites and its full form 308s; `/my.site` rewrites and its full form 308s; `/_next/static/x.js` and `/favicon.ico` untouched; `/images/logo.png` untouched; POST `/api/x.json` with no Origin gets 403.

Done-test: 379 pass; tsc and eslint kc exit 0.

Mutations:
- Old rule (every dotted path skips): "dotted file" and "dotted root" failed.
- `images` removed from RESERVED (the public guard): "public file: /images/logo.png", plus the two reserved tests, failed.
Restored, 379 green.
