# 57. Short links to dotted paths reach the proxy (Risky)

## Objective
Board card short-url-dotted (card 54 audit finding B, `.claude/work/56-short-url-audit/result.md`). `proxy.ts:19` skips every path whose last segment has a dot, so short editor links to dotted files (`/site/edit/papers/content%2Fpapers%2Fa.md`) and dotted repo roots (`/my.site`) never reach `resolveShort` and 404. Narrow the skip so those paths are rewritten, while real static files (`/_next/`, `/favicon.ico`, files in `public/`, app metadata files) still skip.

## Read first
- `D:\Dev\htdocs\kc-cms-app\.claude\project.md` (upstream files, relative `.ts` imports, tests)
- `proxy.ts`, `kc/short-url.ts`, `kc/tests/short-url-proxy.test.ts` (how proxy.ts is loaded against real NextRequest), `kc/tests/short-url-reserved.test.ts`
- `.claude/work/40-plan-short-urls/plan.md` Design section
- what lives in `public/` (top-level names) and any dotted app routes (e.g. `app/**/icon.*`, `robots`, `sitemap`)

## Start here
Recommended shape: a dotted path skips only when `resolveShort(pathname, method)` gives nothing, or when its first segment is a `public/` top-level name; put that decision in a small exported helper in `kc/short-url.ts` and keep the proxy change to a line or two. The Origin check for `/api/` must still run for every `/api/` path exactly as before. If you find a better shape, say why in result.md.

## Files you may touch
- `D:\Dev\htdocs\kc-cms-app\proxy.ts` (upstream file, smallest hook)
- `D:\Dev\htdocs\kc-cms-app\kc\short-url.ts`
- `D:\Dev\htdocs\kc-cms-app\kc\tests\short-url-proxy.test.ts`
- `D:\Dev\htdocs\kc-cms-app\kc\tests\short-url.test.ts`
- `D:\Dev\htdocs\kc-cms-app\.claude\work\57-short-url-dotted\result.md` and `progress.md` (new)

## Done-test
`node C:\Users\roban\.claude\bin\project-test.cjs kc/tests/short-url-proxy.test.ts kc/tests/short-url.test.ts kc/tests/short-url-reserved.test.ts` passes, then `npx tsc --noEmit && npx eslint kc` exit 0. New asserts, through the real proxy: a short edit link to `content%2Fpapers%2Fa.md` rewrites to the full editor path; a dotted repo root (`/my.site`) rewrites; the full form of each still 308s to the short one; `/_next/static/x.js`, `/favicon.ico` and a real `public/` file pass through untouched (no rewrite, no redirect); a non-GET `/api/x.json` without Origin still gets 403.

Mutation check, through the runner, one at a time: restore the old dotted regex (dotted-file and dotted-root tests fail); drop the `public/` guard (public-file test fails). Name the failing tests, restore, run green.

## Boundaries
No commit, no push, no install, no network. No other upstream file, no `package.json`, lock file or `db/migrations/`. Never read or print a secret or `.env`. No client-facing copy. Keep `progress.md` beside this brief, updated after each step that changes a file: done so far, files touched, next step, anything half-written.

## Report
`result.md` beside this file, under 200 words: files changed, tests added, the mutation result naming the failing tests, anything left undone.
