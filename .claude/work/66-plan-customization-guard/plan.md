# Plan: customization register and PR guard

Rob's ask: track what each hosted client site and the fork itself depend on, and stop a PR (upstream merges included) that breaks one. Re-planned from card 03 on 2026-10-27 after Rob's answers (`D:\Dev\htdocs\kc-cms\audits\2026-10-27-customization-guard-decisions.md`): client data stays private. This file is in a public repo, so it names no client; "first site" and "second site" are answers (b) and (c) there.

Shape: the public fork keeps the fork's own register (done), a client-free check API and the `kc-guard` workflow. Client entries live in private `kingsburycreative/kc-cms-server` under `clients/`, and a workflow there checks them against every open public PR.

Picked: the private workflow, not a gate in `project-test.cjs`. Security first: `.claude/work/` is tracked in this public repo, so a local gate's output would put client names in public commits, while the private run keeps them in private logs and posts only a fixed pass or fail line. Correct long-term second: only a required status blocks upstream PRs and Rob's own merges, which a local gate never sees. The private workflow polls open PRs hourly, so the public repo holds no token, and the coordinator can dispatch it at once with Rob's `gh` login. Its test job runs PR code with no secret; a report job that never checks out PR code posts `kc-clients` with Rob's token. An expired token posts nothing, so protection blocks: it fails closed.

## Wrong in the existing setup

1. Upstream PRs get no checks: `kc-upstream-sync.yml` opens them with `github.token` (lines 36, 47). Card 07 dispatches `kc-guard`; the poll covers `kc-clients`.
2. Old card 06's `ci: required` is dropped. The loop's `ciState` sees only posted checks, so it would call a PR green before `kc-clients` posts. `ci` stays `none`; Rob or the coordinator merges.
3. Client names are already public: about 140 mentions in 34 tracked files, among them `kc/short-url.ts`, tests and `public/guides/`. This plan adds none. A scrub is Rob's call, outside this plan.
4. Rob's answers file says to copy it into `decisions.md` here. Don't: it holds client names and map keys. It stays in kc-cms.
5. `extra_checks` in `project.md` is read by nothing in `.claude/bin/`, so `tsc` and `eslint kc` never gate a card.
6. The second site's clone has no `.pages.yml`; card 10 waits for one.
7. zod 4 rewrites about 20 upstream files, against "upstream merges must stay clean". Check upstream's zod first; if upstream moved, take it through an upstream merge.

## Cards

### 00. Rob: fixtures in public, map shape, second site's repo
Role: none, waiting on Rob. Done 2026-10-27.
Risky path: no (decision only).
Files:
- `D:\Dev\htdocs\kc-cms\audits\2026-10-27-customization-guard-decisions.md`
Done-test: the file records (a) to (d) in Rob's words. Done.

### 01. Load core config outside Next
Role: implementer. Done, merged.
Risky path: no.
Files:
- `kc/register/load-config.ts`
- `kc/tests/register-load.test.ts`
Done-test: `node --test kc/tests/register-load.test.ts` passes. Done.

### 02. Register of the fork's own customizations
Role: implementer. Done, merged.
Risky path: yes (guard).
Files:
- `kc/register/customizations.json`
- `kc/register/customizations.ts`
- `kc/tests/register-customizations.test.ts`
Done-test: `node --test kc/tests/register-customizations.test.ts` passes. Done.

### 03. Rob: status token for kc-clients
Role: none, waiting on Rob. Can start now.
Risky path: yes (a write token).
Files:
- `D:\Dev\htdocs\kc-cms\audits\2026-10-27-customization-guard-decisions.md`
Done-test: Rob makes a fine-grained token, owner kingsburycreative, repository `kc-cms` only, permission Commit statuses read and write and nothing else, with an expiry, and sets it with `gh secret set KC_STATUS_TOKEN -R kingsburycreative/kc-cms-server`, pasting at the prompt, never into a file or a chat. `gh secret list -R kingsburycreative/kc-cms-server --json name` (names only) includes `KC_STATUS_TOKEN`. The answers file gains (e): the expiry date, and Rob's yes to the Actions minutes (an hourly poll bills about 720 a month on a private repo).

### 04. Rob: package.json exception for deps-majors
Role: none, waiting on Rob; the coordinator writes the line, with no loop lock live.
Risky path: no (decision only).
Files:
- `.claude/project.md`
Done-test: `node -e` asserts `project.md` has an `Exception (Rob, ...)` line naming deps-majors that allows editing `package.json` and `package-lock.json` and running `npm install` for nodemailer 10 and zod 4 only.

### 05. Client-free site check API
Role: implementer.
Risky path: no. The fixture is invented, not a client.
Files:
- `kc/register/site-check.ts`
- `kc/tests/fixtures/register/example-site/pages.yml`
- `kc/tests/register-site-check.test.ts`
Done-test: `node --test kc/tests/register-site-check.test.ts` passes. `checkSite({ pagesYml, slug, mapKeys })` returns `{ ok, failures: [{ check, detail }] }` and runs, through `load-config.ts`:
- the config validates with zero errors;
- every content entry resolves through `getSchemaByName`, and `generateZodSchema` accepts its `initializeState` output;
- `dashboardTiles` and `quickActions` give an href for every content entry and every `kc.actions` key, and `groupNavigation` keeps every entry;
- `resolveShort("/<slug>")` round-trips;
- `sourcesFor` on a placeholder map built from `mapKeys` gives exactly those keys.
The test asserts the example site passes, and that renaming a `kc.actions` key in a copy of the fixture fails with that key in `detail`.

### 06. Guard: diff to customizations
Role: implementer.
Risky path: yes (guard).
Files:
- `kc/guard/affected.ts`
- `kc/guard/run.ts`
- `kc/tests/guard-affected.test.ts`
- `kc/tests/fixtures/guard/failing.fixture.ts`
Done-test: `node --test kc/tests/guard-affected.test.ts` passes. It asserts:
- `components/repo/repo-sidebar.tsx` names client-view, branding, short URLs and sidebar groups;
- `lib/config.ts` names every customization whose `watch` covers it;
- `README.md` names nothing;
- `run.ts --files <list>` prints each hit with its customization id, exits 1 when a named test fails (the fixture), 0 otherwise, and writes Markdown to `$GITHUB_STEP_SUMMARY` when set.

### 07. kc-guard workflow, upstream PRs included
Role: implementer.
Risky path: yes (`.github/workflows/`).
Files:
- `.github/workflows/kc-guard.yml`
- `.github/workflows/kc-upstream-sync.yml`
- `kc/tests/guard-workflow.test.ts`
Done-test: `node --test kc/tests/guard-workflow.test.ts` passes. It parses both files with `yaml` and asserts:
- `kc-guard` runs on `pull_request` to main and on `workflow_dispatch` with a `pr` input, never on `pull_request_target`;
- permissions are `contents: read`, plus `statuses: write` only in the dispatch job;
- every `uses:` is pinned to a 40-character sha;
- the dispatch job checks `pr` against `^[0-9]+$` before use, checks out `refs/pull/<pr>/merge` with `fetch-depth: 0`, runs `npm ci` and `node kc/guard/run.ts`, and posts a `kc-guard` status to the PR head;
- neither file contains `secrets.` or `kc-cms-server`;
- the sync runs `gh workflow run kc-guard.yml -f pr=<number>` after `gh pr create` and has `actions: write`.

### 08. Private: first site's entry and the check runner (in kc-cms)
Role: implementer, run by the kc-cms loop.
Risky path: yes (client data). Needs card 05 merged.
Files:
- `D:\Dev\htdocs\kc-cms\clients\<first-site>\pages.yml`
- `D:\Dev\htdocs\kc-cms\clients\<first-site>\site.json`
- `D:\Dev\htdocs\kc-cms\clients\check.mjs`
- `D:\Dev\htdocs\kc-cms\server\tests\clients-register.test.mjs`
- `D:\Dev\htdocs\kc-cms\server\tests\clients-scan.test.mjs`
Done-test: `node --test server/tests/clients-register.test.mjs server/tests/clients-scan.test.mjs` passes in kc-cms. `pages.yml` is copied from the first site's clone; `site.json` holds the repo, the source sha, the slug and the key names from answer (b), no values. The register test asserts that shape for every folder under `clients/`; the scan test fails on any email address, `ghp_`, `github_pat_`, `-----BEGIN`, or a 32-plus character hex or base64 run there. `node clients/check.mjs --app D:\Dev\htdocs\kc-cms-app` calls `checkSite` for each folder, exits 0 naming the site, and exits 1 naming a `kc.actions` key renamed on purpose.

### 09. Private: add-site command (in kc-cms)
Role: implementer, run by the kc-cms loop.
Risky path: yes (client data).
Files:
- `D:\Dev\htdocs\kc-cms\clients\add-site.mjs`
- `D:\Dev\htdocs\kc-cms\server\tests\clients-add-site.test.mjs`
Done-test: `node --test server/tests/clients-add-site.test.mjs` passes. On a temp git repo fixture, `add-site.mjs <clone> <owner/repo> --keys ga,cf` writes `pages.yml` and `site.json` with the clone's HEAD sha. It exits 1 and writes nothing when the card 08 scan finds an email or token pattern, or when the clone has no `.pages.yml`.

### 10. Private: second site's entry (in kc-cms)
Role: implementer, run by the kc-cms loop.
Risky path: yes (client data). Waits until the clone named in answer (c) has a `.pages.yml` (item 6).
Files:
- `D:\Dev\htdocs\kc-cms\clients\<second-site>\pages.yml`
- `D:\Dev\htdocs\kc-cms\clients\<second-site>\site.json`
Done-test: made with `add-site.mjs`, keys from Rob. The card 08 tests pass with two folders, and `node clients/check.mjs --app D:\Dev\htdocs\kc-cms-app` exits 0 naming both.

### 11. Private: kc-clients workflow (in kc-cms)
Role: implementer, run by the kc-cms loop.
Risky path: yes (workflow with a cross-repo write token). Needs cards 03 and 08.
Files:
- `D:\Dev\htdocs\kc-cms\.github\workflows\kc-clients.yml`
- `D:\Dev\htdocs\kc-cms\clients\open-prs.mjs`
- `D:\Dev\htdocs\kc-cms\server\tests\clients-workflow.test.mjs`
Done-test: `node --test server/tests/clients-workflow.test.mjs` passes. It parses the workflow with `yaml` and runs `open-prs.mjs` on a saved `gh` JSON fixture, asserting:
- triggers are an hourly `schedule` and `workflow_dispatch` with a `pr` input checked against `^[0-9]+$`;
- `open-prs.mjs` keeps only open PRs on `kingsburycreative/kc-cms` whose head repo is `kingsburycreative/kc-cms` (a stranger's fork PR is dropped, since its code would run beside client data) and whose head sha has no `kc-clients` status;
- the test job has `contents: read` only, no `secrets.` reference, checks out the PR head sha and this repo, runs `npm ci` and `check.mjs`, and hands on only pass or fail;
- the report job `needs` the test job, has no checkout step, is the only place `secrets.KC_STATUS_TOKEN` appears, and posts context `kc-clients` with a description that is exactly `Client sites pass` or `A client site fails, see the private run`;
- every `uses:` is pinned to a 40-character sha.

### 12. Coordinator: onboarding step in kc-cms
Role: none (coordinator, in `D:\Dev\htdocs\kc-cms`).
Risky path: no.
Files:
- `D:\Dev\htdocs\kc-cms\docs\NEW-CLIENT.md`
Done-test: `node -e` asserts `NEW-CLIENT.md` has a step after step 10 naming `clients/add-site.mjs`, who runs it (Claude), and its "you know it worked when" line (`node clients/check.mjs --app ...` exits 0 naming the new site).

### 13. Rob: require both checks, live run
Role: none, waiting on Rob (repo settings), with the coordinator.
Risky path: yes (repo settings).
Files:
- `D:\Dev\htdocs\kc-cms\audits\2026-10-27-customization-guard-decisions.md`
Done-test: `gh api repos/kingsburycreative/kc-cms/branches/main/protection` lists `kc-guard` and `kc-clients` as required. A throwaway PR touching `lib/config.ts` gets both, `kc-clients` after `gh workflow run kc-clients.yml -R kingsburycreative/kc-cms-server -f pr=<n>`. A second throwaway PR breaking `quickActions` shows `kc-clients` failing, and `gh api repos/kingsburycreative/kc-cms/commits/<sha>/statuses` shows the fixed description and no client name. A dispatched `kc-guard` satisfies protection; if not, item 1 was wrong and card 07 comes back. `.claude/project.md` keeps `ci: none`.

### 14. deps-majors: nodemailer 10 and zod 4
Role: implementer.
Risky path: yes (dependencies, `lib/` schema code, mail). Needs card 04; runs after 13 so both checks cover it.
Files:
- `package.json`
- `package-lock.json`
- `lib/mailer.ts`
- `lib/config-schema.ts`
- `lib/schema.ts`
- `lib/config.ts`
- `fields/registry.ts`
- `kc/client-view.ts`
Done-test: `npm audit --omit=dev --audit-level=high` exits 0. `node --test "kc/tests/**/*.test.ts"` is green, `npx tsc --noEmit` reports 0, and `npm run build` compiles (stopping on `BASE_URL` after compile, as in card 69, is fine). If zod 4 needs changes past these files (`lib/actions/`, `fields/core/*` also import it), the card parks with the list for Rob instead of growing.

### 15. Security audit of the feature
Role: security-auditor.
Risky path: yes.
Files:
- `kc/register/`
- `kc/guard/`
- `.github/workflows/kc-guard.yml`
- `.github/workflows/kc-upstream-sync.yml`
- `D:\Dev\htdocs\kc-cms\.github\workflows\kc-clients.yml`
- `D:\Dev\htdocs\kc-cms\clients\`
- `package.json`
Done-test: `result.md` answers each of these:
- can a public PR or a fork reach `KC_STATUS_TOKEN`, `statuses: write`, or code running beside `clients/`?
- can either `pr` input be bent into another ref or into shell?
- does any client name or map key reach the public repo, its statuses, its Actions logs or `.claude/work/` through this feature?
- can a same-repo PR post `kc-clients` itself?
- did the deps-majors diff change mail or validation behaviour?
- are `node .claude/bin/project-test.cjs` and kc-cms's suite both green?
