# 61 result

Files changed: `kc/page-header.tsx` (optional `action` slot), `kc/dashboard.tsx` (LiveSiteLink moved into `PageHeader action`, memoised), `kc/tests/dashboard.test.ts` (new test), `kc/tests/page-header.test.ts` (loosened to allow an `action` prop), `kc/tests/dashboard-sections.test.ts` (round 3: `split("\n")` became `split(/\r?\n/)` so the CRLF checkout passes).

Tests added: "See live site sits in the PageHeader bar, not the dashboard header".

Mutation (round 3, via runner): LiveSiteLink put back in the dashboard `<header>`; full run failed 1 test: "See live site sits in the PageHeader bar, not the dashboard header" (not ok 143). Restored; full run 418 pass, 0 fail.

Not run: tsc and eslint (the gate runs them). Tests are source-regex only; no rendered phone check.
