---
session: 10
last_updated: 2026-10-23
continue_with: Deploy the client branch lock to the box and confirm the 403 as the +kctest client (board Waiting on Rob, plan card 03), then delete `.claude/work/loop/STOP` and run the loop on Now from card 02 (identity redact).
blockers: Card 03 deploy is Rob's and gates any client invite. Four older calls under Waiting on Rob (nginx limit_req, invite email limit, media categories, scripts in content). The update banner and the branch lock have not been seen in a browser.
---

# KC CMS context

Self-hosted fork of Pages CMS (upstream hunvreus/pagescms), KC-branded, with an Insights view. Our repo is origin kingsburycreative/kc-cms; always pass `-R kingsburycreative/kc-cms` to `gh`. Issues are disabled on the repo; loose ends live on the board (`kc/BOARD.md`). Handoffs land through a `chore/session-N-handoff` PR.

## Recent sessions
- **Session 10 (2026-10-23, unattended loop pass, merge allowed):** client-branch-lock merged (PR #26): clients are locked to the default branch in the seven branch API routes and the repo read context, see an empty branch list and get Access denied off the default branch. Security audit passed. Not seen in a browser. Loop then stopped on the STOP file.
- **Session 9 (2026-10-15, unattended loop pass):** otp-disabled-paths merged (PR #23): five unused email-OTP endpoints answer 404. The URL-prefix gap the audit noted is folded into otp-atomic-limit.
- **Session 8 (2026-10-14 to 10-15, unattended loop passes):** Insights route, gate and labels (PRs #16-#18); settings gate (PR #19), OTP rate-limit key (PR #20), media type limits (PR #21).

## What exists
- Agent-loop setup: `.claude/project.md`, board, `.claude/work/` (checklist, afk log `log.md`, loop log). Client experience plan: `.claude/work/15-plan-client-experience/plan.md`.
- On main: Insights, uptime check, weekly upstream release check, KC branding, dark-mode primary, client dashboard view, update banner, settings gate, OTP rate-limit key, media type limits, disabled email-OTP endpoints, client branch lock.
- No open PRs besides this handoff. No CI checks on the repo.

## Pending
- Loop Now: plan cards 02 and 08-17 onward (identity redact, no GitHub links, no GitHub sign-in, no single-file delete, email white-label, invite naming, commit author, history, site dashboard). Next: run-claim, otp-atomic-limit (risky, top tier plus audit).
- Rob: card 03 deploy and 403 check; the four Waiting on Rob calls; a browser look at the update banner.
- Latent: `hasAdminAccess` (`lib/admin.ts`) trusts ADMIN_EMAILS without checking emailVerified. Not on the board yet.
- Unchecked from branding: About's links still point at pagescms.org.

## To Resume
Session 11. main at 8e8c1be (PR #26 merge) plus this handoff.
THIS WINDOW: Rob deploys the lock and checks the 403 as +kctest; then delete the STOP file and run the loop on Now from card 02.
