# 53. Link helper in the editor pages (Normal)

## Objective
Board card 50 (`.claude/work/40-plan-short-urls/plan.md` card 50). Wrap every in-app page link in the editor pages listed below in `shortHref(...)` from `kc/short-url.ts`, so they use the short address like card 49 did for `kc/` and the repo chrome.

## Read first
- `D:\Dev\htdocs\kc-cms-app\.claude\project.md` (upstream files, relative `.ts` imports, tests)
- Design, Flags and cards 49 and 50 in `.claude/work/40-plan-short-urls/plan.md` (the spec; follow it exactly)
- `kc/short-url.ts` (`shortHref`), and how card 49 wrapped links in `components/repo/repo-sidebar.tsx`

## Start here
- Before editing, count the `/api/` string literals across the files below and write the number in `progress.md`. Then go file by file wrapping page hrefs only (links, `router.push`, `redirect` targets that are app pages). `/api/`, `github.com` and `raw.githubusercontent.com` strings stay as they are. Each upstream file gets only the link lines plus one import line. Upstream files import `shortHref` with the `@/kc/short-url` alias, as card 49's repo files do.

## Files you may touch
- `components/entry/entry.tsx`, `components/entry/entry-history.tsx`, `components/collection/collection.tsx`, `components/media/media-view.tsx`, `components/empty-create.tsx` (upstream, smallest change)
- `fields/core/file/edit-component.tsx` (near line 320), `fields/core/image/edit-component.tsx` (near line 268) (upstream)
- `app/(main)/[owner]/[repo]/[branch]/settings/page.tsx` (near line 9), `app/(main)/[owner]/[repo]/[branch]/layout.tsx` (near line 74 only; the access code above it is not touched), `app/(main)/[owner]/[repo]/page.tsx` (near line 13) (upstream)
- one new `kc/tests/short-href-editor.test.ts`
- `.claude/work/53-editor-links/result.md` and `progress.md` (new)

## Done-test
`node C:\Users\roban\.claude\bin\project-test.cjs kc/tests/short-href-editor.test.ts kc/tests/short-url.test.ts` passes, then `npx tsc --noEmit && npx eslint kc` exit 0. The new test is a source test over the files above: for each, every template literal starting `` `/${...owner...}/${...repo...} `` that builds a page link sits inside a `shortHref(` call on the same statement, and the `/api/` literal count across the files equals the number recorded before editing. Write it first and see it fail on the untouched files.

Mutation check, through the runner: unwrap one link in `entry.tsx` and one in `collection.tsx`; name the failing tests, restore, run green.

## Boundaries
No commit, no push, no install, no network. No file outside the list, no `package.json`, lock file or `db/migrations/`. Never read or print a secret or `.env`. No client-facing copy changes. Keep `progress.md` beside this brief, updated after each step that changes a file: done so far, files touched, next step, anything half-written.

## Report
`result.md` beside this file, under 200 words: files changed, tests added, the mutation result naming the failing tests, anything left undone.
