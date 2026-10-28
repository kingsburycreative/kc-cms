# 98 route-skeleton result

Built `kc/route-skeleton.tsx` (`RouteSkeleton`: header bar, content blocks, `hidden md:flex` sidebar of placeholder rows, `aria-busy` and `aria-label`, no visible text). `app/loading.tsx` and `app/(main)/loading.tsx` now only render it; no Loader import. Added a `route-skeleton` entry to `kc/register/customizations.json`.

Tests added: `kc/tests/route-skeleton.test.ts` (4 tests). The runner ran the whole suite each time (581 tests, all green; register-customizations and kc-shimmer included).

Mutation:
1. Loader put back in `app/(main)/loading.tsx`: "neither loading.tsx uses Loader" failed. Restored.
2. `kc-shimmer` dropped from route-skeleton: first run did NOT fail, because the file's header comment also says "kc-shimmer". Tightened the test to match the `BLOCK` constant; the rerun failed "route skeleton shimmers and is aria-busy". Restored, green.

Copy: none written (aria-label "Loading page" is screen-reader only). Not seen in a browser.
