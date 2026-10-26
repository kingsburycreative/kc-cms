# Mockup rework progress (2026-10-26)

- Checked out feat/33-dashboard-mockup (clean). Read old mockup, plan.md, project.md, kc/tests/dashboard-mockup.test.ts, app tokens (primary #A84F23).
- Rewrote index.html (generated from a scratch script so chart paths match the sample series) and mockup.css: quick actions, 30-day area chart with 7/30/90 toggle, three KPI tiles with change and sparkline, search health ring, recent changes feed, top pages and towns bar lists, one staff strip, compact other-states row.
- prose pass on labels; avoid-ai-design detect pass: no P0; fixed tabular numerals, chart fill, hover on links. App font Inter is a system-level tell, left (upstream).
- Responsive sweep 280-2560: 0 failures, 3 warnings (lone kpi note, one long advice line at 680-850, 7 days wrap at 280 cleared).
- Screenshots re-taken headless with windowsHide. dashboard-mockup.test.ts 9/9 pass, unchanged.
- Next: commit and push. Done after that.
