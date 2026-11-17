# 108.12. Rewrite every guide page to the new anatomy, labels from the CMS source (job: content)

## Objective
Rob: "the documentation seems lean and ambiguous." Rewrite all 10 core and 8 module help pages (`kc/guide/pages/core-*.ts`, `kc/guide/pages/module-*.ts`) using the helpers in `kc/guide/parts.ts`, so each task page has: a goal line and time (page header), numbered steps whose every button, field and menu item is named by its exact on-screen label in a chip, a "You will see" line and an "If not" fix per step, a "Check it worked" block, and a figure slot per screen with its caption (no images yet; the empty frame with caption is correct).

## Read first
- `.claude/project.md` (upstream-file rule, Never list, copy rule) and `docs/adr/` (ADR 0005 governs the guide's look)
- `.claude/work/108-help-guide-plan/plan.md` card 12 (the spec)
- `D:\Dev\hq\.claude\work\guide-redesign\research.md` section (e), the writing rules (read only)
- `kc/guide/parts.ts`, `kc/guide/pages.ts`, every `kc/guide/pages/*.ts`, `kc/tests/help-pages.test.ts`
- Labels come from the source, never guessed: `components/`, `app/`, `kc/` in this repo, and the demo config on branch `card/07-guide-demo` of the kc-test-site repo (read with `git show`, never check it out). If you cannot find kc-test-site, say so in result.md and use labels from this repo only.

## Requirements
- Keep each page's `approved = false`, its module id, and noindex/drafts behaviour as is.
- No client names (a test and a trap refuse them), no KC staff-only screens.
- Copy: draft with the `prose` skill, then `avoid-ai-writing` and `humanizer`, via the Skill tool. If one is refused, say so in result.md and carry on with the rules in research.md (e).
- List in result.md every label you could not find in source, with the page it is on.
- Extend `kc/tests/help-pages.test.ts`: every task page has a goal, a time, at least one step with "You will see" and "If not", a "Check it worked" block and a figure slot; no banned word; no client name.

## Files you may touch
- `kc/guide/pages/core-add-remove-entry.ts`, `kc/guide/pages/core-change-page-text.ts`, `kc/guide/pages/core-find-your-way.ts`, `kc/guide/pages/core-format-text.ts`, `kc/guide/pages/core-getting-help.ts`, `kc/guide/pages/core-photos-and-files.ts`, `kc/guide/pages/core-save-and-live-site.ts`, `kc/guide/pages/core-see-who-visits.ts`, `kc/guide/pages/core-sign-in.ts`, `kc/guide/pages/core-undo.ts`, `kc/guide/pages/module-bilingual.ts`, `kc/guide/pages/module-business-details.ts`, `kc/guide/pages/module-events.ts`, `kc/guide/pages/module-galleries.ts`, `kc/guide/pages/module-hours.ts`, `kc/guide/pages/module-menu.ts`, `kc/guide/pages/module-publications.ts`, `kc/guide/pages/module-reviews.ts`
- `kc/tests/help-pages.test.ts`
- `.claude/work/108-12-guide-rewrite/` (result.md, progress.md)

## Done-test
`node --test kc/tests/help-pages.test.ts` passes, run once through `node C:\Users\roban\.claude\bin\project-test.cjs`. No mutation check, no screenshots.

## Rules
Keep `progress.md` beside this brief, updated after every step. No commit. `result.md`: pages rewritten, test assertions added, labels not found in source, anything not verified.

Secrets: never run a command or read a file that prints a secret value; values move file-to-file or pipe-to-pipe only (secret-put.cjs, secret-to-file.cjs).
