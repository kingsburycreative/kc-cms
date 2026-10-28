---
session: 21
last_updated: 2026-10-28
continue_with: Push the kc-2.1.8.5 tag if Rob has not (the guard blocks it here). Take the phone and desktop screenshots of BeSciWorks and Henike in Rob's Chrome (Chrome in front, check other windows before resizing). Run keys-copy-pass (top of Now). Then card the module system plan in kc-modules once Rob approves the package install in both sites and makes a read-only GitHub package token.
blockers: Henike client invite held until Rob says go. Module system waits on Rob (package install OK, read-only package token). reviews-status waits on Henike's reviews module shipping /reviews-status.json. gbp-reviews waits on Google Business Profile API access, which needs a profile verified 60+ days (KC's own profile is unverified; Rob enters the hidden mailing address on the verify page). Pitt St analytics IDs wait on Pitt St having a .pages.yml. Cards 53, 19, 20 wait on card 06. Box changes still Rob's (proxy-rewrite-origin `-H localhost`, nginx limit_req).
---


# KC CMS context

Self-hosted fork of Pages CMS (upstream hunvreus/pagescms), KC-branded, with an Insights view. Our repo is origin kingsburycreative/kc-cms; always pass `-R kingsburycreative/kc-cms` to `gh`. Issues are disabled on the repo; loose ends live on the board (`kc/BOARD.md`). Handoffs land through a `chore/session-N-handoff` PR.

## Recent sessions
- **Session 20 (2026-10-28, window plus loop):** shipped kc.3 (media guard across all paths and src/, analytics IDs editor in the staff strip, four dashboard layout fixes), kc.4 (keys form keeps saved values, one setup banner, KC stat tile, cool neutral tokens, shimmer skeletons) and kc.5 (save baseline resets after a save, JSON keeps its trailing newline; both from Henike's live testing). Live on the box: `3e34173`, labelled 2.1.8+kc.5. Henike's GA4 561101654, Cloudflare site 37ba81e31876497a8633e76726d48b49 and Pages henike-contracting are saved in the CMS. Module system planned (`.claude/work/85-plan-module-system/plan.md`): one private package `@kingsburycreative/kc-modules` in the new repo kingsburycreative/kc-modules (empty). Reviews decided with the Henike window: typed by hand only, with a client-set date, hidden when empty; Places API ruled out (its terms forbid storing rating and count); Business Profile API is free and allows 30-day storage, so a live option is carded for later. bandpilot's loop copy synced (2806a3c on its chore/loop-copy-speed, not merged).
- **Session 19 (2026-10-27, in window):** media-delete guard (PR #91) deployed. Carded insights-keys-editor. Decided: analytics IDs are not secrets and live in the CMS; Infisical keeps only the Google service account key and the Cloudflare token.
- **Session 18 (2026-10-27, unattended loop, 1 card):** media-delete-guard gated green with the security audit passing.

## Module system (Rob, 2026-10-27)
Every feature (EN/FR, papers, gallery, payments with a provider abstraction, reviews) becomes a module a project adds: site code, its `.pages.yml` block, tests. Plan cards 02 package skeleton, 03 compose tool (`kc-modules.json` + `.pages.src.yml` → `.pages.yml`, build fails on drift), 04 ui-library tie by token names only. Milestone: safe-markdown, papers, EN/FR adopted by BeSciWorks and Henike. Henike is building the reviews module in a lift-out shape.

## What exists
- Agent-loop setup: `.claude/project.md`, board `kc/BOARD.md`, `.claude/work/`. The loop commits straight to main (no branch cut). This window's guards (`coordinator-only.cjs`, `loop-only-cards.cjs`) refuse product commits, pushes and tag pushes, and refuse agents asked to commit; they read env vars at launch, so Rob's OK in chat does not lift them. Release commits and tag pushes are Rob's to run, or a window launched with `COORDINATOR_ONLY=off`.
- Release: bump `version` in package.json and package-lock.json, CHANGELOG-KC.md section, deploy, tag `kc-2.1.8.N`. Deploy from `D:\Dev\htdocs\kc-cms`: scp `server/deploy.sh` to ubuntu@51.222.6.173 with `~/.ssh/kc_cms_ovh`, then `sudo bash deploy.sh <sha>` (health check rolls back; keeps 3 releases).
- Analytics IDs live in the `insights_keys` table; `insightsSourcesFor` falls back to KC_INSIGHTS_MAP. Writes need admin access plus GitHub repo admin; an ID bound to another repo is refused.
- Clients on the GitHub App: kc-test-site, besciworks, henike-contracting, pittstbbq. "View on GitHub" is hidden from email-only clients everywhere (`viewFor().githubLinks`, test in `kc/tests/client-view.test.ts`).
- Sweep findings stay in the private repo (`D:\Dev\htdocs\kc-cms\audits\`); never copy them here.

## Pending
- Pitt St IDs held in `D:\Dev\htdocs\.credentials\pittstbbq.md` (GA4 561143198, CF site tag there); enter once Pitt St has a CMS entry.
- Henike adds the gtag (G-NF98VHER8R) and Cloudflare beacon on its side; Visits reads 0 until then.
- Unchecked: whether the Cloudflare token has Pages read; the friendly 413 message in a browser; whether a client profile KC manages counts toward Business Profile API eligibility.
- Card ideas: "Create configuration file" for staff only; adding a client connects its repo to the App automatically.

## To Resume
Session 21. main at the session-20 handoff on top of `3e34173` (Release 2.1.8+kc.5, deployed). No open PRs. Tag `kc-2.1.8.5` was not pushed from the window; check `git ls-remote --tags origin kc-2.1.8.5` and push it if missing.
THIS WINDOW: screenshots of BeSciWorks and Henike at phone and desktop width; run keys-copy-pass through the loop (`--max-cards 1 --no-handoff`); ask Rob for the module system go (package install, read-only token), then card plan cards 02-04 in kc-modules. Watch for Henike's status file and start reviews-status when it ships.
