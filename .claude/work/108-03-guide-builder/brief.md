# 108.03. Guide site builder and page shell (job: code)

## Objective
`node kc/guide/build.ts [outDir]` turns the pages in `kc/guide/pages/` into plain static HTML (default `kc/guide/out/`): index plus one file per page, images copied from `kc/guide/img/` when that folder exists. Ready to upload as-is to https://guide.kingsburycreative.com. Not indexed.

## Read first
- `.claude/project.md` (upstream-file rule, Never list, copy rule)
- `docs/adr/0004-*.md` (the guide is a static site, not indexed; supersedes 0001)
- `.claude/work/108-help-guide-plan/plan.md` card 03, and its header note
- `public/guides/besciworks/index.html` (the existing guide, for tone and section shape only)

## Requirements
- Mobile first, progressive enhancement: base styles work at 375px; wider layout only behind `min-width` queries. No framework, no JS needed to read a page.
- Shell: header, list of pages (core first, then modules grouped by client), content area. A page module exports title, group (`core` or a client name), slug, checked date (one constant per page) and body HTML.
- Every page carries "Checked on KC CMS {version}, {date}", version read from package.json at build time.
- Every page has `<meta name="robots" content="noindex, nofollow">`. The build writes `robots.txt` with `User-agent: *` / `Disallow: /` and an `.htaccess` with `Header set X-Robots-Tag "noindex, nofollow"`.
- The build empties the out folder first. Out folder is not committed; say in result.md whether ignore rules cover `kc/guide/out/`. Do not edit `.gitignore`.
- One placeholder page only. Run `avoid-ai-design` (Skill tool) on the shell; any visible copy goes through `prose`, then `avoid-ai-writing` and `humanizer`. If the Skill tool refuses, say so in result.md and stop.
- Relative imports with `.ts` extensions, never `@/`.

## Files you may touch
- `kc/guide/build.ts`, `kc/guide/shell.ts`, `kc/guide/pages.ts`, `kc/guide/version.ts`, `kc/guide/style.css`, `kc/guide/pages/placeholder.ts` (new)
- `kc/tests/guide-build.test.ts` (new)
- `.claude/work/108-03-guide-builder/result.md`, `.claude/work/108-03-guide-builder/progress.md`

## Done-test
`node --test kc/tests/guide-build.test.ts` passes: building into a temp folder gives index.html and the placeholder page, each with the package.json version in its stamp and the noindex meta tag, plus robots.txt disallowing all and the .htaccess header line. Run through `node C:\Users\roban\.claude\bin\project-test.cjs` as the runner allows. Mutation check through the runner: drop the noindex tag from the shell; name the failing tests; restore it.

## Rules
Keep `progress.md` beside this brief, updated after every step. No commit. No network in tests. No npm install. Write `result.md`: what changed, copy written, the mutation result, anything not verified.

Secrets: never run a command or read a file that prints a secret value; values move file-to-file or pipe-to-pipe only (secret-put.cjs, secret-to-file.cjs).
