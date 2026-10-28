---
session: 17
last_updated: 2026-10-27
continue_with: When the Henike session reports .pages.yml on its main, Rob reviews the Henike CMS himself; no invite to the Henike client until he says go. Then run the customization-guard plan (now local pre-push hooks, no Actions) from card 05.
blockers: Henike invite held by Rob until his own review. Henike dashboard has deploys only (no GA4 property yet, DNS still at easyDNS so no Cloudflare zone); Rob makes the GA4 property. Pitt St BBQ has no .pages.yml on any branch, so Josh's invite waits on the Pitt St session. Cards 53, 19, 20 wait on card 06. Box changes still Rob's (proxy-rewrite-origin `-H localhost`, nginx limit_req).
---


# KC CMS context

Self-hosted fork of Pages CMS (upstream hunvreus/pagescms), KC-branded, with an Insights view. Our repo is origin kingsburycreative/kc-cms; always pass `-R kingsburycreative/kc-cms` to `gh`. Issues are disabled on the repo; loose ends live on the board (`kc/BOARD.md`). Handoffs land through a `chore/session-N-handoff` PR.

## Recent sessions
- **Session 17 (2026-10-27, in window):** released and deployed 2.1.8+kc.1 and 2.1.8+kc.2 (sweep fixes, Next 16.4.3, save-size cap with a friendly editor message, nodemailer 10.2.1), tagged `kc-2.1.8.1` and `kc-2.1.8.2`. Version scheme is upstream plus `+kc.N` (`CHANGELOG-KC.md`). zod stays on 3; its memory hole is closed by the 1 MB /api cap (413, tested live). Customization guard re-planned twice: client entries in the private repo, and it runs as local pre-push hooks on Rob's PC (no Actions, no schedule, no token, no branch protection), because every risky change comes from Rob at this PC and clients have no GitHub access (checked: client repos private, no outside collaborators, Rob the only member). Found the kc-cms GitHub App only covered kc-test-site and besciworks; Rob added henike-contracting and pittstbbq. Neither has a `.pages.yml` on main yet.
- **Session 16 (2026-10-27, unattended loop, 3 cards):** register-changelog, nodemailer-major and save-size-cap gated green; merged in session 17 as PR #87.
- **Session 14 (2026-10-27, unattended loop, 8 cards):** sweep fixes before Pitt St BBQ's first login, merged via PRs #79 and #82.

## What exists
- Agent-loop setup: `.claude/project.md`, board `kc/BOARD.md`, `.claude/work/`. Plans: client experience `15-plan-client-experience`, customization guard `66-plan-customization-guard` (cards 01, 02 done; 03 and old 07, 11, 13 dropped; 05 to 15 rewritten for local hooks; 08 to 11 run in the private repo's loop). Sweep findings in the private repo (`D:\Dev\htdocs\kc-cms\audits\2026-10-27-sweep\`); never copy them here.
- Live on the box: release `183d3a5`, 2.1.8+kc.2. Deploy is `server/deploy.sh <sha>` from the private repo, coordinator only, after Rob allows it per release.
- Clients on the GitHub App: kc-test-site, besciworks, henike-contracting, pittstbbq.

## Pending
- Henike: guard entry to add to the plan (its config lands on main via the Henike session); Insights map entry `pages: henike-contracting` to add on the box once main has the config; `ga` once Rob makes the property, `cf` after the DNS move.
- Card idea: show "Create configuration file" to staff only; a client landing on a repo with no config sees that button now.
- Rob: card 06 decision for 53, 19, 20; whether to scrub client names already in this public repo.
- Unchecked: the friendly 413 message in a browser; whether the Cloudflare token has Pages read; staff strip shows to any GitHub login.

## To Resume
Session 18. main at f4331a9 plus this handoff; no open PRs.
THIS WINDOW: wait for the Henike session's "config on main" message, add Henike's Insights entry, let Rob review; no invite without his go. Then run the loop on customization-guard cards 05 to 07.
