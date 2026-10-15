---
session: 8
last_updated: 2026-10-15
continue_with: Run the loop on otp-disabled-paths (Now), then the Next column (run-claim, otp-atomic-limit, client-branch-lock and the other client-view review cards).
blockers: Four calls under Waiting on Rob on the board (nginx limit_req, invite email limit, media categories, scripts in content). The update banner has not been seen in a browser.
---

# KC CMS context

Self-hosted fork of Pages CMS (upstream hunvreus/pagescms), KC-branded, with an Insights view. Our repo is origin kingsburycreative/kc-cms; always pass `-R kingsburycreative/kc-cms` to `gh`. Issues are disabled on the repo; loose ends live on the board (`kc/BOARD.md`). Handoffs land through a `chore/session-N-handoff` PR.

## Recent sessions
- **Session 8 (2026-10-14 to 10-15, unattended loop passes, merge allowed):** Insights shipped: route (PR #16), access gate for admins, repo writers and the site's own clients (PR #17), GA4 placeholder labels (PR #18). Security audit fixes: settings and workflow dispatch gated on the user's own push access (PR #19), sign-in code rate limit keyed on nginx's X-Real-IP (PR #20), media upload and rename limited to safe types when the config names none (PR #21). Audits found no attack on any change; older findings were queued as cards. Rob accepted config-exposure and added the client-view review cards, site dashboard and Advanced toggle to the board.
- **Session 7 (2026-10-14, unattended loop):** update-banner (PR #13) and title-hook (PR #14) merged.
- **Session 6 (2026-10-14, unattended loop):** client-view passed the gate as PR #11, since merged.

## What exists
- Agent-loop setup: `.claude/project.md`, board, `.claude/work/` (checklist, afk log `log.md`, loop log).
- On main: Insights (GA4 data layer, screen, access gate, labels), uptime check workflow, weekly upstream release check, KC branding, dark-mode primary, client dashboard view, upstream update banner, settings gate, OTP rate-limit key, media type limits.
- No open PRs besides this handoff. No CI checks on the repo.

## Pending
- Loop: otp-disabled-paths in Now; Next holds run-claim, otp-atomic-limit, client-branch-lock, client-identity-redact, client-third-party, advanced-toggle, site-dashboard. Risky-path cards need the top tier and an audit.
- Rob: the four Waiting on Rob calls on the board.
- Rob: look at the update banner in a browser once an upstream sync PR exists.
- Latent, from the insights-gate audit: `hasAdminAccess` (`lib/admin.ts`) trusts ADMIN_EMAILS without checking emailVerified. Not on the board yet.
- Unchecked from branding: About's links still point at pagescms.org.

## To Resume
Session 9. main at 65c83c0 (Rob's board commit after the PR #21 merge) plus this handoff.
THIS WINDOW: run the loop on otp-disabled-paths and the Next column; answer the Waiting on Rob calls when convenient.
