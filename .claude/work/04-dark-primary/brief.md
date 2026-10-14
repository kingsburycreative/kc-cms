# 04. Dark-mode primary passes contrast

## Objective
In dark mode the primary colour meets WCAG 4.5:1 both as link text on the dark
background and as the background for button text. Light mode is unchanged. A
test reads the real colours from `globals.css` and enforces 4.5:1 in `:root`
and `.dark`.

## Read first
- D:/Dev/htdocs/kc-cms-app/.claude/project.md (Never list, test rules)
- D:/Dev/htdocs/kc-cms-app/kc/BOARD.md, the dark-primary card
- D:/Dev/htdocs/kc-cms-app/app/globals.css (`:root` and `.dark` blocks)
- D:/Dev/htdocs/kc-cms-app/kc/brand.ts
- D:/Dev/htdocs/kc-cms-app/kc/tests/brand.test.ts

## Context
`app/globals.css` is an upstream file; this card names it, and the change is
limited to three values inside `.dark`. `--background` there is oklch, so the
test must convert oklch to sRGB itself (no new dependency) before computing
relative luminance.

## Files you may touch
- `D:/Dev/htdocs/kc-cms-app/app/globals.css`
- `D:/Dev/htdocs/kc-cms-app/kc/brand.ts`
- `D:/Dev/htdocs/kc-cms-app/kc/tests/brand.test.ts`

## Done-test
From the board: in `.dark` only, in `app/globals.css`: `--primary: #D4713F`,
`--primary-foreground: #1A1714`, `--ring: #D4713F`. Add both values to
`kc/brand.ts` as `BRAND_PRIMARY_DARK` and `BRAND_PRIMARY_FOREGROUND_DARK`.
Extend `kc/tests/brand.test.ts`: read `.dark`'s `--background` from
`globals.css`, convert the oklch to sRGB in the test, and require 4.5:1 for
primary on background and foreground on primary, in both `:root` and `.dark`.
`node --test kc/tests/brand.test.ts` passes.

Then the full suite passes through the runner
(`node C:\Users\roban\.claude\bin\project-test.cjs`), and the mutation check,
through the runner so it is on record: set `.dark --primary` back to `#A84F23`,
run, name the tests that failed, restore, run again green.

## Boundaries
No commit, no push, no install, nothing outward. Light-mode values stay as
they are. No edits to any file outside the list. project.md's Never list applies.

## Report
Write `result.md` beside this file, under 200 words: files changed, tests
added, the mutation result naming the tests that failed, the measured ratios,
and any call made and why. Say what was not done.
