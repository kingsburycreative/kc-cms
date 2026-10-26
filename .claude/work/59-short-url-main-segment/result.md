Files changed: kc/short-url.ts (full-path guard now reads segments[4]), kc/tests/short-url.test.ts.

Tests added: "a full path with main as its fifth segment gives null" (x/main, edit/main) and "every redirect rewrites back to the same full path" (10 full paths, with main later, encoded main, queries).

Mutation (index back to 5): both new tests failed. Restored: the full suite is green (417 pass). The runner ran the whole suite, not the filtered files.

Call made: the brief says `/kingsburycreative/site/main/main` gives null. It does not, and should not: it redirects to `/site/main`, which rewrites back to exactly `/kingsburycreative/site/main/main`, so the round trip holds. I left that assertion out of the null list and kept the path in the round-trip set.

Not done: `npx tsc --noEmit && npx eslint kc` (the worker rules forbid running it; the gate runs it).
