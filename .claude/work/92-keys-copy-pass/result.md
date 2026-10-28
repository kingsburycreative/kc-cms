# 92 result

Files: kc/insights/keys.ts (two string values), kc/tests/insights-keys.test.ts (one new test).

Skills run with the Skill tool: prose, then avoid-ai-writing, then humanizer. The last two found nothing to change.

Strings, old -> new:
- NOT_ADMIN: "Only an admin of this repository on GitHub can change these IDs." -> "Only a GitHub admin of this repository can change these IDs."
- BAD_ID.cf: "The Cloudflare site tag can only use letters, digits and dashes." -> "The Cloudflare site tag can only use letters, digits, dashes and underscores." (now matches siteTag `/^[A-Za-z0-9_-]+$/`)
- Unchanged: NOT_STAFF "Only KC staff can change these IDs."; TAKEN.ga/cf/pages "Another site already uses this GA4 property ID. / Cloudflare site tag. / Pages project."; NOT_SAVED "The IDs weren't saved. Try again."; BAD_ID.ga "The GA4 property ID must be digits only."; BAD_ID.pages "The Pages project can only use lowercase letters, digits and dashes." (matches gaId, pagesProject); savedText "Saved. GA4: X, Cloudflare: Y, Pages: none." keeps its three values.

Test added: "the Cloudflare tag message names underscores, which the validator accepts".

Mutation: old BAD_ID.cf text put back; only that new test failed (552/553). Restored: 553 pass. tsc and eslint kc exit 0.

Note: the runner ran the whole suite (553 tests) even with the file argument.
