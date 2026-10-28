# 86. kc-shimmer (Small)

## Goal
Dashboard skeletons use one shared left-to-right shimmer instead of Tailwind's `animate-pulse`, holding still under `prefers-reduced-motion`.

## Files you may touch
- `app/globals.css`
- `kc/dashboard-skeleton.tsx`
- `kc/dashboard.tsx`
- `kc/tests/kc-shimmer.test.ts` (new)
- `kc/tests/dashboard-server.test.ts` (only the skeleton animate-pulse assertion, lines ~111-112: now kc-shimmer)
- `kc/tests/dashboard.test.ts` (only the pulsing-skeleton assertion, line ~297: now kc-shimmer)

## Do
1. In `app/globals.css` (claimed as "branding" in `kc/register/customizations.json`, so no register change), add a `.kc-shimmer` class and `@keyframes kc-shimmer`, adapted from `D:\Dev\htdocs\ui-library\core\base.css` lines 12-40: base is a still block, `background-color: var(--muted)`; inside `@media (prefers-reduced-motion: no-preference)` add `background-image: linear-gradient(90deg, var(--muted) 0%, var(--accent) 50%, var(--muted) 100%)`, `background-size: 200% 100%`, and `animation: kc-shimmer 1.6s ease-in-out infinite`, keyframes `from { background-position: 100% 0 } to { background-position: -100% 0 }`. Also add an explicit `@media (prefers-reduced-motion: reduce) { .kc-shimmer { animation: none; background-image: none; } }`. Put it in a plain CSS layer/block that Tailwind v4 keeps (e.g. `@layer components` or `@utility`-free plain rule), matching how the file already writes custom rules.
2. `kc/dashboard-skeleton.tsx`: `BLOCK` becomes `"rounded kc-shimmer"`.
3. `kc/dashboard.tsx` RecentChanges pulse spans (around line 169-170): replace `animate-pulse ... bg-muted motion-reduce:animate-none` with `kc-shimmer`, keep sizes and rounding.
4. Do not touch `components/ui/*`.

## Done-test
`kc/tests/kc-shimmer.test.ts` reads the three sources as text and asserts: no `animate-pulse` in either tsx file; both use `kc-shimmer`; globals.css defines `.kc-shimmer`, `@keyframes kc-shimmer`, and a `prefers-reduced-motion: reduce` block that sets `animation: none` for `.kc-shimmer`. Run it through `node C:\Users\roban\.claude\bin\project-test.cjs` (the runner), not raw node.

## Mutation check
Delete the reduced-motion rule from globals.css, run the test through the runner and see it fail, restore, run green.

## Rules
Relative imports with `.ts` extensions in tests. No commits. No `npm install`. Keep `.claude/work/86-kc-shimmer/progress.md` updated after each step (done, files touched, next step). Write `result.md` beside this brief when done.
