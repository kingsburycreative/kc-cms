# 50. Short-URL core (Normal)

## Objective
Board card 47 (`.claude/work/40-plan-short-urls/plan.md` card 47). Pure functions that map short paths like `/besciworks/history` to `/kingsburycreative/besciworks/main/history` and back. No proxy hook yet (card 48).

## Read first
- `D:\Dev\htdocs\kc-cms-app\.claude\project.md` (relative `.ts` imports in `kc/`, tests under `kc/tests/`)
- Design, Flags 1 to 3, and card 47 in `.claude/work/40-plan-short-urls/plan.md` (the spec; follow it exactly)
- `app/` top-level folders and `public/` top-level entries (the reserved names)

## Start here
- `kc/short-url.ts`, no imports: export `resolveShort(pathname, method)` returning `{ rewrite }`, `{ redirect }` or `null`; `shortHref(fullPath)`; `RESERVED`. Owner `kingsburycreative` and branch `main` are constants.

## Files you may touch
- `D:\Dev\htdocs\kc-cms-app\kc\short-url.ts` (new)
- `D:\Dev\htdocs\kc-cms-app\kc\tests\short-url.test.ts` (new)
- `D:\Dev\htdocs\kc-cms-app\kc\tests\short-url-reserved.test.ts` (new)
- `D:\Dev\htdocs\kc-cms-app\.claude\work\50-short-url-core\result.md` and `progress.md` (new)

## Done-test
`node C:\Users\roban\.claude\bin\project-test.cjs kc/tests/short-url.test.ts kc/tests/short-url-reserved.test.ts` passes, then `npx tsc --noEmit && npx eslint kc` exit 0. Every assert listed under card 47's done-test in the plan, including the 20-path round trip and the reserved test reading `app/` and `public/` from disk.

Mutation check, through the runner, one at a time: remove `admin` from `RESERVED` (reserved test fails), compare the branch after decoding (the `%6Dain` test fails), drop the method check (POST test fails). Name the failing tests, restore, run green.

## Boundaries
No commit, no push, no install, no network. No upstream file, no `package.json`, lock file or `db/migrations/`. Never read or print a secret or `.env`. No client-facing copy. Keep `progress.md` beside this brief, updated after each step that changes a file: done so far, files touched, next step, anything half-written.

## Report
`result.md` beside this file, under 200 words: files changed, tests added, the mutation result naming the failing tests, anything left undone.
