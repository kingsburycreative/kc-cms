# 50 result

Files: `kc/short-url.ts`, `kc/tests/short-url.test.ts`, `kc/tests/short-url-reserved.test.ts` (all new). tsc and eslint exit 0; all 353 tests pass (the runner ran the whole suite whatever args I gave).

Mutation (each restored, then green):
- `admin` removed from RESERVED: "every top-level app/ folder is reserved" and "reserved and odd first segments give null" failed.
- Branch compared decoded: "other owners, branches and an encoded branch give null" failed.
- Method check dropped: "a POST to a full path gives null" failed.

Calls I made:
- The plan asserts `/other-owner/x/main` gives null, but it would otherwise rewrite as repo `other-owner`. I return null for a short path whose third segment decodes to `main`. `shortHref` and the redirect keep the full form when a later segment (index 5) is `main`, so the round trip holds. Cost: a collection named `main` gets no short form on that deep path.
- RESERVED also holds `icon.svg` (a file under `app/`). First segments containing `%` after one decode are rejected (double encoding).
- Used `.claude/bin/project-test.cjs`, not the global path the brief names.

Not done: nothing.
