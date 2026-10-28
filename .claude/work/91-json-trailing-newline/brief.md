# 91. JSON saves keep a trailing newline (Normal)

## Objective
Saving a JSON file (format `json`) drops the file's trailing newline, so every save of a Henike JSON page shows a "no newline at end of file" diff. After the fix, `serialize(obj, "json")` returns `JSON.stringify(obj, null, 2)` followed by one `\n`. 2-space JSON stays the canonical format. Empty object still returns "". json-frontmatter output must not change shape beyond what this implies; check how `stringify` uses `serialize` for json-frontmatter and keep frontmatter output exactly as today (add the newline only for whole-file `json`).

## Read first
- .claude/project.md (upstream rule, register, tests)
- The json-trailing-newline entry in kc/BOARD.md
- lib/serialization.ts (serialize ~line 94, stringify and its frontmatter paths)
- kc/register/customizations.json and kc/tests/register-customizations.test.ts
- kc/tests/register-load.test.ts and kc/register/load-config.ts (how a test loads an upstream lib module under node --test)

## Build
- Smallest change in `lib/serialization.ts`. Add a register entry claiming it (id `json-trailing-newline`).
- No visible text changes.

## Files you may touch
- `lib/serialization.ts`
- `kc/register/customizations.json`
- `kc/tests/json-trailing-newline.test.ts` (new)
- `.claude/work/91-json-trailing-newline/result.md`, `progress.md`

## Done-test
`kc/tests/json-trailing-newline.test.ts`: stringify/serialize of a JSON object ends with exactly one `\n` and parses back to the same object; empty object stays ""; json-frontmatter output is unchanged from before (assert its exact string for a small fixture). If loading the module under node --test is impractical, a source-read test is acceptable, say so in result.md. kc/tests/register-customizations.test.ts stays green.

Mutation check through the runner: remove the added newline; a test fails; restore.

At the end, each exit 0 on the final tree:
- `node C:\Users\roban\.claude\bin\project-test.cjs kc/tests/json-trailing-newline.test.ts`
- `node C:\Users\roban\.claude\bin\project-test.cjs kc/tests/register-customizations.test.ts`
- `npx tsc --noEmit`, `npx eslint kc`

## Boundaries
No commit, no push, no npm install, no package.json edits, no network in tests, no .env. Leave app/api/, lib/auth.ts, lib/crypto.ts, lib/token.ts, kc/insights/ alone.

## Progress
Keep `progress.md` beside this file from your first step, one line per step that changes a file or finishes a unit of work: done, files, next, anything half-written. Already there? You are resuming: read it and check the disk against it first.
