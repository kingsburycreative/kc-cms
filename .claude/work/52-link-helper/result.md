# 52 result

Files changed: kc/client-view.ts, kc/dashboard.ts, kc/dashboard.tsx, kc/history/history-view.tsx, components/repo/{repo-nav,repo-sidebar,repo-dropdown,repo-branches,repo-latest,repo-action-buttons,repo-templates}.tsx (page links wrapped in `shortHref`, one import line each), kc/tests/dashboard.test.ts, kc/tests/client-view.test.ts. `kc/short-url.ts` already exported `shortHref`; restored unchanged after the mutation.

Tests added: short hrefs for kingsburycreative/main and full form for acme or dev (dashboard); one-repo client link `/besciworks` (client-view); a source test pinning the `/api/` count at 8 across the touched files (recorded before editing).

Mutation: `shortHref` returned its input. Failed: client-view "the one-repo client link uses the short address...", dashboard "hrefs use the short address...", plus short-url "shortHref leaves other paths alone" and "20 sample full paths round trip". Restored, green (364 pass).

Not run: tsc and eslint (told not to run checks; the gate runs them). Line numbers in the brief were approximate, so I wrapped every page link in the listed files, including router.push calls in repo-sidebar and repo-dropdown.
