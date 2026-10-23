# 26. Site dashboard as the landing page

## Objective
The branch home page `app/(main)/[owner]/[repo]/[branch]/page.tsx` stops redirecting to the first content item and shows a dashboard instead (plan card 16): a grid of tiles for the site's content (groups, files, collections), Media, a History tile, and Insights only when the user has Insights access; under it a short list of recent edits from card 15's site history feed (`GET /api/[owner]/[repo]/[branch]/history`), each showing title, date, author name and path only. Mobile first: one column at 375 wide, more columns from `min-width` breakpoints. Keep the existing "not configured" empty states for a site with no content and no media.

## Read first
- `D:\Dev\htdocs\kc-cms-app\.claude\project.md` (upstream-merge rules, Never list, Copy rule, `kc/` imports use relative `.ts` paths)
- `D:\Dev\htdocs\kc-cms-app\.claude\work\15-plan-client-experience\plan.md`, card 16 (and 15, 17, 19 for context)
- `D:\Dev\htdocs\kc-cms-app\app\(main)\[owner]\[repo]\[branch]\page.tsx` (the redirect to remove)
- `D:\Dev\htdocs\kc-cms-app\app\(main)\[owner]\[repo]\[branch]\layout.tsx:100` (how `hasInsights` is computed server side) and `components\repo\repo-sidebar.tsx` (how content, media and Insights links are built: reuse the same hrefs)
- `D:\Dev\htdocs\kc-cms-app\app\api\[owner]\[repo]\[branch]\history\route.ts` and `kc\history\site.ts` (the feed's item shape)
- `D:\Dev\htdocs\kc-cms-app\kc\client-view.ts` and an existing source test, e.g. `kc\tests\client-view.test.ts`
- `C:\personas\cas\memory\design-slop.md` (never ship these)

## Start here
- `kc/dashboard.ts`: pure, no React, no network. `dashboardTiles(configObject, { owner, repo, branch, hasInsights })` returns tiles `{ key, label, href, kind }` in config order: one per content entry (groups expanded the way the sidebar does), one Media tile when media is configured, a History tile (href `/<owner>/<repo>/<branch>/history`, the page card 17 builds), and an Insights tile only when `hasInsights`. `recentEdits(items, limit)` maps feed items to `{ title, date, authorName, path }` and nothing else (no email, no avatar, no sha links).
- `kc/dashboard.tsx`: the client component; reads config from `useConfig`, fetches the history feed, renders tiles and recent edits with the existing `components/ui` pieces. A failed feed fetch shows a short line, not an error page.
- `page.tsx`: smallest change. If it needs `hasInsights`, make it a server component that computes it like `layout.tsx:100` and renders the `kc/dashboard.tsx` component, which keeps the empty states. Name in result.md how you did it.
- Done-test command: `node C:\Users\roban\.claude\bin\project-test.cjs kc/tests/dashboard.test.ts`

## Files you may touch
- `D:\Dev\htdocs\kc-cms-app\kc\dashboard.ts` (new)
- `D:\Dev\htdocs\kc-cms-app\kc\dashboard.tsx` (new)
- `D:\Dev\htdocs\kc-cms-app\kc\tests\dashboard.test.ts` (new)
- `D:\Dev\htdocs\kc-cms-app\kc\tests\fixtures\dashboard\` (new files)
- `D:\Dev\htdocs\kc-cms-app\app\(main)\[owner]\[repo]\[branch]\page.tsx` (upstream file, named by the card)
- `D:\Dev\htdocs\kc-cms-app\.claude\work\26-site-dashboard\result.md` (new)

## Done-test
`node --test kc/tests/dashboard.test.ts` passes. From fixture configs it asserts tiles are a pure function of the config (groups, files, collections, Media, History, Insights only with `hasInsights: true`); `recentEdits` keeps title, date, author name and path only and caps at the limit; a source test shows `page.tsx` no longer calls `router.replace` to the first content item. Also `npx tsc --noEmit && npx eslint kc` exit 0.

Mutation check, through the runner so it is on record: make `dashboardTiles` add the Insights tile regardless of `hasInsights`, run the done-test, name the tests that failed, restore, run again green.

## Copy and design
Every label, heading and empty line a client reads goes through the `prose` skill, then `avoid-ai-writing` and `humanizer` (Skill tool). Run `avoid-ai-design` on the layout. Check it against `design-slop.md`: no eyebrow labels, no filled-plus-outlined button pair, no beige, no comma in a heading. If the Skill tool refuses one, stop and say so in result.md. A browser check at 375 and 1280 is not possible headless: say so in result.md rather than claim it.

## Boundaries
No commit, no push, no install, nothing outward. Never edit `package.json`, `package-lock.json` or `db/migrations/`. Do not touch `app/api/` or any risky path. No real network calls in tests. Never read or print a key, `.env` or secrets file. Do not run the full suite.

## Report
Write `result.md` beside this file, under 200 words: files changed, tests added, the mutation result naming the tests that failed, each piece of copy written, any call made and why, and what was not done.
