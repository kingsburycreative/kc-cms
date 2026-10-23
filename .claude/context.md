---
session: 11
last_updated: 2026-10-23
continue_with: Merge PR #47 (run-claim, gate and audit green; the loop's merge was refused by the permission check). Then decide the two parked cards (otp-atomic-limit limits, email-verified-trust mutation run) and card 06, which cards 19 and 20 wait on.
blockers: PR #47 needs Rob to merge. otp-atomic-limit needs Rob to pick limits. email-verified-trust needs Rob to allow or run its mutation check. Cards 19 and 20 wait on card 06. Card 03 deploy and 403 check still Rob's and gate any client invite. Four older Waiting on Rob calls. Most client-experience work has not been seen in a browser.
---

# KC CMS context

Self-hosted fork of Pages CMS (upstream hunvreus/pagescms), KC-branded, with an Insights view. Our repo is origin kingsburycreative/kc-cms; always pass `-R kingsburycreative/kc-cms` to `gh`. Issues are disabled on the repo; loose ends live on the board (`kc/BOARD.md`). Handoffs land through a `chore/session-N-handoff` PR.

## Recent sessions
- **Session 11 (2026-10-23, unattended loop, 12 cards):** client-experience plan cards merged as PRs #28-#44 (identity redact, no GitHub links or sign-in, no single-file delete, white-label emails and logo, invite naming, commit author, history feed and pages, restore, site dashboard, SEO panel, Cloudflare on Insights) plus a feature security audit. Audit fixes: branch-create-gate (#45) and delete-guard-path (#46) merged; run-claim is PR #47, green but unmerged. Parked: otp-atomic-limit (per-email limit lets a stranger lock a client out) and email-verified-trust (mutation run refused). Loop stopped at max cards.
- **Session 10 (2026-10-23):** client-branch-lock merged (PR #26).
- **Session 9 (2026-10-15):** otp-disabled-paths merged (PR #23).

## What exists
- Agent-loop setup: `.claude/project.md`, board, `.claude/work/` (checklist, afk log `log.md`, loop log). Client experience plan: `.claude/work/15-plan-client-experience/plan.md`.
- On main: Insights (GA4 plus Cloudflare), uptime check, upstream release check, KC branding, client dashboard view, update banner, settings gate, OTP limits and disabled endpoints, client branch lock, client redaction and email-only sign-in, white-label emails, history and restore, site dashboard, SEO panel, branch-create and delete guards.
- Open PRs: #47 (run-claim). No CI checks on the repo.

## Pending
- Board Now: cards 19 (sidebar) and 20 (advanced section), both waiting on card 06.
- Parked, code on wip branches: otp-atomic-limit (`wip/otp-atomic-limit-count-first`), email-verified-trust (`wip/email-verified-trust-verified-email`).
- Rob: card 03 deploy and 403 check; nginx limit_req, invite email limit, media categories, scripts in content; Cloudflare field names need a live check at deploy.

## To Resume
Session 12. main at 6cb4e5e (PR #46 merge) plus this handoff.
THIS WINDOW: Rob merges PR #47, then rules on otp-atomic-limit limits and the email-verified-trust mutation run; then run the loop.
