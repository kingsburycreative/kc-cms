# 54. Link coverage guard (Normal)

## Objective
Board card 51 (`.claude/work/40-plan-short-urls/plan.md` card 51). One source-scan test that fails on any in-app page link not wrapped in `shortHref(...)`, so a later edit or upstream merge cannot drop the short address silently.

## Read first
- `D:\Dev\htdocs\kc-cms-app\.claude\project.md` (tests, relative `.ts` imports)
- Design, Flags and card 51 in `.claude/work/40-plan-short-urls/plan.md` (the spec; follow it exactly)
- `kc/short-url.ts`, and the existing source tests `kc/tests/short-href-editor.test.ts` and the card 49 tests, for how wrapped links look

## Start here
Write the scanner over `components/`, `fields/`, `kc/` (not `kc/tests/`) and `app/(main)/`: every template literal starting `` `/${...owner...}/${...repo...} `` must have `shortHref(` on the same statement, unless the line matches a named allowlist entry with a reason (`/api/`, `github.com`, `raw.githubusercontent.com`, `lib/actions/collaborator.ts`, plus any genuine non-page case you find, each with a one-line reason). Also assert every allowlist entry still matches at least one line. If the scan finds a real unwrapped page link in the tree, do not fix it: list it in result.md and allowlist nothing for it; the test then fails and that is the report.

## Files you may touch
- one new `kc/tests/short-url-links.test.ts`
- `.claude/work/54-link-guard/result.md` and `progress.md` (new)

## Done-test
`node C:\Users\roban\.claude\bin\project-test.cjs kc/tests/short-url-links.test.ts` passes, then `npx tsc --noEmit && npx eslint kc` exit 0.

Mutation check, through the runner: unwrap one link in `components/entry/entry.tsx` and one in `components/repo/repo-sidebar.tsx`, and add a stale allowlist entry; name the failing tests, restore every file exactly, run green.

## Boundaries
No commit, no push, no install, no network. No file outside the list. Never read or print a secret or `.env`. Keep `progress.md` beside this brief, updated after each step that changes a file: done so far, files touched, next step, anything half-written.

## Report
`result.md` beside this file, under 200 words: the test added, the allowlist with reasons, the mutation result naming the failing tests, anything left undone.
