# 06 result

Files: kc/update/banner.ts, kc/update/banner-fetch.ts, kc/tests/banner.test.ts, kc/tests/fixtures/pulls/{none,one-upstream,non-upstream,foreign-url,several}.json, app/(main)/admin/page.tsx (one import, one `fetchBanner()` call, one banner block).

Tests added (8): none gives null; one upstream PR gives tag and url; non-upstream ignored; foreign URLs rejected (other repo, other host, http://); several PRs; garbage input; fetch success; fetch failures (throw, non-200, bad JSON) return null and log one line each, via an injected fetcher.

Mutation: removed the URL-prefix check and the empty-tag check. Failed: "foreign urls are rejected", "garbage input gives null". Restored; full suite 46/46 green. tsc and eslint kc exit 0.

Calls made:
- Several qualifying PRs: highest version wins (numeric compare via upstream.ts); unparseable tags rank below versions, then compare as text.
- Only status 200 counts as success.
- The runner ran the whole suite even with a file argument.

Not done: no render test for the admin page (no harness for it); banner not viewed in a browser.
