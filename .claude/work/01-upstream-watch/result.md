# 01 upstream-watch: result

Files: `kc/update/upstream.ts` (parse/compare semver, `newerRelease`), `kc/update/check.ts` (CLI: reads releases JSON + package.json version, prints the newer tag or nothing), `kc/tests/update.test.ts`, `.github/workflows/kc-upstream-sync.yml`.

Tests added (9): numeric semver compare, v prefix, prerelease below release, drafts/prereleases skipped, no newer gives null, newer gives newest tag, workflow weekly cron + dispatch + no pull_request_target, permissions exactly the two, `upstream/$TAG` branch + open-PR guard + no `${{ }}` inline in `run:`. Full suite: 10 pass.

Mutation: dropped the prerelease skip in `newerRelease`; "drafts and prereleases are skipped" failed (9 pass, 1 fail). Restored; 10 pass.

Calls: workflow uses actions/checkout and setup-node pinned by SHA (v4.2.2, v4.4.0; SHAs from memory, not verified online, please check). Tag is fetched from upstream by URL and pushed as `upstream/<tag>` with `--force` (only reached when no PR is open). Values reach `run:` only via `env:`.

Not done: `tsc`/`eslint` extra checks not run; security-auditor pass on the workflow is due (risky path).
