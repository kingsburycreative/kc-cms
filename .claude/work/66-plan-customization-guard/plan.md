# Plan: customization register and local guard

Rob's ask: track what each hosted client site and the fork itself depend on, and stop a change that breaks one. Re-planned 2026-10-27 after Rob's decision: no GitHub Actions, no schedule, no Docker, no server. Every change that can break a client comes from Rob at this PC (core pushes to kc-cms-app, edits to a client repo's `.pages.yml`), and clients have no GitHub access. So the guard runs here, at push time. Answers: `D:\Dev\htdocs\kc-cms\audits\2026-10-27-customization-guard-decisions.md`. This file is in a public repo, so it names no client; "first site" and "second site" are answers (b) and (c) there.

Shape: the public repo keeps the fork's register (done), a client-free check API and a local guard. Client entries live in private `kc-cms` (`kingsburycreative/kc-cms-server`) under `clients/`; their check runner is there too.

## Wiring (one line)

Git pre-push hooks, versioned in `.githooks/` and switched on by an installer script (hooks are not versioned, so the installer is the step Rob runs once), because the breaking pushes are Rob's manual ones, which the loop's gate never sees; the loop gate stays as is.

Private repo absent (public clone): the hook runs the fork's own register tests, prints `kc-guard: client check SKIPPED, private repo not found at <path>` and exits 0. Never silent either way. Exit codes: 0 pass, 1 break, 2 could not run (refuses the push; `git push --no-verify` is Rob's override).

Client names stay out of public output: the guard prints site slugs only when stdout is a terminal, and "site N" otherwise, so loop logs under the tracked `.claude/work/` hold none.

## Dropped and why

- Card 03 (status token), the Actions-minutes item: no workflow posts a status.
- Old card 07 (`kc-guard` workflow, `kc-upstream-sync.yml` edit): no Actions.
- Old card 11 (`kc-clients` workflow, `open-prs.mjs`): no schedule, no server.
- Old card 13 (branch protection, throwaway PRs): it only existed to require those checks. Replaced by a live push test in new card 13.
- Wrong-item 1 and 2 (upstream PRs get no checks; `ci: required`): moot. `ci` stays `none`.

## Wrong in the existing setup

1. Web merges bypass hooks. A GitHub-side merge of an upstream-sync PR never runs `pre-push`. Card 07 adds `kc/guard/pr.ts <n>`, run before merging, which checks the PR's merge ref locally. Merge only after it passes.
2. The old claim that `extra_checks` is read by nothing was wrong: `claude-loop.cjs:540` runs it per card. It is not used here (it gates card work, not Rob's manual pushes, and its logs are tracked in a public repo).
3. Client names are already public: about 140 mentions in 34 tracked files. This plan adds none. A scrub is Rob's call.
4. Don't copy the answers file into `decisions.md` here: it holds client names.
5. The second site's clone has no `.pages.yml`; card 10 waits.
6. zod 4 rewrites about 20 upstream files, against clean upstream merges. Check upstream's zod first.

## Cards

### 00. Rob: fixtures in public, map shape, second site's repo
Role: none, waiting on Rob. Done 2026-10-27.
Risky path: no.
Files:
- `D:\Dev\htdocs\kc-cms\audits\2026-10-27-customization-guard-decisions.md`
Done-test: the file records (a) to (d). Done.

### 01. Load core config outside Next
Role: implementer. Done, merged. Loop repo: kc-cms-app.
Risky path: no.
Files:
- `kc/register/load-config.ts`
- `kc/tests/register-load.test.ts`
Done-test: `node --test kc/tests/register-load.test.ts` passes. Done.

### 02. Register of the fork's own customizations
Role: implementer. Done, merged. Loop repo: kc-cms-app.
Risky path: yes (guard).
Files:
- `kc/register/customizations.json`
- `kc/register/customizations.ts`
- `kc/tests/register-customizations.test.ts`
Done-test: `node --test kc/tests/register-customizations.test.ts` passes. Done.

### 03. Dropped (was: status token)
Nothing to do.

### 04. Rob: package.json exception for deps-majors
Role: none, waiting on Rob; the coordinator writes the line, with no loop lock live.
Risky path: no.
Files:
- `.claude/project.md`
Done-test: `node -e` asserts `project.md` has an `Exception (Rob, ...)` line naming deps-majors that allows editing `package.json` and `package-lock.json` and running `npm install` for nodemailer 10 and zod 4 only. (Unchanged.)

### 05. Client-free site check API
Role: implementer. Loop repo: kc-cms-app.
Risky path: no (invented fixture).
Files:
- `kc/register/site-check.ts`
- `kc/tests/fixtures/register/example-site/pages.yml`
- `kc/tests/register-site-check.test.ts`
Done-test: `node --test kc/tests/register-site-check.test.ts` passes. `checkSite({ pagesYml, slug, mapKeys })` returns `{ ok, failures: [{ check, detail }] }` and, through `load-config.ts`, checks that:
- the config validates with zero errors;
- every content entry resolves through `getSchemaByName` and `generateZodSchema` accepts its `initializeState` output;
- `dashboardTiles` and `quickActions` give an href for every content entry and every `kc.actions` key, and `groupNavigation` keeps every entry;
- `resolveShort("/<slug>")` round-trips;
- `sourcesFor` on a placeholder map built from `mapKeys` gives exactly those keys.
The test asserts the example passes, and that renaming a `kc.actions` key in a copy of the fixture fails with that key in `detail`.

### 06. Guard: diff to customizations, local run
Role: implementer. Loop repo: kc-cms-app.
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
- `run.ts --files <list>` prints each hit with its customization id, exits 1 when a named test fails (the fixture), 0 otherwise, and prints nothing to or from GitHub.

### 07. Pre-push hook, installer, PR check, private-absent notice
Role: implementer. Loop repo: kc-cms-app. Needs 05 and 06; tests use a stub `check.mjs` in a temp dir, so it does not wait for card 08.
Risky path: yes (guard).
Files:
- `kc/guard/pre-push.ts`
- `kc/guard/pr.ts`
- `kc/guard/install-hooks.mjs`
- `.githooks/pre-push`
- `kc/tests/guard-pre-push.test.ts`
Done-test: `node --test kc/tests/guard-pre-push.test.ts` passes, on temp git repos. It asserts:
- the hook reads git's pre-push stdin lines (ref, sha, remote ref, remote sha), diffs the pushed range, and does nothing but print `kc-guard: no core change` when `affected.ts` names no customization;
- on a core change it runs `run.ts`, then the private `clients/check.mjs --app <repo>` found through `KC_CMS_PRIVATE` or `D:\Dev\htdocs\kc-cms`; stub exit 1 makes the hook exit 1 and stub exit 0 makes it exit 0;
- with the private path missing it prints a line starting `kc-guard: client check SKIPPED`, exits 0, and the fork's own tests still ran;
- a stub that crashes exits 2, not 0;
- off a terminal, output contains no slug, only `site N`;
- `install-hooks.mjs` sets `core.hooksPath` to `.githooks` and is safe to run twice;
- `pr.ts <n>` rejects anything not matching `^[0-9]+$`, and otherwise fetches `refs/pull/<n>/merge` into a temp worktree and runs the same checks.

### 08. Private: first site's entry and the check runner (kc-cms)
Role: implementer. Loop repo: kc-cms. Needs 05 merged.
Risky path: yes (client data).
Files:
- `D:\Dev\htdocs\kc-cms\clients\<first-site>\pages.yml`
- `D:\Dev\htdocs\kc-cms\clients\<first-site>\site.json`
- `D:\Dev\htdocs\kc-cms\clients\check.mjs`
- `D:\Dev\htdocs\kc-cms\server\tests\clients-register.test.mjs`
- `D:\Dev\htdocs\kc-cms\server\tests\clients-scan.test.mjs`
Done-test: `node --test server/tests/clients-register.test.mjs server/tests/clients-scan.test.mjs` passes in kc-cms. `pages.yml` is copied from the first site's clone; `site.json` holds repo, source sha, slug, local clone path and the key names from answer (b), no values. The register test asserts that shape for every folder under `clients/`; the scan test fails on an email, `ghp_`, `github_pat_`, `-----BEGIN`, or a 32-plus character hex or base64 run. `node clients/check.mjs --app D:\Dev\htdocs\kc-cms-app` exits 0 naming the site, exits 1 on a `kc.actions` key renamed on purpose, and `--site <slug> --pages <file>` checks one client's candidate `.pages.yml` (used by card 11).

### 09. Private: add-site command (kc-cms)
Role: implementer. Loop repo: kc-cms.
Risky path: yes (client data).
Files:
- `D:\Dev\htdocs\kc-cms\clients\add-site.mjs`
- `D:\Dev\htdocs\kc-cms\server\tests\clients-add-site.test.mjs`
Done-test: `node --test server/tests/clients-add-site.test.mjs` passes. On a temp git repo, `add-site.mjs <clone> <owner/repo> --keys ga,cf` writes `pages.yml` and `site.json` (HEAD sha, clone path). It exits 1 and writes nothing on a card 08 scan hit or a clone with no `.pages.yml`.

### 10. Private: second site's entry (kc-cms)
Role: implementer. Loop repo: kc-cms. WAITS until the second site's clone (`D:\Dev\htdocs\pittstbbq`) has a `.pages.yml`.
Risky path: yes (client data).
Files:
- `D:\Dev\htdocs\kc-cms\clients\<second-site>\pages.yml`
- `D:\Dev\htdocs\kc-cms\clients\<second-site>\site.json`
Done-test: made with `add-site.mjs`, keys from Rob. The card 08 tests pass with two folders, and `node clients/check.mjs --app D:\Dev\htdocs\kc-cms-app` exits 0 naming both.

### 11. Private: client-repo pre-push hook and installer (kc-cms)
Role: implementer. Loop repo: kc-cms. Needs 08.
Risky path: yes (client data).
Files:
- `D:\Dev\htdocs\kc-cms\clients\pre-push-client.mjs`
- `D:\Dev\htdocs\kc-cms\clients\install-client-hooks.mjs`
- `D:\Dev\htdocs\kc-cms\server\tests\clients-hook.test.mjs`
Done-test: `node --test server/tests/clients-hook.test.mjs` passes, on temp git repos. It asserts:
- `install-client-hooks.mjs` writes `.git/hooks/pre-push` into each `site.json` clone path that exists, skips and says so for one that does not, and is safe to run twice without clobbering a different existing hook (it exits 1 naming the file instead);
- a push whose range does not touch `.pages.yml` exits 0 without running the check;
- a push that does reads `.pages.yml` from the pushed commit (`git show <sha>:.pages.yml`), not the working tree, and runs `check.mjs --site <slug> --pages <file>`; a renamed `kc.actions` key exits 1, naming the key;
- a clone with no register entry prints `SKIPPED, not in the register` and exits 0;
- the generated hook text contains no client name.

### 12. Coordinator: onboarding step in kc-cms
Role: none (coordinator, `D:\Dev\htdocs\kc-cms`).
Risky path: no.
Files:
- `D:\Dev\htdocs\kc-cms\docs\NEW-CLIENT.md`
Done-test: `node -e` asserts `NEW-CLIENT.md` has a step after step 10 naming `clients/add-site.mjs` and `clients/install-client-hooks.mjs`, who runs them (Claude), and a "you know it worked when" line (`check.mjs --app ...` exits 0 naming the new site).

### 13. Rob: install hooks once, live refusal test
Role: none, waiting on Rob; the coordinator runs the checks. Needs 07, 08 and 11.
Risky path: no.
Files:
- `D:\Dev\htdocs\kc-cms\audits\2026-10-27-customization-guard-decisions.md`
Done-test: Rob runs `node kc/guard/install-hooks.mjs` in kc-cms-app and `node clients/install-client-hooks.mjs` in kc-cms, once. Then `git config core.hooksPath` in kc-cms-app prints `.githooks`, and each client clone has a `.git/hooks/pre-push`. A throwaway branch renaming a `quickActions` key, pushed with `git push --dry-run`, exits non-zero with the hook's message; a throwaway `.pages.yml` edit in a client clone does the same. The answers file records the date.

### 14. deps-majors: nodemailer 10 and zod 4
Role: implementer. Loop repo: kc-cms-app. Needs card 04; runs after 13 so the hook covers it.
Risky path: yes (dependencies, schema code, mail).
Files:
- `package.json`
- `package-lock.json`
- `lib/mailer.ts`
- `lib/config-schema.ts`
- `lib/schema.ts`
- `lib/config.ts`
- `fields/registry.ts`
- `kc/client-view.ts`
Done-test: `npm audit --omit=dev --audit-level=high` exits 0, `node --test "kc/tests/**/*.test.ts"` is green, `npx tsc --noEmit` reports 0, `npm run build` compiles (stopping on `BASE_URL` after compile is fine), and `node kc/guard/pre-push.ts --dry-run` on the branch exits 0. If zod 4 needs changes past these files, the card parks with the list for Rob.

### 15. Security audit of the feature
Role: security-auditor. Loop repo: kc-cms-app (reads kc-cms).
Risky path: yes.
Files:
- `kc/register/`
- `kc/guard/`
- `.githooks/pre-push`
- `D:\Dev\htdocs\kc-cms\clients\`
- `package.json`
Done-test: `result.md` answers:
- can a client name or map key reach the public repo, its commits, `.claude/work/` or loop logs through this feature (hook output off a terminal, `site.json`, test fixtures)?
- can `pr.ts`'s argument, a branch name or a pushed ref be bent into shell or another ref?
- can the hook pass silently: private repo absent, stub crash, empty range, `--no-verify` (named as Rob's override)?
- does `add-site.mjs` or the hook installer overwrite a hook or leak a clone path?
- did the deps-majors diff change mail or validation behaviour?
- are `node .claude/bin/project-test.cjs` and kc-cms's suite both green?
