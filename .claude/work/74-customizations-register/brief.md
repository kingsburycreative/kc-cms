# 74. Register of the fork's own customizations (Risky)

## Objective
Build `kc/register/customizations.json` listing every KC customization of the Pages CMS fork, a small typed reader `kc/register/customizations.ts`, and a test that fails when an upstream file the fork changed is not claimed by any entry. It is plan card 02 of `.claude/work/66-plan-customization-guard/plan.md`; later cards (the PR guard) read this register to name what a diff touches.

## Read first
- D:/Dev/htdocs/kc-cms-app/.claude/project.md (upstream rule, Never list)
- .claude/work/66-plan-customization-guard/plan.md, card 02
- kc/BOARD.md Done section, and `git log --oneline` / `git diff --stat` against upstream for what the fork changed
- kc/register/load-config.ts and kc/tests/register-load.test.ts for house style

## Files you may touch
- `kc/register/customizations.json`
- `kc/register/customizations.ts`
- `kc/tests/register-customizations.test.ts`

## What to build
- `upstreamBase`: the upstream commit the fork last merged, recorded in the JSON as a full sha. Find it with `git merge-base HEAD upstream/main` (the `upstream` remote ref is already fetched locally; do not fetch). If no upstream ref exists locally, stop and say so in result.md.
- Entries cover at least: branding, client-view, branch lock, settings gate, insights, auth hardening (otp-limit, auth-ip, disabled paths, verified email, sign-in methods), media types, content ops, redact, avatar, commit identity, invite and email, history, seo panel, dashboard, short URLs and proxy (id `short-url`, claims `proxy.ts`), sidebar groups, page header, action-run claim, update banner and upstream watch, uptime, add-editor script, release version. Each entry: `id`, `title`, `files` (repo paths it lives in), `watch` (globs), `tests` (kc/tests files that prove it).
- `customizations.ts` loads and types the JSON and exposes helpers the test and later the guard use (e.g. list entries, find claimed files). Relative imports with `.ts` extensions, no `@/`.

## Done-test
`node --test kc/tests/register-customizations.test.ts` passes, run through `node C:\Users\roban\.claude\bin\project-test.cjs` (look at other briefs' result.md in .claude/work for how the runner takes a file). The test asserts:
- every listed file and test exists;
- every file outside `kc/` and `.github/workflows/kc-*` that differs between `upstreamBase` and HEAD (git diff --name-only, via child_process, local git only) is claimed by some entry's `files` or `watch`, and a failure message names each unclaimed file;
- every upstream file (outside `kc/`) importing `@/kc/` or `../kc/` is claimed.
Leave `package.json`/`package-lock.json` claimed by an entry (e.g. deps) rather than excluded. Existing tests still pass.

Mutation check through the runner: delete the `short-url` entry, run, confirm the failure names `proxy.ts`, restore, run green.

## Boundaries
No commit, no push, no install, no network (no git fetch), no edits outside the three files. No user-facing copy.

## Progress
Keep `progress.md` beside this file from your first step, one line per step that changes a file or finishes a unit of work: done, files, next, anything half-written. Already there? You are resuming: read it and check the disk against it first.

## Report
Write `result.md` beside this file, under 200 words: files changed, the upstreamBase sha and how found, entry count, the mutation result naming the failing test, and what was not done.
