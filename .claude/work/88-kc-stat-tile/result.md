Round 2.

Changed: kc/dashboard-skeleton.tsx (VisitsSkeleton now renders StatTileSkeleton in place of its own ul with min-[480px]:grid-cols-3), kc/tests/stat-tile.test.ts (new test: VisitsSkeleton imports and uses StatTileSkeleton, has no ul, li or min-[480px]). Round 1 files unchanged: kc/stat-tile.tsx, kc/dashboard-server.tsx, dashboard tests.

Same grid and tile count as the real tiles now come from one place (STAT_GRID, STAT_TILE_COUNT = 3).

avoid-ai-design (detect, dashboard profile): run via the Skill tool on kc/stat-tile.tsx. No findings. No eyebrow, gradient, beige, icon-in-square or mirrored copy. Number first, sentence-case label, shimmer skeleton. Nothing changed.

Copy: "Not available", "None the 30 days before", "up/down on the 30 days before" (screen reader). No new visible text this round.

Mutation: base grid changed to grid-cols-1. Failed: "the grid is two columns at the base width, with no breakpoint prefix". Restored, run green (538 pass).

Not run: tsc and eslint (left to the gate, per runner rules).
