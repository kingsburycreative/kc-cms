Files changed: app/(main)/[owner]/[repo]/[branch]/insights/page.tsx (imports seriesSiteKey from @/kc/insights/route, loadSeries gets `site: seriesSiteKey(owner, repo)`); kc/tests/insights-page.test.ts.

Test added: "series cache is keyed on seriesSiteKey, not the typed path" (import present, call uses it, template literal absent).

Mutation: put the template-literal site back; the new test failed (not ok 232), 464 passed. Restored; green, 465 pass, 0 fail.

Note: the runner ignores the path filter and runs the whole suite (465 tests). The brief's runner path (C:\Users\roban\.claude\bin) was wrong for this project, so I used .claude/bin in the project.

Not done: nothing outstanding. route.ts untouched.
