# 108.12 result

Rewrote all 18 pages (10 core, 8 module) with parts.ts: goal, time, numbered steps with chips, You will see, If not, figure slots with captions, Check it worked. approved=false, module ids and slugs kept.

Files: kc/guide/pages/core-*.ts, module-*.ts, kc/tests/help-pages.test.ts.

Tests added (per page, 18 pages): goal and "About N minutes" time; every step has You will see and If not; chips present; Check it worked block; figure slot with caption; no banned word; no client name. Done-test green (runner ran 866 tests, 0 fail, so the whole suite). No mutation check, per brief.

Copy: prose, avoid-ai-writing and humanizer skills loaded via Skill tool. Applied by hand to the drafted text (no tool run on files).

kc-test-site found; labels read from branch card/07-guide-demo .pages.yml and this repo's components.

Labels not found in source:
- core-sign-in: subject line and sender of the code email; exact code lifetime (page now says "a few minutes").
- core-undo: clock button has no text label (icon only); described as "clock button".
- core-see-who-visits: day-range button text ("Last N days" seen in a chart label, not the buttons); "From visitors who allowed analytics" not re-verified.
- core-add-remove-entry, core-photos-and-files: how a required box is marked.
- core-find-your-way: "Visits" panel heading and "Add to ..." quick-button text taken from kc/dashboard.ts logic, not a render.
- core-format-text: "Text" and "Post" box names vary by site.
- module-menu, module-hours: delete button has no text label (icon).
- Demo group names (e.g. "Henike-style") deliberately not used.

Not verified: nothing run on a real CMS; the steps follow source and demo config only.
