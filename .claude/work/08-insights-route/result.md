# 08 insights-route: result

**Files**: new `kc/insights/map.ts` (map parse, load, lookup) and `kc/insights/route.ts` (key read, one-hour cache, pagePath trim, runReport calls, card assembly, one-line status-only error log); new `app/(main)/[owner]/[repo]/[branch]/insights/page.tsx`; sidebar hook in `layout.tsx`, `repo-layout.tsx`, `repo-sidebar.tsx`; new fixtures in `kc/tests/fixtures/insights-route/`.

**Tests**: `kc/tests/insights-route.test.ts`, 8 tests: good/malformed/non-numeric/missing map, lookup, cache expiry with injected clock, trim, cards loaded and cached, report-failure and token-failure logging (status only, no ID, token, body or URL).

**Gate**: full suite 55/55 through the runner; `tsc --noEmit` and `eslint kc` clean.

**Mutation**: cache expiry `>` changed to `>=`; "the cache holds a report for one hour, then reloads" failed. Restored, green.

**Calls**:
- Access check reuses `getRepoReadContext`, the one the repo API routes use. If it throws, the page shows "Access denied". The property lookup only runs after that.
- Sidebar: the server layout computes `hasInsights` (a boolean, only when there's no access error) and passes it as a prop through `RepoLayout` to `RepoSidebar`. The item sits in its own "Site" group, visible to clients too.
- A missing key file shows the failure message and logs nothing.

**Not done**: security-auditor pass (coordinator's job); no live GA4 check.
