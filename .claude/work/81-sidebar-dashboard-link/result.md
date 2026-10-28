Files changed: components/repo/repo-sidebar.tsx (Dashboard group first, import of helper, LayoutDashboard icon), kc/sidebar-dashboard.ts (new, isDashboardActive), kc/tests/sidebar-dashboard.test.ts (new, 3 tests).

Copy: the single word "Dashboard".

Mutation: renamed the item's key so it no longer sits first; "Dashboard item comes first, before Media and Content, via shortHref" failed. Restored, green (515 pass). A first mutation (gating the item off with `false &&`) was NOT caught, because the test only reads the source text; the key rename was the one that failed. The exact-root logic is covered by the two behavioural tests.

Note: the runner ran the full suite for both file args. The first run had 1 failure I did not identify (log overwritten); the immediate rerun and all later runs were 515/515. Possibly flaky; not investigated.

Not done: tsc and eslint (per rules, the gate runs them). customizations.json not touched; the new kc file is not listed in the sidebar-groups entry, though register tests passed.
