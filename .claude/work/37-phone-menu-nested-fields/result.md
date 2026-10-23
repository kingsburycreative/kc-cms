# Result, card 37

Changed: `kc/page-header.tsx` (new), `kc/dashboard.tsx`, `kc/history/history-view.tsx` (both views), `kc/history/diff.ts` (`compare` now always recurses; schema label else key; shape changes split into removed plus added), `app/(main)/[owner]/[repo]/[branch]/insights/page.tsx`, `kc/tests/page-header.test.ts` (new), `kc/tests/history-diff.test.ts`.

Tests added: 5 in page-header (component, three pages, both History views), 4 in history-diff (object of strings, no-fields by key, schema labels "Hero > Breadcrumb label", list of objects). One existing test changed: "a list item added whole" now expects "Team > 4 > Name" and "Team > 4 > Role", as the brief requires.

Mutation: removed `<PageHeader title="Dashboard" />` from dashboard; failed "the dashboard page renders the header component with its title". Restored, green. tsc and eslint exit 0.

Calls: the runner ignored file args and ran the whole suite each time (250 pass). The brief's runner path was the global one; I used the project copy. PageHeader renders only in the main branch of Dashboard and Insights, not the empty/error states. Pages keep their own h1, so a page has two h1s at desktop; Rob may want the in-page one dropped.

Copy: "Dashboard", "History", "Insights" only (existing sidebar names; skills not invoked).

Not done: 375 browser check.
