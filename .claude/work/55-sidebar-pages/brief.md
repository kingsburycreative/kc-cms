# 55. Sidebar: fold single pages under one Pages entry, 44px items (Normal)

## Objective
Board card 59 (`.claude/work/40-plan-short-urls/plan.md` card 59). In the site sidebar, every `.pages.yml` content entry of `type: file` folds under one collapsible "Pages" entry; sidebar items are at least 44px tall at every width. Rob approved this in `.claude/work/39-plan-dashboard/mockup/index.html`.

## Read first
- `D:\Dev\htdocs\kc-cms-app\.claude\project.md` (upstream rules, tests, relative `.ts` imports, the Copy rule)
- Card 59 in `.claude/work/40-plan-short-urls/plan.md` (the spec; follow it exactly)
- `components/repo/repo-sidebar.tsx`, `components/repo/repo-nav.tsx`, `components/ui/sidebar.tsx`, and the mockup's sidebar
- `kc/tests/short-url-links.test.ts`: any new in-app link must go through `shortHref(...)` or that guard fails

## Start here
Write a pure helper `kc/sidebar-groups.ts` that takes the content entries and the current path and returns collections first, then one Pages group holding every file entry, with `open` true only when the current path is one of those files. Wire it into the repo nav with the smallest hook into the upstream files: a real `<button aria-expanded>` disclosure, keyboard operable, open state derived from the path (no storage). The phone menu uses the same navigation, so check it gets the grouping. Media and the Site group stay as they are. For 44px: smallest edit to `components/ui/sidebar.tsx` (or a kc override); say which in result.md. Mobile first, no JS needed to read the links where the upstream allows. The only new copy is the label "Pages"; run it through the `prose`, `avoid-ai-writing` and `humanizer` skills with the Skill tool and the UI through `avoid-ai-design`; if the Skill tool refuses one, stop and say so in result.md.

## Files you may touch
- new `kc/sidebar-groups.ts`, new `kc/tests/sidebar-groups.test.ts`
- `components/repo/repo-nav.tsx`, `components/repo/repo-sidebar.tsx`, `components/ui/sidebar.tsx` (upstream: smallest edit)
- `.claude/work/55-sidebar-pages/result.md` and `progress.md` (new)

## Done-test
`node C:\Users\roban\.claude\bin\project-test.cjs kc/tests/sidebar-groups.test.ts` passes: grouping from a fixture `.pages.yml` (files under Pages, collections first, Media and Site untouched), Pages open when the path is a file entry and closed otherwise, and a source test that the sidebar item height class is 44px or more (`h-11` or larger) and the disclosure carries `aria-expanded`. `node C:\Users\roban\.claude\bin\project-test.cjs kc/tests/short-url-links.test.ts` still passes. Then `npx tsc --noEmit && npx eslint kc` exit 0.

Mutation check, through the runner: put a file entry back at the top level, then set the item height to `h-8`; name the failing tests, restore exactly, run green.

## Boundaries
No commit, no push, no install, no network. No file outside the list; never `package.json` or `db/migrations/`. Never read or print a secret or `.env`. Keep `progress.md` beside this brief, updated after each step that changes a file: done so far, files touched, next step, anything half-written.

## Report
`result.md` beside this file, under 200 words: files changed, the 44px choice, copy written and the skills run, the mutation result naming the failing tests, anything left undone.
