---
session: 22
last_updated: 2026-10-28
continue_with: Move kc-modules cards 05-08 from Next to Now on D:\Dev\htdocs\kc-modules\kc\BOARD.md and run them with `node ~/.claude/bin/loop-start.cjs D:/Dev/htdocs/kc-modules --max-cards 4 --no-handoff`. Then card the three dashboard defects from the session 21 screenshots (Pending) and run them in kc-cms.
blockers: Henike client invite held until Rob says go. kc-modules card 11 (tag modules-v0.1.0, set KC_PACKAGES_READ_TOKEN as each site's Cloudflare build secret) is Rob's. gbp-reviews waits on Google Business Profile API access (needs a profile verified 60+ days). Pitt St analytics IDs wait on Pitt St having a .pages.yml. Cards 53, 19, 20 wait on card 06. Box changes still Rob's (proxy-rewrite-origin `-H localhost`, nginx limit_req).
---


# KC CMS context

Self-hosted fork of Pages CMS (upstream hunvreus/pagescms), KC-branded, with an Insights view. Our repo is origin kingsburycreative/kc-cms; always pass `-R kingsburycreative/kc-cms` to `gh`. Issues are disabled on the repo; loose ends live on the board (`kc/BOARD.md`). Handoffs land through a `chore/session-N-handoff` PR.

## Recent sessions
- **Session 21 (2026-10-28, window plus loop):** shipped kc.6 (staff copy pass on analytics IDs, reviews-status: server fetch of the live site's `/reviews-status.json` plus a dashboard line, feature audit, and its one finding fixed by pinning the fetch to a checked public address) and kc.7 (the line shows "5 stars from 24 reviews, typed in by hand on Oct 12", and a shimmer skeleton replaces the full-page Loading spinner). Both deployed, tagged and seen live on Henike. Module system started: Rob chose a separate repo and approved the installs, made `KC_PACKAGES_READ_TOKEN` (Infisical, KC-CMS); kc-modules set up and cards 02-04 done (skeleton and contract, compose, ui-library token check).
- **Session 20 (2026-10-28, window plus loop):** shipped kc.3 to kc.5 (media guard, analytics IDs editor, dashboard layout fixes, keys form fixes, save baseline and JSON newline). Module system planned (`.claude/work/85-plan-module-system/plan.md`). Reviews decided with Henike: typed by hand, hidden when empty; Places API ruled out; Business Profile API carded for later.
- **Session 19 (2026-10-27, in window):** media-delete guard deployed. Decided: analytics IDs are not secrets and live in the CMS.

## Module system
Plan `.claude/work/85-plan-module-system/plan.md`, decision in `decision.md` beside it: repo kingsburycreative/kc-modules at `D:\Dev\htdocs\kc-modules`, its own `.claude/project.md` and board. Cards naming kc-framework paths target kc-modules. Done: 02, 03, 04 (`e67fb90`). Next: 05 drift guard, 06 safe-markdown, 07 papers, 08 i18n, 10 release workflow (Risky); 11 is Rob's; 12-13 adopt in BeSciWorks and Henike; 14 audit.

## What exists
- Agent loop: one global loop now (another window, 2026-10-28). Start it with `node ~/.claude/bin/loop-start.cjs <project> --max-cards N --no-handoff`; it runs detached, so watch `<project>/.claude/work/loop/run.out` and include "Stopping" in any filter. It refuses a dirty tree. The loop commits straight to main. This window's guards refuse product commits, release commits and tag pushes, in any repo; handoff commits on `chore/session-*-handoff` touching only context.md pass, and board-only commits pass. Release commits, deploys and tags are Rob's to run.
- Release: bump `version` in package.json and package-lock.json (lines 8, 3, 9), CHANGELOG-KC.md section, Rob commits and pushes, deploy from `D:\Dev\htdocs\kc-cms` (scp `server/deploy.sh` to ubuntu@51.222.6.173 with `~/.ssh/kc_cms_ovh`, then `sudo bash deploy.sh <sha>`; health check rolls back), tag `kc-2.1.8.N`. Live: kc.7, `fcd878c`.
- Reviews: `kc/reviews/status-fetch.ts` (configured origin, fixed path, 5 s, size cap, resolved-address check in `safe-lookup.ts`), line in `kc/dashboard-server.tsx`.
- Analytics IDs live in the `insights_keys` table; writes need admin access plus GitHub repo admin.
- Clients on the GitHub App: kc-test-site, besciworks, henike-contracting, pittstbbq.
- Sweep findings stay in the private repo (`D:\Dev\htdocs\kc-cms\audits\`); never copy them here.

## Pending
- Dashboard defects from session 21 screenshots, not carded yet: at 500px the page header clips "Dashboard" and squeezes it onto "See live site"; BeSciWorks' desktop visits chart draws at half the card width with a flat line and a cut-off last date; Henike's zero chart labels the axis "1 1 1 0 0". Chrome will not go below 500px, so true phone width needs device emulation.
- Loop bug: card 95's audit wrote "filed reviews-ssrf-resolve in Next" in its result and log but never put it on the board; added by hand. Worth a check in the global loop's park/follow-up step.
- Pitt St IDs held in `D:\Dev\htdocs\.credentials\pittstbbq.md`; enter once Pitt St has a CMS entry. Henike adds its gtag and Cloudflare beacon on its side; Visits reads 0 until then.
- Unchecked: whether the Cloudflare token has Pages read; the friendly 413 message in a browser; the route skeleton at true phone width.

## To Resume
Session 22. main at the session-21 handoff on top of `fcd878c` (Release 2.1.8+kc.7, deployed, tagged). No open PRs. kc-modules main at `e67fb90`.
THIS WINDOW: in kc-modules move 05-08 to Now and run them through `loop-start.cjs` (one run, `--max-cards 4`). Then card the three dashboard defects in Pending and run them in kc-cms; release as kc.8 when they land (Rob runs the commit, deploy and tag).
