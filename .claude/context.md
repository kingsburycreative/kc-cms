---
session: 23
last_updated: 2026-10-29
continue_with: Rob is moving to client projects; nothing in KC CMS is broken. When he comes back, run kc-modules card 10 (release workflow, Risky) on its own with `node ~/.claude/bin/loop-start.cjs D:/Dev/htdocs/kc-modules --max-cards 1 --no-handoff` after moving it to Now. That unblocks Rob's card 11.
blockers: Henike client invite held until Rob says go; check card 03 first (confirm the lock's 403 as the +kctest client before any client invite). kc-modules card 11 (tag modules-v0.1.0, set KC_PACKAGES_READ_TOKEN as each site's Cloudflare build secret) is Rob's. gbp-reviews waits on Google Business Profile API access (needs a profile verified 60+ days). Pitt St analytics IDs wait on Pitt St having a .pages.yml. Cards 53, 19, 20 wait on card 06. Box changes still Rob's (proxy-rewrite-origin `-H localhost`, nginx limit_req).
---


# KC CMS context

Self-hosted fork of Pages CMS (upstream hunvreus/pagescms), KC-branded, with an Insights view. Our repo is origin kingsburycreative/kc-cms; always pass `-R kingsburycreative/kc-cms` to `gh`. Issues are disabled on the repo; loose ends live on the board (`kc/BOARD.md`). Handoffs land through a `chore/session-N-handoff` PR.

## Recent sessions
- **Session 22 (2026-10-28/29, window plus loop, part AFK):** kc-modules cards 05 drift guard, 06 safe-markdown, 07 papers, 08 i18n landed in one run; reviewing 06 found that a `javascript:` link whose destination starts on the next line passed the check, fixed as card 09 (`6f3fc55`). Shipped kc.8 (`0b0ad59`, tag kc-2.1.8.8): chart-zero-axis, chart-card-width, header-narrow. Seen live: BeSciWorks chart fills its card at desktop width and shows Oct 29; its "flat line" was real data (zero visits until Oct 22); Henike's zero chart reads 0 and 1; header at 500px shows "Dashboard" in full with the link underneath. Floorplan (codebase map plugin) passed to the Henike window for a trial, pinned at 59a12f4 with FLOORPLAN_NO_PROMPTS=1.
- **Session 21 (2026-10-28, window plus loop):** shipped kc.6 (staff copy pass on analytics IDs, reviews-status fetch and dashboard line, feature audit and its fix) and kc.7 (typed rating on the reviews line, shimmer route skeleton). Module system started: separate repo kingsburycreative/kc-modules, cards 02-04.
- **Session 20 (2026-10-28, window plus loop):** shipped kc.3 to kc.5 (media guard, analytics IDs editor, dashboard layout fixes, keys form fixes, save baseline and JSON newline). Module system planned. Reviews decided with Henike: typed by hand, hidden when empty; Business Profile API carded for later.

## Module system
Plan `.claude/work/85-plan-module-system/plan.md`, decision in `decision.md` beside it: repo kingsburycreative/kc-modules at `D:\Dev\htdocs\kc-modules`, its own `.claude/project.md` and board. Cards naming kc-framework paths target kc-modules. Done: 02-09 (main `6f3fc55`). Next: 10 release workflow (Risky); 11 is Rob's; 12-13 adopt in BeSciWorks and Henike; 14 audit.

## What exists
- Agent loop: one global loop. Start it with `node ~/.claude/bin/loop-start.cjs <project> --max-cards N --no-handoff`; it runs detached, so watch `<project>/.claude/work/loop/run.out`. Gate lines read "audit passed" and "the suite passed", so filter on `gate round` broadly. It refuses a dirty tree, commits and pushes straight to main.
- Window guards: `coordinator-only.cjs` refuses commits and pushes from this window. Its bookkeeping exception (board, work files, context.md) resolves the project from this window's folder only, so it covers kc-cms-app and never kc-modules; board commits there go to one small background agent. Background agents may make the release commit. Pushing a tag is refused by the permission classifier even for an agent, so the tag is Rob's.
- Release: bump `version` in package.json and package-lock.json, CHANGELOG-KC.md section, commit and push (agent), deploy from `D:\Dev\htdocs\kc-cms` (scp `server/deploy.sh` to ubuntu@51.222.6.173 with `~/.ssh/kc_cms_ovh`, then `sudo bash deploy.sh <sha>`; health check rolls back), Rob tags `kc-2.1.8.N`. Live: kc.8, `0b0ad59`.
- Reviews: `kc/reviews/status-fetch.ts` (configured origin, fixed path, 5 s, size cap, resolved-address check in `safe-lookup.ts`), line in `kc/dashboard-server.tsx`.
- Charts: `kc/insights/chart.tsx` sizes from a measured frame; axis splits in `valueSplits` (`chart-model.ts`).
- Analytics IDs live in the `insights_keys` table; writes need admin access plus GitHub repo admin.
- Clients on the GitHub App: kc-test-site, besciworks, henike-contracting, pittstbbq.
- Sweep findings stay in the private repo (`D:\Dev\htdocs\kc-cms\audits\`); never copy them here.

## Pending
- Loop bug: card 95's audit wrote "filed reviews-ssrf-resolve in Next" in its result and log but never put it on the board. Worth a check in the global loop's park/follow-up step.
- An uncommitted 3-line change in `~/.claude/bin/claude-loop.cjs` (`--no-index` on `git check-ignore` in commitInCode, saved 2026-10-28 13:59) belongs to neither this window nor Henike's; owner unknown.
- Pitt St IDs held in `D:\Dev\htdocs\.credentials\pittstbbq.md`; enter once Pitt St has a CMS entry. Henike adds its gtag and Cloudflare beacon on its side; Visits reads 0 until then.
- Unchecked: true phone width (375px; Chrome stops at 500, needs device emulation) for the header and route skeleton; the friendly 413 message in a browser; whether the Cloudflare token has Pages read.

## To Resume
Session 23. main at the session-22 handoff on top of `0b0ad59` (Release 2.1.8+kc.8, deployed, tagged kc-2.1.8.8). No open PRs. kc-modules main at `6f3fc55`, cards 02-09 done.
THIS WINDOW: nothing is waiting. When Rob returns to KC CMS, move kc-modules card 10 to Now (board commit through a small agent) and run it alone with `loop-start.cjs --max-cards 1`; then Rob does card 11.
