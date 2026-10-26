# 43 result

Files: `kc/seo/site.ts`, `kc/tests/seo-site.test.ts`, `kc/tests/fixtures/seo/{weekly,page,paper}.json`.

Tests: 9 in seo-site.test.ts, all green (full suite 303 pass, the runner ran everything).

Mutation:
- Counting the reading-grade check failed "a page file with no body is not failed..." and "a high reading grade alone leaves the entry passing...".
- Removing the body guard on counted checks failed nothing: h1, order and alt all pass on an empty body, so that guard is redundant today. Call made: I added an assertion that a page file has no advice, then dropped the guard on advice (`hasBody ? ... : []`); that failed "a page file with no body is not failed for a missing body". Restored, green.

Calls: `seoTargets` returns `{title, description, body}` booleans. An entry is "not checked" when title or description is not a string (so papers, which have `abstract`). `siteHealth` entries are `{name, path, values}`; each fix item also carries `advice`.

Round two: tsc errors at lines 25 and 40 were because `assert.equal(status, "pass")` already narrows the union, so the `!== "notChecked"` guards were dead. Removed the guards; assertions unchanged. Runner 303 pass, `npx tsc --noEmit` exit 0, `npx eslint kc` exit 0. No new copy.
