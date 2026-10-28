# 85. Analytics IDs form keeps the saved values (Risky)

## Objective
After a successful save, the analytics IDs form in `kc/insights/keys-form.tsx` empties all three fields while the staff strip above still shows the old values. A second click on Save IDs then clears every ID, because an empty field means "clear it". After a save the fields must hold the saved values, and the staff strip's Google Analytics and Cloudflare rows must show them without a reload.

## Read first
- .claude/project.md (upstream rule; kc/insights/ is a risky path; Never list)
- The keys-form-keeps-values entry in kc/BOARD.md (the spec)
- kc/insights/keys-form.tsx, kc/insights/keys-action.ts, kc/insights/keys.ts
- Where the form and strip render (grep for the form's component in kc/), to find the dashboard path to revalidate
- kc/tests/insights-keys.test.ts (test style)

## Build
- Return the saved (normalised) values in the action's success result and make the form's fields show them after a save (controlled values or a `key`/`defaultValue` driven by the result, whichever is simplest and survives React 19's form reset after an action).
- Revalidate the dashboard path from the action on success (`revalidatePath` from `next/cache`) so the strip shows the new IDs without a reload. Keep the existing permission checks exactly as they are; do not loosen any auth or validation.
- No new copy unless needed; if a client- or staff-facing string changes, run it through the `prose` skill, then `avoid-ai-writing` and `humanizer` (Skill tool), and list it in result.md.

## Files you may touch
- `kc/insights/keys-form.tsx`, `kc/insights/keys-action.ts`, `kc/insights/keys.ts`
- `kc/tests/insights-keys.test.ts`
- `.claude/work/85-keys-form-keeps-values/result.md`, `progress.md`

## Done-test
Extend kc/tests/insights-keys.test.ts (source or render level): after a successful save the form's field values equal the saved IDs, and the action revalidates the dashboard path on success. Mutation check through the runner: make the form reset its fields after save (a test fails), drop the revalidate (a test fails); restore.

At the end, each exit 0 on the final tree:
- `node C:\Users\roban\.claude\bin\project-test.cjs kc/tests/insights-keys.test.ts`
- `npx tsc --noEmit`, `npx eslint kc`

## Boundaries
No commit, no push, no npm install, no package.json edits, no network in tests, no .env, never read or print a key.

## Progress
Keep `progress.md` beside this file from your first step, one line per step that changes a file or finishes a unit of work: done, files, next, anything half-written. Already there? You are resuming: read it and check the disk against it first.
