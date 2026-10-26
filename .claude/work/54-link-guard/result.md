Added `kc/tests/short-url-links.test.ts` (two tests). It scans components/, fields/, kc/ (not kc/tests), app/(main)/ and lib/actions/collaborator.ts for template literals starting `/${..owner..}/${..repo..}`. It requires `shortHref(` on the same line or the two lines above, unless the `file:line` text matches the allowlist. A second test fails on any allowlist entry that matches no line.

Allowlist:
- `/api/`: API calls, not pages
- `github.com`: links to GitHub
- `raw.githubusercontent.com`: raw GitHub file URLs
- `lib/actions/collaborator.ts`: invite email builds a full path, the 308 covers it
- `kc/dashboard.ts` `const base = \``: base is only used through `link()`, which wraps in shortHref (two lines)

Real unwrapped page links found: none.

Mutation (via runner): unwrapped one link in entry.tsx (line 476) and one in repo-sidebar.tsx (line 153), and added a stale entry. Failed: "every in-app page link template is wrapped in shortHref or allowlisted", "every allowlist entry still matches a line", and the older "every in-app page link template is wrapped in shortHref" (card 49). All three files restored; the run was then green (369 pass, 0 fail). The runner ran the whole suite each time, not only the filter.

Not done: `npx tsc --noEmit && npx eslint kc` not run by me, per worker rules; the gate runs them.
