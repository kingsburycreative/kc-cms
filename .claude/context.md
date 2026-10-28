---
session: 19
last_updated: 2026-10-27
continue_with: Run media-refs-wide first and deploy it (Henike's round trip depends on it), then card insights-keys-editor, release it as 2.1.8+kc.3 (bump, CHANGELOG-KC.md, tag kc-2.1.8.3) and deploy with Rob's OK, with the four dashboard layout fixes (section below) carded and in the same release; then test it end to end on Henike (Rob creates the GA4 property and Cloudflare Web Analytics site, the Henike session adds both tags, Rob enters the IDs in the staff area). After that, plan the module system.
blockers: Henike client invite held until Rob reviews the Henike CMS himself and says go. Pitt St BBQ has no .pages.yml on any branch, so Josh's invite waits on the Pitt St session. Cards 53, 19, 20 wait on card 06. Box changes still Rob's (proxy-rewrite-origin `-H localhost`, nginx limit_req).
---


# KC CMS context

Self-hosted fork of Pages CMS (upstream hunvreus/pagescms), KC-branded, with an Insights view. Our repo is origin kingsburycreative/kc-cms; always pass `-R kingsburycreative/kc-cms` to `gh`. Issues are disabled on the repo; loose ends live on the board (`kc/BOARD.md`). Handoffs land through a `chore/session-N-handoff` PR.

## Recent sessions
- **Session 19 (2026-10-27, in window):** media-delete guard (PR #91) merged and deployed live as `891a106`; the version label still reads 2.1.8+kc.2, so kc.3 ships with the key editor. Carded insights-keys-editor: staff set a site's analytics IDs in the CMS, stored in a new table (project.md allows that card one migration), writes limited to GitHub repo admins because `hasGithubIdentity` lets any GitHub login through. Decided: analytics IDs are not secrets and live in the CMS; Infisical keeps only the shared Google service account key and Cloudflare token. GA4 and Cloudflare Web Analytics both work by script tag, no DNS move needed (the Cloudflare side is unchecked against our code). Henike's `.pages.yml` is on its main now but has no `kc:` or `media:` block and only the posts collection; the Henike session has BeSciWorks' keys to copy. The CMS has no language switch: EN/FR is two entries per section unless Rob asks for a real toggle.
- **Session 18 (2026-10-27, unattended loop, 1 card):** media-delete-guard gated green with the security audit passing: a 409 naming up to five pages. Nested collection subfolders are not searched yet and code references do not block.
- **Session 17 (2026-10-27, in window):** released 2.1.8+kc.1 and kc.2 (sweep fixes, Next 16.4.3, 1 MB /api save cap closing the zod hole, nodemailer 10.2.1). Customization guard re-planned as local pre-push hooks on Rob's PC (no Actions). Rob added henike-contracting and pittstbbq to the kc-cms GitHub App.

## Module system (Rob, 2026-10-27, next big piece)
Every feature (EN/FR, academic papers, image gallery, payments with a provider abstraction so Pitt St's work carries to the next shop) becomes a module that a new project adds, not copies: site-side code, its matching `.pages.yml` block, and tests. Home is `kc-framework`, tied to Rob's `../ui-library`. Start with a planner pass that extracts what BeSciWorks, Chris Ward, Henike and Pitt St already built, plus modules upcoming projects will need. Most of it lives outside this repo; only the CMS setup blocks touch it.

## What exists
- Agent-loop setup: `.claude/project.md`, board `kc/BOARD.md`, `.claude/work/`. Plans: client experience `15-plan-client-experience`, customization guard `66-plan-customization-guard` (local hooks; 08 to 11 run in the private repo's loop; a Henike entry still to add). Sweep findings in the private repo (`D:\Dev\htdocs\kc-cms\audits\2026-10-27-sweep\`); never copy them here.
- Live on the box: `891a106`, labelled 2.1.8+kc.2. Deploy is `server/deploy.sh <sha>` from the private repo, coordinator only, after Rob allows it per release.
- Clients on the GitHub App: kc-test-site, besciworks, henike-contracting, pittstbbq. Insights shows Pages deploys only alongside `ga` or `cf` (`kc/insights/map.ts`).

## Dashboard layout fixes (Rob, 2026-10-27, seen side by side on BeSciWorks and Henike)
Card these and run them right after the key editor, before Rob reviews Henike: (1) no Dashboard link in the sidebar on any site, add it first; (2) quick actions render as underlined text links on every site, make them real buttons; (3) sidebar sections (Media, Insights) and the "See live site" link vanish when a site lacks config, keep them in the layout with a plain "not set up yet" state; (4) empty panels (Henike's Visits card, "Not available" boxes) need a proper setup-pending state, not blank space. UI through avoid-ai-design, mobile first, proof is screenshots of both sites at phone and desktop width.

## Pending
- Card idea: show "Create configuration file" to staff only. Card idea: adding a client connects its repo to the App automatically (needs a classic token from Rob, kept in Infisical; fits the private repo's add-site card 09).
- Rob: card 06 decision for 53, 19, 20; whether to scrub client names already in this public repo.
- Unchecked: the friendly 413 message in a browser; whether the Cloudflare token has Pages read.

## To Resume
Session 20. main at 891a106 plus this handoff; no open PRs.
THIS WINDOW: first media-refs-wide (top of Now; the Henike session's CMS round trip tests it, deploy allowed by Rob, tell henike-contracting when live), then insights-keys-editor; card the four dashboard layout fixes and run them; merge and release kc.3 with Rob's OK; then the Henike end-to-end key test. Then a planner pass for the module system.
