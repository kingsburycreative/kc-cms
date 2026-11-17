# 108.02. Restore and save keep fields the schema does not list (job: risky)

Re-planned from plan card 108.02 (code) to risky: the 108.01 finding puts the fix in `app/api/`, a risky path in `.claude/project.md`.

## Objective
A field present in a file but missing from the CMS's copy of `.pages.yml` survives both a History restore and an ordinary save. Henike's case: the old version still holds `answer`, `source` and `faq`; restoring it and saving writes them back, even when the schema in the CMS lacks them.

## Read first
- `.claude/project.md` (upstream-file rule, Never list, risky paths)
- `.claude/work/108-01-restore-check/finding.md` (where the fields are dropped, with line numbers)
- `.claude/work/108-help-guide-plan/plan.md` card 02
- `kc/tests/restore-wiped-field.test.ts`, `kc/history/restore.ts`, `lib/schema.ts` (deepMap), `app/api/[owner]/[repo]/[branch]/entries/[path]/route.ts`, `app/api/[owner]/[repo]/[branch]/files/[path]/route.ts`
- `docs/adr/` (none covers this; do not add one)

## Approach
Put the logic in a new `kc/` module (for example `kc/keep-unlisted.ts`): given the schema's fields, the parsed content the schema kept, and the raw content, return the content with every key the schema does not list carried over from the raw content, nested objects and list items included where the schema describes them. Hook it into the upstream files with at most one line each:
- the entries GET route, so History's old version reaches the editor with unlisted fields intact (or carries them alongside so restore can put them back);
- the files save route, so a save merges unlisted keys from the file's current content on the branch (and from the restored content) back in after Zod and deepMap run.
Fields the schema does list keep upstream behaviour exactly. Never let an unlisted key override a listed field. No new dependency, no migration. Do not touch auth, tokens, crypto or the access checks in those routes.

## Files you may touch
- `kc/keep-unlisted.ts` (new)
- `kc/history/restore.ts`
- `kc/tests/restore-wiped-field.test.ts` (flip the 01 assertion: with the fields removed from the schema, restore then save returns them)
- `kc/tests/keep-unlisted.test.ts` (new)
- `kc/register/customizations.json` (an entry for each upstream file touched)
- `app/api/[owner]/[repo]/[branch]/entries/[path]/route.ts` (one hook line, plus its import)
- `app/api/[owner]/[repo]/[branch]/files/[path]/route.ts` (one hook line, plus its import)
- `lib/schema.ts` (only if a hook there is smaller than in the routes; one line)
- `.claude/work/108-02-restore-keeps-fields/result.md`, `.claude/work/108-02-restore-keeps-fields/progress.md`

## Done-test
`node --test kc/tests/restore-wiped-field.test.ts kc/tests/keep-unlisted.test.ts kc/tests/customizations.test.ts` passes, run through `node C:\Users\roban\.claude\bin\project-test.cjs` as the runner allows. Mutation check through the runner: disable the merge in `kc/keep-unlisted.ts`; name the tests that fail; restore it.

## Rules
Keep `progress.md` beside this brief, updated after every step. No commit. No network in tests (fixtures only). Write `result.md`: what changed, each upstream line touched, the mutation result, anything not verified.

Secrets: never run a command or read a file that prints a secret value; values move file-to-file or pipe-to-pipe only (secret-put.cjs, secret-to-file.cjs).
