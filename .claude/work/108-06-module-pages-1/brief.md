# 108.06. Module pages part 1: bilingual, galleries, reviews, business details (job: content)

## Objective
Write four help guide pages, one per CMS module, as page modules under `kc/guide/pages/`, words only: Bilingual pages and posts (English and French pairs, linked by file name), Photo galleries (photo categories), Reviews and rating (typed figures), Business details. Modules are product features of KC CMS, named for what they do. No page, header, file name, picture marker or example names a client.

## Read first
- `.claude/project.md` (copy rule, Never list)
- `docs/adr/` (all), `docs/PRD-help-guide.md`
- `.claude/work/108-help-guide-plan/plan.md` card 06 and its PM note (authoritative)
- `.claude/work/108-05-core-guide-pages/brief.md` and `result.md` (same rules; follow the shape of `kc/guide/pages/core-*.ts`)
- `kc/guide/pages.ts`, `kc/guide/shell.ts`, `kc/tests/help-pages.test.ts`
- The demo config: read-only, `git -C D:\Dev\htdocs\kc-test-site show card/07-guide-demo:.pages.yml` (group "Bilingual posts, galleries and reviews"). Never check out or edit that repo.
- The kc-cms-app source, to check every step against the current CMS

## Requirements
- Same rules as 05: client view only; banned words repo, commit, collection, field, markdown; `[picture: ...]` markers, no images; `approved: false`; title, checked date, version stamp.
- Each page header carries its module id: `module: bilingual`, `module: galleries`, `module: reviews`, `module: business-details` (add an optional `module` to the page shape in pages.ts if missing, smallest change).
- Examples use the demo's made-up businesses only. No page in `kc/guide/` may contain henike, besciworks, cupboard, kirk, nikki or chris adams, any case. If an existing file under kc/guide/ outside your list contains one, report it in result.md; do not edit it.
- Copy through the `prose` skill, then `avoid-ai-writing` and `humanizer`, each with the Skill tool. If one is refused, say so in result.md and stop.
- Relative imports with `.ts` extensions.

## Files you may touch
- New: `kc/guide/pages/module-bilingual.ts`, `kc/guide/pages/module-galleries.ts`, `kc/guide/pages/module-reviews.ts`, `kc/guide/pages/module-business-details.ts`
- `kc/guide/pages.ts`
- `kc/tests/help-pages.test.ts` (extend)
- `.claude/work/108-06-module-pages-1/result.md`, `.claude/work/108-06-module-pages-1/progress.md`

## Done-test
`node --test kc/tests/help-pages.test.ts` passes: every module page has a title, stamp, date, `approved` and a module id; no banned word; no file under kc/guide/ contains a deny-listed client name (case-insensitive). Keep `kc/tests/guide-build.test.ts` green. Run through `node C:\Users\roban\.claude\bin\project-test.cjs` as the runner allows.

## Rules
Keep `progress.md` beside this brief, updated after every step. No commit. No network. No npm install. `result.md`: pages written, every piece of copy, every picture marker, anything not verified.

Secrets: never run a command or read a file that prints a secret value; values move file-to-file or pipe-to-pipe only (secret-put.cjs, secret-to-file.cjs).
