# 98. Route skeleton in place of the Loading spinner (Normal)

Project: D:\Dev\htdocs\kc-cms-app. Read `.claude/project.md` first (Never list, upstream-merge rule, test rules: relative imports with `.ts`, no `@/` in kc/ code).

## Task
Board card **route-skeleton** in `kc/BOARD.md` (global rule 8). Opening a site shows a full page with only a centred spinner and "Loading" for about 4 s, from `app/loading.tsx` and `app/(main)/loading.tsx` (both upstream files, named by the card). Replace both with a skeleton in the final page shape.

- Build it in a new `kc/route-skeleton.tsx` (export `RouteSkeleton`), using the shimmer block idiom from `kc/dashboard-skeleton.tsx` (`rounded kc-shimmer`; the shimmer already stops under prefers-reduced-motion in app/globals.css). Shape: a header bar, and a content area of placeholder blocks; from `md` up, a sidebar column on the left with placeholder rows. Mobile first: base styles are the phone layout (no sidebar column, header plus blocks); the sidebar is added with `hidden md:flex` or equivalent. `aria-busy="true"` and an `aria-label` on the wrapper. No text visible to the user.
- Each `loading.tsx` becomes the smallest hook: import `RouteSkeleton` from `@/kc/route-skeleton` (upstream files may use `@/`) and render it. No Loader import left.
- Add the two upstream files to `kc/register/customizations.json` the way existing entries are written, so `kc/tests/register-customizations.test.ts` stays green.

## Files you may touch
- `kc/route-skeleton.tsx` (new)
- `app/loading.tsx`
- `app/(main)/loading.tsx`
- `kc/register/customizations.json`
- `kc/tests/route-skeleton.test.ts` (new)
- `.claude/work/98-route-skeleton/result.md`
- `.claude/work/98-route-skeleton/progress.md`

## Done-test
`node --test kc/tests/route-skeleton.test.ts` passes, reading sources as text like `kc/tests/kc-shimmer.test.ts` does, asserting: neither loading.tsx imports or renders `Loader`; both render `RouteSkeleton`; `kc/route-skeleton.tsx` uses `kc-shimmer`, has `aria-busy`, and its sidebar column is hidden at base width and shown from a `md:` breakpoint. `node --test kc/tests/register-customizations.test.ts` and `kc/tests/kc-shimmer.test.ts` still pass. Then the mutation check through the runner `node C:\Users\roban\.claude\bin\project-test.cjs`: put the Loader back in `app/(main)/loading.tsx`, then drop `kc-shimmer` from route-skeleton, one at a time; run, record which tests failed, restore, run green.

## Rules
- Fixtures only, no network. No screenshots needed in this pass; say "not seen in a browser" in result.md.
- Keep `progress.md` beside this brief, updated after each step (done, files touched, next step, anything half-written).
- Do not commit. Write `result.md`: what was built, tests added, mutation results.
