# 86 kc-shimmer result

Files changed: app/globals.css (.kc-shimmer, keyframes, reduced-motion rules), kc/dashboard-skeleton.tsx (BLOCK), kc/dashboard.tsx (two RecentChanges spans), kc/tests/dashboard-server.test.ts (skeleton test renamed "each skeleton uses the kc-shimmer block", asserts BLOCK has kc-shimmer), kc/tests/dashboard.test.ts (loading slice asserts kc-shimmer). Added kc/tests/kc-shimmer.test.ts (4 tests).

Mutation: removed `animation: none` from the reduced-motion rule. Full suite: 531 pass, 1 fail ("globals.css stills the shimmer under reduced motion"). Restored. Full suite: 532 pass, 0 fail.

No other changes. Extra checks not run.
