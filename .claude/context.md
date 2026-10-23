---
session: 12
last_updated: 2026-10-23
continue_with: Decide card 06, which cards 19 and 20 (the last two in Now) wait on; then run the loop.
blockers: Cards 19 and 20 wait on card 06. Card 03 deploy and 403 check still Rob's and gate any client invite. Older Waiting on Rob calls (nginx limit_req, invite email limit, media categories, scripts in content). Most client-experience work has not been seen in a browser.
---


# KC CMS context

Self-hosted fork of Pages CMS (upstream hunvreus/pagescms), KC-branded, with an Insights view. Our repo is origin kingsburycreative/kc-cms; always pass `-R kingsburycreative/kc-cms` to `gh`. Issues are disabled on the repo; loose ends live on the board (`kc/BOARD.md`). Handoffs land through a `chore/session-N-handoff` PR.

## Recent sessions
- **Session 12 (2026-10-23, unattended loop, 2 cards):** both parked cards landed. email-verified-trust merged (PR #50) after Rob had the mutation check run; otp-atomic-limit merged (PR #51): counts before checking, 10 per IP, then 5 per email and IP, then 30 per email across IPs, so a stranger can no longer lock a client out. PR #47 (run-claim) also merged. Nothing parked; only cards 19 and 20 remain, both on card 06.
- **Session 11 (2026-10-23, unattended loop, 12 cards):** client-experience cards merged as PRs #28-#46 plus a feature security audit.
- **Session 10 (2026-10-23):** client-branch-lock merged (PR #26).

## What exists
- Agent-loop setup: `.claude/project.md`, board, `.claude/work/` (checklist, afk log `log.md`, loop log). Client experience plan: `.claude/work/15-plan-client-experience/plan.md`.
- On main: Insights (GA4 plus Cloudflare), uptime check, upstream release check, KC branding, client dashboard view, update banner, settings gate, OTP limits and disabled endpoints, client branch lock, client redaction and email-only sign-in, white-label emails, history and restore, site dashboard, SEO panel, branch-create and delete guards, run-claim, verified-email trust, count-first OTP limits.
- Open PRs: none. No CI checks on the repo.

## Pending
- Board Now: cards 19 (sidebar) and 20 (advanced section), both waiting on card 06.
- Rob: card 03 deploy and 403 check; nginx limit_req, invite email limit, media categories, scripts in content; Cloudflare field names need a live check at deploy.

## To Resume
Session 13. main at 21e8ed5 (PR #51 merge) plus this handoff.
THIS WINDOW: Rob decides card 06; then run the loop for cards 19 and 20.
