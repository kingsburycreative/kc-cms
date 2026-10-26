# 40. Dashboard design mockup at 375 and 1280 (Normal)

## Objective
Board card 33 (`.claude/work/39-plan-dashboard/plan.md` card 33). A static HTML mockup of the new site dashboard, for Rob to approve (card 34) before any dashboard code is built. It shows BeSciWorks-like data and every state the real page will have, mobile first, with phone and desktop screenshots.

## Read first
- `D:\Dev\htdocs\kc-cms-app\.claude\project.md` (the Copy rule, the Never list)
- Card 33 and the cards after it in `D:\Dev\htdocs\kc-cms-app\.claude\work\39-plan-dashboard\plan.md` (what the dashboard will hold)
- `D:\Dev\htdocs\kc-cms-app\kc\dashboard.tsx` (today's dashboard: tiles and recent edits)
- `c:\personas\cas\memory\design-slop.md` (never ship any of these)

## Start here
- Data: 3 collections, 14 pages, 412 visits, 2 pages to fix, 8 recent edits. Show, for visits, search health and version, three states each: loaded, skeleton, and empty or failed. Show the client view and the staff (KC) view.
- Mobile-first CSS in `mockup.css`: base styles for a phone, desktop layered on with `min-width` queries only. Skeletons shimmer or pulse, and stop under `prefers-reduced-motion`. Every link and button `min-height: 44px`. No gradients, no beige, no eyebrow labels, no commas in headings, no filled-plus-outline button pair.
- Screenshots with headless Chrome (spawn with `windowsHide: true`) at 375 and 1280 wide, full page.
- Run the design through the `avoid-ai-design` skill; write all copy with the `prose` skill, then `avoid-ai-writing` and `humanizer`, each with the Skill tool. If the Skill tool refuses one, stop and say so in result.md.

## Files you may touch
- `D:\Dev\htdocs\kc-cms-app\.claude\work\39-plan-dashboard\mockup\index.html` (new)
- `D:\Dev\htdocs\kc-cms-app\.claude\work\39-plan-dashboard\mockup\mockup.css` (new)
- `D:\Dev\htdocs\kc-cms-app\.claude\work\39-plan-dashboard\mockup\phone-375.png` (new)
- `D:\Dev\htdocs\kc-cms-app\.claude\work\39-plan-dashboard\mockup\desktop-1280.png` (new)
- `D:\Dev\htdocs\kc-cms-app\kc\tests\dashboard-mockup.test.ts` (new)
- `D:\Dev\htdocs\kc-cms-app\.claude\work\40-dashboard-mockup\result.md` and `progress.md` (new)

## Done-test
`node C:\Users\roban\.claude\bin\project-test.cjs kc/tests/dashboard-mockup.test.ts` passes. The test reads the mockup and asserts: only `min-width` media queries, no `max-width`; no `letter-spacing` above 0.05em and no `text-transform: uppercase`; no `gradient`; no hex in the f3efe7 beige family; no `<h1>` to `<h3>` text containing a comma; every skeleton block carries an `animation` and a `prefers-reduced-motion` rule sets it to `none`; every link and button has `min-height: 44px`; no `<button>` pair with filled and outline classes in one parent; both PNGs exist and their PNG headers say 375 and 1280 wide. `npx tsc --noEmit && npx eslint kc` exit 0.

Mutation check, through the runner on that one test file: add `text-transform: uppercase` to a heading, run, name the failing tests; then a `max-width` query, run, name them; restore and run green. Never the full suite.

## Boundaries
No commit, no push, no install, nothing outward. No edits outside the list above. No network in tests. Never read a secret or `.env`.

## Progress
Keep `progress.md` beside this brief: after each step that changes a file, one short line (done, files touched, next step).

## Report
`result.md` beside this file, under 200 words: files made, tests added, the mutation result naming the failing tests, each piece of copy written, what was not done.
