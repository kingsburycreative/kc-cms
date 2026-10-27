# Plan: customization register and PR guard

Rob's ask: track what each hosted client site and the fork itself depend on, and stop a PR (upstream merges included) that breaks one.

Shape: `kc/register/` holds one folder per client site and one list of the fork's own customizations, each naming the files it depends on and the tests that prove it. `kc/guard/` reads a PR's diff, names every customization it touches, and runs the register's tests. Those tests sit in `kc/tests/`, so the loop's gate runs them too.

Why a GitHub Action and not only the gate: `project-test.cjs` runs only for loop cards on Rob's machine. Upstream PRs are opened in Actions and Rob's own merges skip the gate, so only a required Action can block a merge.

## Wrong in the existing setup

1. Upstream PRs get no checks at all. `kc-upstream-sync.yml` opens them with `github.token` (lines 36, 47), and GitHub starts no `pull_request` workflow for events made with that token. Card 05 has the sync dispatch the guard, which posts a `kc-guard` commit status on the PR head. Unverified until card 06.
2. The fork is public (`kc-cms` PLAN.md:81), so a client `.pages.yml` fixture is client data in public. Card 00 asks first. My call: commit `.pages.yml` as is (it describes a public site), and store the insights map entry as its shape only, with placeholder IDs.
3. Plain `node --test` cannot load core's config: `lib/config.ts` imports through `@/`, and `fields/registry.ts` pulls `.tsx` editors. Card 01 tries `tsx`'s register API (already a dependency). If it fails, cards 03 to 09 park and the plan comes back.
4. `ci: none` in `project.md` would have the loop's merges refused once protection is on. Card 06 sets `ci: required`, with no loop running.
5. `KC_INSIGHTS_MAP` lives on the box, which no agent may read. Hence shape, not values.

The review comment (card 10) adds one thing the check cannot: reading an upstream change for behaviour no test covers. I would run it as a local loop pass on upstream PRs, never with an API key in a public repo's Actions. It waits on Rob.

## Cards

### 00. Rob: fixtures in public, map shape, Pitt St BBQ repo
Role: none, waiting on Rob.
Risky path: no (decision only).
Files:
- `.claude/work/66-plan-customization-guard/decisions.md`
Done-test: `decisions.md` records four answers in Rob's words. (a) Client `.pages.yml` snapshots go in the public fork as recommended, or the client part of the register moves to private `kingsburycreative/kc-cms-server`. (b) Which keys BeSciWorks's map entry has (`ga`, `cf`, `pages`), keys only, no values. (c) Pitt St BBQ's repo name and local clone path. (d) Whether card 10 runs at all. Confirmed by `node -e` checking that the file has the four labelled lines (a) to (d).

### 01. Load core config outside Next
Role: implementer.
Risky path: no.
Files:
- `kc/register/load-config.ts`
- `kc/tests/register-load.test.ts`
Done-test: `node --test kc/tests/register-load.test.ts` passes. `load-config.ts` registers `tsx/esm/api` and then dynamically imports `lib/config.ts` and `lib/schema.ts`. The test asserts three things: an inline minimal config (one file entry, one collection, a `kc:` block) gives zero errors from `parseAndValidateConfig`; an unknown field type gives an error naming that field; and a `kc:` block with an unknown key fails. If `tsx` cannot load `fields/core/*`, park the card with the failing module named.

### 02. Register of the fork's own customizations
Role: implementer.
Risky path: yes. It is a guard, and its entries name `lib/auth.ts`, `app/api/` and `kc/insights/`.
Files:
- `kc/register/customizations.json`
- `kc/register/customizations.ts`
- `kc/tests/register-customizations.test.ts`
Done-test: `node --test kc/tests/register-customizations.test.ts` passes. Entries come from BOARD.md Done and `git log`, and cover at least branding, client-view, branch lock, settings gate, insights, auth hardening (otp-limit, auth-ip, disabled paths, verified email, sign-in methods), media types, content ops, redact, avatar, commit identity, invite and email, history, seo panel, dashboard, short URLs and proxy, sidebar groups, page header, action-run claim, update banner and upstream watch, uptime, add-editor script and release version. Each entry has an id, the files it lives in, `watch` globs and its test files. The test asserts:
- every listed file and test exists;
- every file outside `kc/` and `.github/workflows/kc-*` that differs between the recorded `upstreamBase` sha and HEAD is claimed, and a failure names the unclaimed file;
- every upstream file importing `@/kc/` or `../kc/` is claimed.
Mutation: deleting the `short-url` entry fails, naming `proxy.ts`.

### 03. BeSciWorks site entry and fixture scan
Role: implementer.
Risky path: yes (client data). Needs card 00 (a, b) and card 01.
Files:
- `kc/register/sites/besciworks/pages.yml`
- `kc/register/sites/besciworks/site.json`
- `kc/register/sites.ts`
- `kc/register/site-check.ts`
- `kc/tests/register-sites.test.ts`
- `kc/tests/register-fixture-scan.test.ts`
Done-test: `node --test kc/tests/register-sites.test.ts kc/tests/register-fixture-scan.test.ts` passes. `pages.yml` is copied from `D:\Dev\htdocs\besciworks\.pages.yml`, with the source commit sha recorded in `site.json`. No fetch and no token. For every site, the test asserts:
- the config validates with zero errors;
- every content entry resolves through `getSchemaByName`, and `generateZodSchema` accepts its `initializeState` output (the editor path);
- `dashboardTiles` and `quickActions` give an href for every content entry and every `kc.actions` key, and `groupNavigation` keeps every entry;
- `resolveShort("/besciworks")` round-trips;
- `sourcesFor` on the placeholder map gives the keys from card 00 (b).

The scan test fails on any email address, `ghp_`, `github_pat_`, `-----BEGIN`, or a 32-plus character hex or base64 run under `kc/register/sites/`. Mutation: renaming `papers` in the fixture's `kc.actions` fails, naming it.

### 04. Guard: diff to customizations
Role: implementer.
Risky path: yes (guard).
Files:
- `kc/guard/affected.ts`
- `kc/guard/run.ts`
- `kc/tests/guard-affected.test.ts`
- `kc/tests/fixtures/guard/failing.fixture.ts`
Done-test: `node --test kc/tests/guard-affected.test.ts` passes. It asserts that:
- a diff of `lib/config.ts` names every client site;
- `components/repo/repo-sidebar.tsx` names client-view, branding, short URLs and sidebar groups;
- `README.md` names nothing;
- `run.ts --files <list>` prints each hit with its customization id, exits 1 when a named test fails (the fixture), exits 0 otherwise, and writes Markdown to `$GITHUB_STEP_SUMMARY` when that is set.

### 05. kc-guard workflow, upstream PRs included
Role: implementer.
Risky path: yes (`.github/workflows/`).
Files:
- `.github/workflows/kc-guard.yml`
- `.github/workflows/kc-upstream-sync.yml`
- `kc/tests/guard-workflow.test.ts`
Done-test: `node --test kc/tests/guard-workflow.test.ts` passes. It parses both workflows with `yaml` and asserts:
- `kc-guard` runs on `pull_request` to main and on `workflow_dispatch` with a `pr` input, and never on `pull_request_target`;
- its permissions are `contents: read`, plus `statuses: write` only in the dispatch job;
- every `uses:` is pinned to a 40-character sha;
- the dispatch job checks out `refs/pull/<pr>/merge` with `fetch-depth: 0`, runs `npm ci` and then `node kc/guard/run.ts`, and posts a commit status named `kc-guard` to the PR head;
- the sync workflow runs `gh workflow run kc-guard.yml -f pr=<number>` after `gh pr create` and has `actions: write`.

### 06. Rob: require kc-guard, live check
Role: none, waiting on Rob (repo settings), with the coordinator.
Risky path: yes (repo settings).
Files:
- `.claude/project.md`
Done-test: `gh api repos/kingsburycreative/kc-cms/branches/main/protection` lists `kc-guard` as a required check. `project.md` says `ci: required`, changed by the coordinator with no loop lock live. A throwaway PR touching `lib/config.ts` shows `kc-guard` naming BeSciWorks, and a `workflow_dispatch` run against it shows as `kc-guard` on that PR. If the dispatched status does not satisfy protection, item 1 above was wrong and card 05 comes back.

### 07. add-site command
Role: implementer.
Risky path: yes (client data).
Files:
- `kc/register/add-site.ts`
- `kc/tests/register-add-site.test.ts`
Done-test: `node --test kc/tests/register-add-site.test.ts` passes. Run on a temp git repo fixture, `add-site.ts <clone> <owner/repo> --keys ga,cf` writes `pages.yml` and `site.json` with the clone's HEAD sha and placeholder IDs. It refuses (exit 1, nothing written) when the scan from card 03 finds an email or a token pattern, and when the clone has no `.pages.yml`.

### 08. Coordinator: onboarding step in kc-cms
Role: none (coordinator, in `D:\Dev\htdocs\kc-cms`, like card 52).
Risky path: no.
Files:
- `D:\Dev\htdocs\kc-cms\docs\NEW-CLIENT.md`
Done-test: `node -e` asserts `NEW-CLIENT.md` has a step after step 10 naming `kc/register/add-site.ts`, who runs it (Claude) and its "you know it worked when" line (`node --test kc/tests/register-sites.test.ts` green with the new site).

### 09. Pitt St BBQ entry
Role: implementer.
Risky path: yes (client data). Needs card 00 (c) and its repo's `.pages.yml`.
Files:
- `kc/register/sites/<pitt-repo>/pages.yml`
- `kc/register/sites/<pitt-repo>/site.json`
Done-test: made with `add-site.ts`. `node --test kc/tests/register-sites.test.ts kc/tests/register-fixture-scan.test.ts` passes with two sites, and the test output names both.

### 10. Upstream review pass (only if card 00 (d) says yes)
Role: implementer.
Risky path: no.
Files:
- `kc/guard/REVIEW.md`
- `kc/tests/guard-review.test.ts`
Done-test: `node --test kc/tests/guard-review.test.ts` asserts `REVIEW.md` names every customization id in `customizations.json` and every site folder, so the brief a reviewer pass reads cannot drift from the register.

### 11. Security audit of the feature
Role: security-auditor.
Risky path: yes.
Files:
- `kc/register/`
- `kc/guard/`
- `.github/workflows/kc-guard.yml`
- `.github/workflows/kc-upstream-sync.yml`
Done-test: `result.md` covers four things. Whether a fork PR can reach `statuses: write` or any secret. Whether the dispatch input `pr` can be bent into another ref or into shell. Whether any fixture holds PII or a token. Whether the full suite (`node .claude/bin/project-test.cjs`) is green.
