---
session: 17
last_updated: 2026-10-27
continue_with: See the friendly too-large message in a browser (sign in as the +kctest client with Rob watching, save a page over 1 MB). Then Rob makes the customization-guard status token (card 03) and OKs about 720 Actions minutes a month, and the loop runs public cards 05 to 07.
blockers: Customization-guard cards 03 (status token, Rob makes it, never in a file), 13 (branch protection) and the Actions-minutes OK are Rob's. Pitt St BBQ's guard entry (card 10) waits until pittstbbq has a .pages.yml; add-editor refuses that repo until then. Cards 53, 19, 20 wait on card 06. Box changes still Rob's (proxy-rewrite-origin `-H localhost`, nginx limit_req).
---


# KC CMS context

Self-hosted fork of Pages CMS (upstream hunvreus/pagescms), KC-branded, with an Insights view. Our repo is origin kingsburycreative/kc-cms; always pass `-R kingsburycreative/kc-cms` to `gh`. Issues are disabled on the repo; loose ends live on the board (`kc/BOARD.md`). Handoffs land through a `chore/session-N-handoff` PR.

## Recent sessions
- **Session 17 (2026-10-27, in window):** released and deployed twice. 2.1.8+kc.1 (sweep fixes, Next 16.4.3, better-auth, tiptap, resend) and 2.1.8+kc.2 (save-size cap, nodemailer 10.2.1, register-changelog), both live and checked, tagged `kc-2.1.8.1` and `kc-2.1.8.2`. Version scheme is upstream version plus `+kc.N`, explained in `CHANGELOG-KC.md`; the update check ignores the suffix. zod stays on 3 to match upstream; its memory hole is closed by a 1 MB cap on /api bodies (413, tested live) with a friendly editor message. Customization guard re-planned: client entries live in the private repo, per Rob's four answers (`D:\Dev\htdocs\kc-cms\audits\2026-10-27-customization-guard-decisions.md`).
- **Session 16 (2026-10-27, unattended loop, 3 cards):** register-changelog, nodemailer-major and save-size-cap gated green; all merged in session 17 as PR #87.
- **Session 14 (2026-10-27, unattended loop, 8 cards):** sweep fixes before Pitt St BBQ's first login, merged via PRs #79 and #82.

## What exists
- Agent-loop setup: `.claude/project.md`, board `kc/BOARD.md`, `.claude/work/` (checklist, afk log `log.md`, loop log). Plans: client experience `15-plan-client-experience`, customization guard `66-plan-customization-guard` (cards 01, 02 done; 03 to 15 planned, 08 to 11 run in the private repo's loop). Sweep findings in the private repo (`D:\Dev\htdocs\kc-cms\audits\2026-10-27-sweep\`); never copy them here.
- Live on the box: release `183d3a5`, 2.1.8+kc.2. Deploy is `server/deploy.sh <sha>` from the private repo, coordinator only, after Rob allows it per release.

## Pending
- Rob: card 03 token, Actions-minutes OK, card 13 branch protection, card 06 decision for 53, 19, 20, whether to scrub client names already in this public repo.
- Unchecked: the friendly 413 message in a browser; whether the Cloudflare token has Pages read (publish status logs its code now); staff strip shows to any GitHub login; `extra_checks` in project.md is read by nothing in `.claude/bin`.

## To Resume
Session 18. main at 183d3a5 (tag kc-2.1.8.2) plus this handoff; no open PRs.
THIS WINDOW: browser-check the too-large message with Rob; then, once Rob gives the status token and the Actions OK, run the loop on customization-guard cards 05 to 07.
