# 108.05. Core guide pages, words first (job: content)

## Objective
Write the core pages of the client help guide as page modules under `kc/guide/pages/`, words only, so `node kc/guide/build.ts` builds them. Pages: sign in; find your way around; change the text on a page; add and remove an entry in a list; photos and files; format text; save, and what Save does to the live site; undo and get an old version back; see who visits; getting help. Weekly, Papers and search health are not core.

## Read first
- `.claude/project.md` (copy rule, Never list)
- `docs/adr/0004-*.md`, `docs/adr/0002-*.md`, `docs/adr/0003-*.md`
- `.claude/work/108-help-guide-plan/plan.md` card 05 and its PM note (authoritative for this card)
- `kc/guide/pages/placeholder.ts`, `kc/guide/pages.ts`, `kc/guide/shell.ts` (the page module shape)
- `public/guides/besciworks/index.html` (existing guide: the sections to split, tone)
- `.claude/work/108-01-restore-check/finding.md` and `.claude/work/108-02-restore-keeps-fields/` result (for the undo page)
- The kc-cms-app source (components/, kc/) to check every step against the current CMS

## Requirements
- Client view only: no Staff only panel, no analytics IDs, nothing only KC sees.
- No pictures in this card. Where a picture belongs, put a visible `[picture: <what it shows>]` marker in the body and list every marker in result.md.
- Undo page: restoring brings back what the site's setup lists; a section the setup does not list is not kept on save, so tell clients to ask KC before restoring an old version if a section seems missing.
- Banned words in page text: repo, commit, collection, field, markdown (any case). Use the reader's words.
- Each page module carries `approved: false` in its header and stays out of the nav until Rob approves it; add that flag to the page shape if missing (smallest change in pages.ts, shell.ts or build.ts), and the build/nav must skip unapproved pages. Keep the placeholder working.
- Each page has a title, a checked date constant, and the version stamp from the shell.
- Copy goes through the `prose` skill, then `avoid-ai-writing` and `humanizer`, each invoked with the Skill tool. If the Skill tool refuses one, say so in result.md and stop.
- Then follow each task from the page once as a reader who has never seen the CMS (reading the source as the CMS), and rewrite where it stalls.
- Relative imports with `.ts` extensions, never `@/`.

## Files you may touch
- New, one per page: `kc/guide/pages/core-add-remove-entry.ts`, `kc/guide/pages/core-change-page-text.ts`, `kc/guide/pages/core-find-your-way.ts`, `kc/guide/pages/core-format-text.ts`, `kc/guide/pages/core-getting-help.ts`, `kc/guide/pages/core-photos-and-files.ts`, `kc/guide/pages/core-save-and-live-site.ts`, `kc/guide/pages/core-see-who-visits.ts`, `kc/guide/pages/core-sign-in.ts`, `kc/guide/pages/core-undo.ts`
- `kc/guide/pages.ts`, `kc/guide/shell.ts`, `kc/guide/build.ts` (only for the approved flag and skipping unapproved pages)
- `kc/tests/help-pages.test.ts` (new)
- `.claude/work/108-05-core-guide-pages/result.md`, `.claude/work/108-05-core-guide-pages/progress.md`

## Done-test
`node --test kc/tests/help-pages.test.ts` passes: every core page has a title, a version stamp, a date, `approved` set, alt text on every image, and no banned word in its text; unapproved pages are left out of the built nav. Run it through `node C:\Users\roban\.claude\bin\project-test.cjs` as the runner allows. Also keep `kc/tests/guide-build.test.ts` green.

## Rules
Keep `progress.md` beside this brief, updated after every step. No commit. No network in tests. No npm install. Write `result.md`: pages written, every piece of copy, every picture marker, anything not verified.

Secrets: never run a command or read a file that prints a secret value; values move file-to-file or pipe-to-pipe only (secret-put.cjs, secret-to-file.cjs).
