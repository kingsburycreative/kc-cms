# Result, round 2

Files changed: `kc/client-view.ts`, `kc/tests/client-view.test.ts`, `components/repo/repo-select.tsx` (plus round 1's files, kept).

Added to `kc/client-view.ts`: `repoHref`, `soleRepoRedirect(isClient, keyword, repos)`, `repoListLabel(isClient, repo)`.

repo-select.tsx: an effect calls `router.replace` when `soleRepoRedirect` returns an href (client, no search typed, not loading, exactly one repo). List links use `repoHref`, so the href is the same as before. The label is `repoListLabel`, which gives the fallback dashboard name for a client and the repo name for Rob.

Tests added: 2 (redirect cases: client/Rob, keyword, 0/1/2/null repos, branch encoding; label for client/Rob).

Mutation: changed `repos.length !== 1` to `< 1`. Failed: "a client with one unfiltered repo is redirected, nobody else". Restored, green (38 pass, 0 fail). `tsc --noEmit` and `eslint kc` exit 0.

Call made: the redirect keys off the debounced keyword, so it never fires mid-search. The runner ran all 38 tests despite the file filter; I did not run the suite separately.

Not done: the label for a repo whose `.pages.yml` sets `kc.client` (per the brief's decision).
