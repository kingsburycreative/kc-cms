---
session: 9
last_updated: 2026-10-15
continue_with: Delete `.claude/work/loop/STOP` (Rob's, set 2026-10-15 16:32), then run the loop on the Next column, risky cards first (run-claim, otp-atomic-limit, client-branch-lock, client-identity-redact), then client-third-party, advanced-toggle, site-dashboard.
blockers: Four calls under Waiting on Rob on the board (nginx limit_req, invite email limit, media categories, scripts in content). The update banner has not been seen in a browser.
---

# KC CMS context

Self-hosted fork of Pages CMS (upstream hunvreus/pagescms), KC-branded, with an Insights view. Our repo is origin kingsburycreative/kc-cms; always pass `-R kingsburycreative/kc-cms` to `gh`. Issues are disabled on the repo; loose ends live on the board (`kc/BOARD.md`). Handoffs land through a `chore/session-N-handoff` PR.

## Recent sessions
- **Session 9 (2026-10-15, unattended loop pass, merge allowed):** otp-disabled-paths merged (PR #23): five unused email-OTP endpoints now answer 404. Audit found no live attack; the URL-prefix gap it noted is folded into otp-atomic-limit. The loop then stopped on Rob's STOP file with the Now column empty.
- **Session 8 (2026-10-14 to 10-15, unattended loop passes):** Insights route, gate and labels (PRs #16-#18); settings gate (PR #19), OTP rate-limit key (PR #20), media type limits (PR #21). Rob accepted config-exposure and added the client-view review cards, site dashboard and Advanced toggle.
- **Session 7 (2026-10-14, unattended loop):** update-banner (PR #13) and title-hook (PR #14) merged.

## What exists
- Agent-loop setup: `.claude/project.md`, board, `.claude/work/` (checklist, afk log `log.md`, loop log).
- On main: Insights (GA4 data layer, screen, access gate, labels), uptime check workflow, weekly upstream release check, KC branding, dark-mode primary, client dashboard view, upstream update banner, settings gate, OTP rate-limit key, media type limits, disabled email-OTP endpoints.
- No open PRs besides this handoff. No CI checks on the repo.

## Pending
- Loop: Now is empty. Next holds run-claim, otp-atomic-limit, client-branch-lock, client-identity-redact (risky paths: top tier and an audit), client-third-party, advanced-toggle, site-dashboard.
- Rob: the four Waiting on Rob calls on the board.
- Rob: look at the update banner in a browser once an upstream sync PR exists.
- Latent, from the insights-gate audit: `hasAdminAccess` (`lib/admin.ts`) trusts ADMIN_EMAILS without checking emailVerified. Not on the board yet.
- Unchecked from branding: About's links still point at pagescms.org.

## To Resume
Session 10. main at ac4162e (PR #23 merge) plus this handoff.
THIS WINDOW: delete the STOP file if Rob is done with it, move run-claim into Now, run the loop on Next; answer the Waiting on Rob calls when convenient.
