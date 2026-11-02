# 107. The editor never throws away text a client typed and has not saved (Risky)

## Objective
A client typing in the KC CMS editor keeps every unsaved word when the browser window loses and regains focus, after a save, and after any background refetch. Leaving the page (a link inside the app, the back button, a reload, closing the tab) with unsaved edits asks first. A save that fails validation shows the message at the field, not only a toast. Kirk Henike lost typed text twice on 2026-11-02 this way and said his edits "reverted back to their original".

## Read first
- `D:\Dev\htdocs\kc-cms-app\.claude\project.md` (Never list, test command, copy rule, the `upstream` rule for files from Pages CMS)
- `D:\Dev\hq\.claude\work\kirk-cms-revert\RESULT.md` (the diagnosis: evidence, cause in code, recommended fix; it is the spec)
- `C:\Users\roban\.claude\pm\traps.md`
- `D:\Dev\htdocs\kc-cms-app\components\entry\entry.tsx` (SWR fetch ~225-245, the effect that copies fetched data into state ~247-260, the save path ~380-430)
- `D:\Dev\htdocs\kc-cms-app\components\entry\entry-form.tsx` (`useForm` and the reset effect ~1055-1065, the dirty callback, the submit and error handlers ~1140-1165)
- `D:\Dev\htdocs\kc-cms-app\kc\save-baseline.ts` and `kc\tests\save-baseline.test.ts` (an earlier fix in the same spot, and the test style: pure helpers in `kc/` plus source assertions)

## Context
- Cause, from RESULT.md: (1) `revalidateOnFocus: true` on the entry fetch, and the effect on new `swrEntryData` resets entry, sha and `hasRegisteredChanges`; (2) `entry-form.tsx` runs `form.reset(defaultValues)` whenever `defaultValues` changes, with no dirty check; (3) after a save only `setSha` runs, so the SWR cache keeps the pre-save content and the next focus refetch looks like a change and wipes the form; (4) no leave-page guard; (5) a failed zod check posts nothing and only toasts "Please fix the errors before saving." This was read from code and nginx logs, not reproduced in a browser.
- Fix shape (RESULT.md "Recommended fix"): after a successful save, write the saved content and new sha into the SWR cache with `mutateEntry(..., { revalidate: false })`; never reset a dirty form from a refetch (turn off `revalidateOnFocus` for the entry fetch as well; the sha check on save already catches a real conflict); a `beforeunload` guard and an in-app navigation guard while dirty; field-level messages on a failed validation (react-hook-form's errors already exist per field; make sure each field shows its own and the form scrolls to the first).
- Put the decisions in small pure functions in a new `kc/editor-guard.ts` (for example `shouldResetForm({ isDirty, incoming, current })`, `cacheAfterSave(entry, saved, sha)`, `needsLeaveWarning(isDirty, saving)`) so the node tests can prove them without a browser, plus source assertions on the wiring, the way `save-baseline.test.ts` does.
- `components/entry/*` came from Pages CMS upstream: follow project.md's rule for editing upstream files (keep the change small and marked as ours).
- Any copy the user sees (the leave warning, a field error summary) goes through the copy rule in project.md.

## Start here
- `components/entry/entry.tsx:236-241`: `revalidateOnFocus: true` becomes false for this fetch.
- `components/entry/entry.tsx:~413`: after `if (data.data.sha !== sha) setSha(data.data.sha);` add the cache write through `cacheAfterSave`.
- `components/entry/entry-form.tsx:1061-1063`: `form.reset(defaultValues)` only when `shouldResetForm(...)` says so (never while dirty).
- `components/entry/entry-form.tsx:~1153`: the validation toast stays as a summary; field messages render.
- Done-test command: `node --test --test-reporter=tap kc/tests/editor-guard.test.ts kc/tests/save-baseline.test.ts`

## Files you may touch
- `D:\Dev\htdocs\kc-cms-app\kc\editor-guard.ts` (new)
- `D:\Dev\htdocs\kc-cms-app\kc\tests\editor-guard.test.ts` (new)
- `D:\Dev\htdocs\kc-cms-app\components\entry\entry.tsx`
- `D:\Dev\htdocs\kc-cms-app\components\entry\entry-form.tsx`
- `D:\Dev\htdocs\kc-cms-app\kc\tests\save-baseline.test.ts` (only if its source assertions must follow the new wiring)
- Any test under `kc/tests/` that asserts on the lines changed above (grep for `revalidateOnFocus`, `form.reset(` and `setSha(` first, and list what you changed in result.md)

## Done-test
`node --test --test-reporter=tap kc/tests/editor-guard.test.ts kc/tests/save-baseline.test.ts` passes, proving:
1. Typed-but-unsaved text survives a focus refetch: `shouldResetForm` is false whenever the form is dirty, whatever the incoming data; and the source has `revalidateOnFocus: false` on the entry fetch.
2. Text survives a save: `cacheAfterSave` returns the saved content and the new sha, and entry.tsx calls `mutateEntry` with it and `revalidate: false` after a successful save; a refetch carrying the same content and sha does not reset the form.
3. A clean form still takes fresh server data (a refetch of a clean form resets it, so a file changed elsewhere still shows).
4. Leaving with unsaved edits warns: `needsLeaveWarning` is true when dirty and not saving; entry-form or entry wires a `beforeunload` listener and an in-app navigation guard that both use it, removed when clean.
5. A failed validation shows at the field: the source renders each field's own error message, and the toast is not the only signal.
Mutation check through the runner (`node C:\Users\roban\.claude\bin\project-test.cjs kc/tests/editor-guard.test.ts kc/tests/save-baseline.test.ts`): make `shouldResetForm` ignore `isDirty`, run, name the failing tests, restore, green. Second: drop the `mutateEntry` call after save, same steps.

Live look (the PM does this after deploy, not the worker): on the deployed CMS, type in a field, switch windows and back, save, type more, switch again; nothing typed is lost; clicking another file with unsaved text asks first.

## Boundaries
No commit, no push, no install, no deploy, no ssh to the box. No real network calls in tests. Never read a secret, `.env` or `/root/kc-cms-secrets`. Do not touch `app/api/` or `lib/auth.ts`. `project.md`'s Never list applies.

## Progress
Keep `progress.md` beside this file from your first step, one line per step that changes a file or finishes a unit of work: done, files, next, anything half-written. Already there? You are resuming: read it and check the disk against it first.

## Report
Write `result.md` beside this file, under 200 words: files changed, tests added, both mutation results naming the failing tests, any copy written, any call made and why. Say what was not done and what the PM should check on the live CMS.
