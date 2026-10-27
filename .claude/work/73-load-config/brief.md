# 73. Load core config outside Next (Normal)

## Objective
Plain `node --test` cannot load core's config code: `lib/config.ts` imports through the `@/` alias and `fields/registry.ts` pulls `.tsx` editors. Make a loader in `kc/register/load-config.ts` that registers `tsx`'s ESM API (`tsx/esm/api`, already a dependency, 4.23.15; never install anything) and then dynamically imports `lib/config.ts` and `lib/schema.ts`, returning their modules. Later register cards (sites, guard) validate client `.pages.yml` files through it. Plan card 01 of `.claude/work/66-plan-customization-guard/plan.md`.

## Read first
- D:/Dev/htdocs/kc-cms-app/.claude/project.md (upstream rule, Never list)
- .claude/work/66-plan-customization-guard/plan.md, "Wrong in the existing setup" item 3 and card 01
- lib/config.ts (parseAndValidateConfig), lib/schema.ts, fields/registry.ts, tsconfig.json (paths for `@/`)
- node_modules/tsx (its esm/api `register` and tsconfig handling)

## Files you may touch
- `kc/register/load-config.ts`
- `kc/tests/register-load.test.ts`

## Done-test
`node --test kc/tests/register-load.test.ts` passes, run through `node C:\Users\roban\.claude\bin\project-test.cjs` (follow other briefs in .claude/work if the runner takes a path differently). The test asserts:
- an inline minimal config (one file entry, one collection, a `kc:` block) gives zero errors from `parseAndValidateConfig`;
- an unknown field type gives an error naming that field;
- a `kc:` block with an unknown key fails.
Existing tests still pass.

Mutation check through the runner: break the loader (for instance skip the tsx register, or make it import the wrong module), run, name the tests that failed, restore, run green.

If tsx cannot load `fields/core/*` (or another module) in any workable way, stop: write result.md naming the failing module and the error, and change nothing else. The card parks.

## Boundaries
No commit, no push, no install, no network, no edits outside the two files. No user-facing copy.

## Progress
Keep `progress.md` beside this file from your first step, one line per step that changes a file or finishes a unit of work: done, files, next, anything half-written. Already there? You are resuming: read it and check the disk against it first.

## Report
Write `result.md` beside this file, under 200 words: files changed, tests added, the mutation result naming the tests that failed, and what was not done.
