---
session: 15
last_updated: 2026-10-27
continue_with: Add a register-changelog card at the top of the board's Now (claim CHANGELOG-KC.md in kc/register/customizations.json so the suite goes green on main), run it, then rerun nodemailer-major's gate from wip/nodemailer-major-10. Then answer customization-guard cards 03 and 04.
blockers: Main suite is red (CHANGELOG-KC.md unclaimed by the customizations register since PR 79). The register-changelog card the last run said it queued is NOT on the board. Customization-guard cards 03 and 04 are Rob's. Cards 53, 19, 20 wait on card 06. Box changes still Rob's (proxy-rewrite-origin `-H localhost`, nginx limit_req, card 03 deploy and 403 check). zod high left open, stays on 3 pending Rob's call.
---


# KC CMS context

Self-hosted fork of Pages CMS (upstream hunvreus/pagescms), KC-branded, with an Insights view. Our repo is origin kingsburycreative/kc-cms; always pass `-R kingsburycreative/kc-cms` to `gh`. Issues are disabled on the repo; loose ends live on the board (`kc/BOARD.md`). Handoffs land through a `chore/session-N-handoff` PR.

## Recent sessions
- **Session 15 (2026-10-27, unattended loop, 1 card):** nodemailer-major (8 to 10.2.1) finished on wip/nodemailer-major-10 but parked: the main suite is red because the customizations register does not claim CHANGELOG-KC.md (added by PR 79). Fix is a small register-changelog card, not yet written onto the board.
- **Session 14 (2026-10-27, unattended loop, 8 cards):** sweep fixes before Pitt St BBQ's first login: verified-email sign-in, same-origin auth redirects, deps update, publish-status-log, series-cache-case (71), add-editor-repo-guard (72), load-config (73), customizations-register (74). All merged to main via PRs #79 and #82 (#80 and #81 closed, their commits landed through #82).
- **Session 13 (2026-10-23, unattended loop, 1 card):** card 26 (phone menu, labelled nested fields) merged.

## What exists
- Agent-loop setup: `.claude/project.md`, board `kc/BOARD.md`, `.claude/work/` (checklist, afk log `log.md`, loop log). Plans: client experience `15-plan-client-experience`, customization guard `66-plan-customization-guard` (cards 01, 02 done). Sweep findings in the private repo (`D:\Dev\htdocs\kc-cms\audits\2026-10-27-sweep\result.md`).
- On main: everything through card 26, add-editor script and repo guard, dashboard gaps, the session-14 sweep fixes, load-config and the customizations register.
- No open PRs. No CI checks on the repo. Not run against live GitHub or the box.

## Pending
- Loop: register-changelog card (to write), then nodemailer-major gate rerun from wip/nodemailer-major-10.
- Rob: customization-guard cards 03 and 04; card 06 decision for 53, 19, 20; zod major call.
- Rob, on the box: proxy-rewrite-origin (`-H localhost` in deploy.sh), card 03 deploy and 403 check, live check of the staff strip (card 63) and add-editor against real GitHub.

## To Resume
Session 16. main at c9ee2ef plus this handoff.
THIS WINDOW: write the register-changelog card at the top of Now and run the loop for it; then rerun nodemailer-major from its wip branch; then Rob answers customization-guard cards 03 and 04.
