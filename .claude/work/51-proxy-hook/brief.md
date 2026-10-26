# 51. Hook the proxy (Risky)

## Objective
Board card 48 (`.claude/work/40-plan-short-urls/plan.md` card 48). Call card 47's `resolveShort` from `proxy.ts` so short addresses rewrite and full ones 308 to the short form.

## Read first
- `D:\Dev\htdocs\kc-cms-app\.claude\project.md` (upstream files, relative `.ts` imports, tests)
- Design, Flags and card 48 in `.claude/work/40-plan-short-urls/plan.md` (the spec; follow it exactly)
- `kc/short-url.ts` and its tests, `proxy.ts`

## Start here
- In `proxy.ts`, after the existing Origin check and before `NextResponse.next`, about 10 lines: call `resolveShort(pathname, request.method)` from `./kc/short-url.ts`. Redirect: `NextResponse.redirect(clone of nextUrl with pathname swapped, 308)`. Rewrite: `NextResponse.rewrite(url, { request: { headers } })` with `x-return-to` set from the original path and query first. Put any non-trivial logic in `kc/`, not in `proxy.ts`.

## Files you may touch
- `D:\Dev\htdocs\kc-cms-app\proxy.ts` (upstream file, smallest hook)
- `D:\Dev\htdocs\kc-cms-app\kc\short-url.ts` (only if a helper for the hook belongs there)
- `D:\Dev\htdocs\kc-cms-app\kc\tests\short-url-proxy.test.ts` (new)
- `D:\Dev\htdocs\kc-cms-app\.claude\work\51-proxy-hook\result.md` and `progress.md` (new)

## Done-test
`node C:\Users\roban\.claude\bin\project-test.cjs kc/tests/short-url-proxy.test.ts kc/tests/short-url.test.ts` passes, then `npx tsc --noEmit && npx eslint kc` exit 0. Every assert under card 48's done-test in the plan, including the 10-repo byte-for-byte access test. If the runner cannot load `next/server`, run the same asserts as source tests and say so in result.md.

Mutation check, through the runner, one at a time: move the hook above the Origin check (403 test fails), set `x-return-to` after the rewrite (return-to test fails), redirect on POST (method test fails). Name the failing tests, restore, run green.

## Boundaries
No commit, no push, no install, no network. No other upstream file, no `package.json`, lock file or `db/migrations/`. Never read or print a secret or `.env`. No client-facing copy. Keep `progress.md` beside this brief, updated after each step that changes a file: done so far, files touched, next step, anything half-written.

## Report
`result.md` beside this file, under 200 words: files changed, tests added, the mutation result naming the failing tests, anything left undone.
