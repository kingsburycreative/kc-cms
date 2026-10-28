# 84 result

Files: kc/panel-state.ts (new), kc/tests/panel-state.test.ts (new), kc/dashboard-server.tsx, kc/tests/dashboard-server.test.ts. dashboard.tsx untouched.

Visits card and all three stat boxes use panelState(configured, ok, staff). Configured = the insights map returned sources. Staff link targets id="analytics-ids", added to the staff strip aside (the form is under kc/insights/, not touched). Time on site with data but no engagement keeps "Not available".

Tests: 4 in panel-state.test.ts, 1 source-read test in dashboard-server.test.ts. The runner ran the full suite each time: 526 pass, 0 fail at the end. tsc and eslint were run; both printed nothing.

Mutation: collapsing could-not-load into not-set-up failed "IDs set with a failed fetch is could-not-load"; staffLink always true failed "the staff link is only for staff". Restored, green.

Copy (prose, avoid-ai-writing, humanizer, avoid-ai-design all loaded via Skill):
- Not set up: "Visit numbers will show here once analytics is connected."
- Could not load: "The visit numbers couldn't be loaded right now."
- Staff link: "Add the analytics IDs"
- Stat boxes: "Shows once analytics is connected." / "Couldn't load right now."

Call: a user without insights access also sees not-set-up (no sources).
