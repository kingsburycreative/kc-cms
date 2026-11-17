# 108.07 result

Pages written (all `approved = false`, checked 2026-11-17, module ids publications, events, menu, hours):
`kc/guide/pages/module-publications.ts`, `module-events.ts`, `module-menu.ts`, `module-hours.ts`. Registered in `kc/guide/pages.ts`. Test `kc/tests/help-pages.test.ts` extended to expect all eight module ids.

Copy: written with prose, avoid-ai-writing, humanizer (all three invoked via Skill, none refused). Titles: "Papers, research summaries and weekly posts", "Events", "Menu", "Opening hours". Examples: Friday Jazz Night, 7 pm, $14, Study Summary 2026 Final.PDF.

Picture markers: weekly post form with description length message; paper form with PDF name; three-dot menu on a paper; event form with date picker; events list; menu form with item open; live menu page; Hours and contact form scrolled to hours; live contact page with hours.

Mutation: the first run failed on "uses none of the banned words" for module-publications ("Annual Report" matched `repo\w*`). Reworded, rerun green (735 pass, 0 fail). Runner runs the full suite regardless of filter; guide-build passes. No separate deliberate-break run was done.

Not verified: steps checked against the demo config only, not clicked through in a running CMS. "Delete button beside item" in menu and hours pages is assumed from the list UI. Deny-list: no existing file under kc/guide/ matched.
