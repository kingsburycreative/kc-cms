# 90. Save resets the form baseline (Normal)

## Objective
After a successful save in the entry editor, the form's baseline becomes the saved values. Today the form keeps the pre-save values as its defaults, so changing a field back to what it was before the save reads as "no change" and Save stays greyed until a reload (Henike `src/content/en/pages/home.json`). After the fix, any value different from what was last saved makes the form dirty, and a value equal to what was last saved does not.

## Read first
- .claude/project.md (upstream rule, register, tests)
- The save-baseline entry in kc/BOARD.md
- components/entry/entry-form.tsx (around 1030-1170: defaultValues, form.reset, handleFormSubmit)
- components/entry/entry.tsx (onSubmit 335-430, EntryForm call ~873)
- kc/register/customizations.json and kc/tests/register-customizations.test.ts (every changed upstream file must be claimed by an entry)
- a kc test that reads source, e.g. kc/tests/page-header.test.ts, for style

## Build
- Smallest hook that works, logic in a new `kc/` module where possible (e.g. a pure helper deciding the new baseline from the submitted values), called from the upstream file. Likely: after `await onSubmit(latestValues)` resolves without throwing in entry-form.tsx, `form.reset(latestValues)` (or reset with keepValues so in-flight edits are not lost). Do not reset on a failed save. Edits typed while the save was in flight must not be wiped; if you cannot keep them safely, keep them and say so in result.md.
- Upstream files you may change: `components/entry/entry-form.tsx` and, only if needed, `components/entry/entry.tsx`. Add a register entry claiming them (id `save-baseline`).
- No visible text changes.

## Files you may touch
- `components/entry/entry-form.tsx`, `components/entry/entry.tsx`
- `kc/save-baseline.ts` (new, optional)
- `kc/register/customizations.json`
- `kc/tests/save-baseline.test.ts` (new)
- `.claude/work/90-save-baseline/result.md`, `progress.md`

## Done-test
`kc/tests/save-baseline.test.ts`: if you add a pure helper, unit tests that the baseline after a successful save equals the submitted values and is unchanged after a failed one; plus a source-read test that entry-form.tsx resets the form baseline after a successful onSubmit (and not in the catch path). kc/tests/register-customizations.test.ts stays green.

Mutation check through the runner: remove the post-save reset; a test fails; restore.

At the end, each exit 0 on the final tree:
- `node C:\Users\roban\.claude\bin\project-test.cjs kc/tests/save-baseline.test.ts`
- `node C:\Users\roban\.claude\bin\project-test.cjs kc/tests/register-customizations.test.ts`
- `npx tsc --noEmit`, `npx eslint kc`

## Boundaries
No commit, no push, no npm install, no package.json edits, no network in tests, no .env. Leave app/api/, lib/auth.ts, lib/crypto.ts, lib/token.ts, kc/insights/ alone.

## Progress
Keep `progress.md` beside this file from your first step, one line per step that changes a file or finishes a unit of work: done, files, next, anything half-written. Already there? You are resuming: read it and check the disk against it first.
