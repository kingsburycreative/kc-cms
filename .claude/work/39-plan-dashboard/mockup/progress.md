# Mockup rework progress (2026-10-26)

- Checked out feat/33-dashboard-mockup (clean). Read old mockup, plan.md, project.md, kc/tests/dashboard-mockup.test.ts, app tokens (primary #A84F23).
- Rewrote index.html (generated from a scratch script so chart paths match the sample series) and mockup.css: quick actions, 30-day area chart with 7/30/90 toggle, three KPI tiles with change and sparkline, search health ring, recent changes feed, top pages and towns bar lists, one staff strip, compact other-states row.
- prose pass on labels; avoid-ai-design detect pass: no P0; fixed tabular numerals, chart fill, hover on links. App font Inter is a system-level tell, left (upstream).
- Responsive sweep 280-2560: 0 failures, 3 warnings (lone kpi note, one long advice line at 680-850, 7 days wrap at 280 cleared).
- Screenshots re-taken headless with windowsHide. dashboard-mockup.test.ts 9/9 pass, unchanged.
- Next: commit and push. Done after that.

## Round 2 (Rob's review, 2026-10-26)
- Pushed round 1 as 8b26376.
- Read the app sidebar (components/repo/repo-sidebar.tsx: shadcn Sidebar 16rem, header mark #C2602E + "<client> Dashboard", groups Content / Media / Site(Insights), user footer; phone: h-14 top bar with trigger, sidebar off-canvas).
- Next: rebuild gen.cjs (scratchpad) with app shell, quieter actions, health list, live-site link, publish status and states, motion in mockup.js.
- plan.md updated: layout, flags 8-9, cards 33/35/38/39/40/41/42, new card 43 publish status, later cards 44-46.
- Round 2 built: app shell (sidebar 768+, phone menu), quiet tinted actions, See live site, publish status and two publish states, larger ring with fix list and collapsed passing pages, container queries so chart and tiles stack under 900px of panel, mockup.js motion (all skipped under reduced motion).
- Sweep: 0 failures, 2 warnings. Test extended (motion block, live link, 1024 shot): 11/11, mutation check fails the motion test. eslint and tsc clean.
- Next: commit and push. Then done.
