# 108.05b. Preview build that includes unapproved pages (job: code)

Plan: `.claude/work/108-help-guide-plan/plan.md` card 05b. Rob, 2026-11-17: "Go" on a preview of unapproved pages so he can read them on his phone.

## Objective
`node kc/guide/build.ts <outDir> --drafts` builds every page, approved or not, lists them all in the nav, and puts the plain line "Draft, not yet approved" at the top of each unapproved page's content. Without the flag the build is exactly as now (unapproved pages left out). Drafts output is noindex like the rest (same meta tag, robots.txt, .htaccess). Expose it as an option on `build()` (e.g. `build(outDir, pages, { drafts: true })`) so tests call it directly. The flag may come before or after outDir; outDir stays optional.

## Files you may touch
- `kc/guide/build.ts`
- `kc/guide/shell.ts`
- `kc/tests/guide-build.test.ts` (extend)
- `.claude/work/108-05b-guide-drafts/result.md`, `.claude/work/108-05b-guide-drafts/progress.md`

## Done-test
`node --test kc/tests/guide-build.test.ts kc/tests/help-pages.test.ts` passes, with new tests: with drafts on, an unapproved page is built, appears in the index nav, carries the draft line and the noindex tag; an approved page has no draft line; with drafts off the unapproved page file is absent. Mutation check through the shared runner (`node C:\Users\roban\.claude\bin\project-test.cjs`): make build ignore the drafts option, show the new tests fail, restore.

## Rules
Read `.claude/project.md`. Relative imports with `.ts`, no `@/`. No package.json edits, no npm install, no network. Keep `progress.md` updated after each step. Do not commit. Write `result.md`: what changed, tests run, mutation result.

Secrets: never run a command or read a file that prints a secret value; values move file-to-file or pipe-to-pipe only (secret-put.cjs, secret-to-file.cjs).
