# Plan: finish the dashboard to match the approved mockup (card 60)

Source: coordinator audit of kc-cms-app `origin/main` at 4fbdb06, 2026-10-26. Paths are relative to the kc-cms-app root. Mockup: `.claude/work/39-plan-dashboard/mockup/index.html`, `mockup.css`, `mockup.js`, `desktop-1280.png`. Original plan: `.claude/work/39-plan-dashboard/plan.md`.

## Why the live page does not match

Cards 42, 46, 47 and 48 (the plan's 35, 39, 40 and 43) shipped the models and first-cut panels. The layout (`kc/dashboard.tsx`) was never taken to the mockup: the three tiles, the 7/30/90 chart, the ring, the bar lists, initials, the staff strip and the publish line were never drawn. The audit card (49) only saw what existed.

| Piece | Cause | Evidence |
|---|---|---|
| Site-name header, "See live site" | (c) code built, config absent | `kc/dashboard.tsx:98-102` renders the link only when `siteUrl(object.kc)` parses; BeSciWorks `.pages.yml` `kc:` has only `client` (lines 4-5). The name is a small `<p>` under a "Dashboard" `PageHeader` (`kc/dashboard.tsx:94-95`, `dashboardName` at `kc/client-view.ts:45`), not the mockup's `<h1>BeSciWorks</h1>`. |
| Publish status line | (a) UI not built, (b) model not wired, (c) config absent | `kc/dashboard.tsx:97` is a comment: "Publish status (card 43) goes here." `kc/publish/status.ts` and `kc/publish/status-fetch.ts` exist but nothing outside tests imports them. `kc.pagesProject` is only in the schema (`kc/client-view.ts:10`). Needs a Pages project plus a token with Pages read (unverified). Card 41 audit says to hold the project in `KC_INSIGHTS_MAP`, not `.pages.yml` (`kc/BOARD.md`, pages-project-in-map). |
| Quick actions "New Weekly post / New paper / New Insight Brief / Upload a PDF" | (c) config absent | `kc/dashboard.ts:72-80` honours `kc.actions`; BeSciWorks has none, so it falls back to "Add to ..." and shows What Works. Drawn as tinted pills (`kc/dashboard.tsx:111`), not the mockup's plus-icon links. |
| Large visits chart with 7/30/90 toggle | (b) built, not wired | `InsightsChart` with the toggle is `kc/insights/chart.tsx:139-160`, used only by `kc/insights/charts-section.tsx:14` (Insights page). Dashboard `VisitsPanel` renders a sentence (`kc/dashboard-server.tsx:69`) and the compact sparkline (`:70`). |
| Three tiles (visitors, pages viewed, time on site) with change and sparkline | (a) not built | No component. Data exists: `series.days` visits and views (`kc/insights/series.ts:9`); time on site is `detail.engagement` from `loadSiteInsights` (insights `page.tsx:107`). `weekSummary` is 7-day only (`kc/dashboard-visits.ts`); no 30-over-30 helper. |
| Recent changes as sentences with initials | (a) not built, old list wired | `kc/dashboard.tsx:124-156` renders title, date "by" name and path (`:146-151`). `recentEdits` (`kc/dashboard.ts:100`) returns no verb or initials. Audit also wants the path dropped for clients (BOARD, dashboard-polish). |
| Search health ring and pages to fix | (b) wired but text only, (c) data absent | Panel is wired (`page.tsx:28`) with no ring (`kc/dashboard-server.tsx:98-113`) and returns `null` when nothing was checked (`:96`). On BeSciWorks all four collections hold only `.gitkeep` (git ls-files `src/content/*`), so `checked` is 0 and the whole panel vanishes. The loop also skips every `type: file` schema (`:81`), so the ten page JSON files (top-level title and description) are never read. Papers has no description, so it is "not checked" by design (plan flag 4). Cause of the blank panel is inferred from the repo contents; not observed in the live page. |
| Most viewed pages, Where visitors come from | (a) not built on the dashboard | Data is loaded for the Insights page only (`loadSiteInsights`, `pages.items`, `detail.cities.items`, insights `page.tsx:69-112`). No bar-list component exists. |
| Staff-only strip | (a) not built, (d) staff-only | Mockup lines 217-228: version, repository, Google Analytics property, Cloudflare site. Today staff get only the version text (`kc/dashboard-server.tsx:118-121`). Gate is `hasGithubIdentity`. |
| Motion | partly built | Chart draw-in, range fade, crosshair and tooltip exist in `MetricChart` (`kc/insights/chart.tsx:84-127`) but only render on the Insights page. Skeleton crossfade exists (`FADE`, `kc/dashboard-server.tsx:20`). Ring fill, bar growth, count-up and publishing pulse not built (card 46 result: "Not done"). |

## Cards

### 60. Bring the dashboard up to the approved mockup
Role: `implementer` on Opus. Risky path: yes (`kc/insights/`, server code reading repo content, a new outward Cloudflare call, a staff-only server decision).

Files:
- `kc/dashboard.tsx` (layout to the mockup: `<h1>` site name, publish slot, "See live site", actions, grid, tiles, activity, health, pages, towns, staff strip, CMS line)
- `kc/dashboard-server.tsx` (panels: `PublishLine`, `VisitsPanel` rebuilt, `StatTiles`, `SearchHealthPanel` rebuilt, `TopLists`, `StaffStrip`; keep `VersionLine`)
- `kc/dashboard-skeleton.tsx` (one skeleton per new panel at its final height)
- `kc/dashboard.ts` (`activitySentence`, `initials`)
- `kc/dashboard-visits.ts` (`rangeChange(days, n)`: last n days against the n before, with the "new" case)
- `kc/insights/chart.tsx` (a client `DashboardVisits` reusing the `InsightsChart` toggle and `MetricChart` for visits only; ring fill, bar growth and count-up as CSS plus one small client island; all off under `prefers-reduced-motion`)
- `kc/insights/map.ts` and `kc/client-view.ts` (the Pages project comes from the `KC_INSIGHTS_MAP` entry as `pages`, per the card 41 audit; `kc.pagesProject` stays in the schema but is ignored)
- `kc/insights/route.ts` (lowercase `seriesSiteKey`, cap the cache Map at `:53-61`)
- `app/(main)/[owner]/[repo]/[branch]/page.tsx` (new panels in `Suspense`; `getRepoReadContext` still first; decode the branch once)
- `kc/tests/dashboard-sections.test.ts` (new, the section guard)
- `kc/tests/dashboard.test.ts`, `dashboard-server.test.ts`, `dashboard-visits.test.ts`, `publish-status.test.ts`, `insights-chart.test.ts`, `insights-route.test.ts` (extend)

What it does:
1. Header. `<h1>` is `clientName(kc, repo)` (the tab title keeps "Dashboard"). `PublishLine` sits under it: `fetchPublishStatus({accountId: KC_CF_ACCOUNT_ID, token, project})`, project from the map entry. Renders "Published 2 minutes ago", "Publishing your change..." with the soft pulse, or "Your last change didn't publish. Your site still shows the version before it."; nothing when the entry has no `pages`. ISO-parse `ended_on` (`kc/publish/status.ts:34`). Only state and time reach the client.
2. Quick actions in the mockup's shape: plain links in one list with a plus (arrow for the PDF), no tint pills.
3. Visits panel: the full chart with the 7/30/90 toggle (`aria-pressed`, `role="group"`), draw-in, crosshair and tooltip, from the one `loadSeries` result. Heading "Visits". The fallback line "Visit numbers aren't available right now." keeps the heading.
4. Three tiles beside it: Visitors and Pages viewed from the last 30 days against the 30 before (`rangeChange`), each with change, count-up and sparkline; Time on site from `detail.engagement`. A missing value shows "Not available", never a blank tile. Container-query grid; tiles stack below 900px of panel width.
5. Recent changes as plain sentences with initials, from the history feed already fetched: "David updated the Home page" (verb from the change: added, updated, uploaded, else "changed"), relative time, "See all changes" link to history. No file path for clients; staff may keep it. Keep the skeleton rows.
6. Search health: SVG ring (`role="img"`, label "12 of 14 pages pass") and "Fix these next", capped at 3 for clients and 5 for staff, passing pages collapsed. Read `type: file` schemas as well as collections (the ten BeSciWorks pages) through the read path the file route uses, under the same `getRepoReadContext` check. When nothing could be checked, still render the heading with "No pages to check yet." instead of returning null.
7. Most viewed pages and Where visitors come from: bar lists from `loadSiteInsights` `pages.items` and `detail.cities.items` (cached by `defaultCache`), with staggered bar growth. Heading kept, calm empty line when empty.
8. Staff strip, built on the server only when `hasGithubIdentity(user)`: version and latest release, repository link, Google Analytics property, Cloudflare site tag and Pages project. A client's payload holds none of it. Clients get the one line "Your CMS is up to date."
9. Audit polish on the same lines: lowercase `seriesSiteKey` and cap the Map; decode the branch once (`kc/dashboard-server.tsx:44,85`, `page.tsx:18`); the chart gets the slice its label says.
10. Copy through `prose`, `avoid-ai-writing` and `humanizer`; UI through `avoid-ai-design`; each string listed in result.md. No em dash, no comma in an h1 to h3, mobile first with `min-width` queries only, 44px targets.

Done-test: `node --test --test-reporter=tap "kc/tests/**/*.test.ts"`, then `npx tsc --noEmit && npx eslint kc`.

`kc/tests/dashboard-sections.test.ts` is the section guard. It reads `.claude/work/39-plan-dashboard/mockup/index.html`, collects every `<h1>` and `<h2>` (and each `aria-labelledby` landmark) inside `<main>`: site name, Add something new, Visits, Last 30 days compared with the 30 before, Recent changes, Search health, Most viewed pages, Where visitors come from, Staff only. It asserts:
- each heading text appears as a literal in `kc/dashboard.tsx` or `kc/dashboard-server.tsx` (the site name is the `clientName` call), so a missing section fails by name;
- each section's component is rendered by `kc/dashboard.tsx` or passed from `page.tsx` inside `Suspense` with its skeleton;
- no panel returns `null` before its heading, except an allowlist of exactly three held in the test: publish line (no Pages project), "See live site" (no `kc.site`), staff strip (client session). A fourth is a visible edit;
- the old shapes are gone: no `by ${...authorName}` string, no `edit.path` in the client branch;
- the three tiles are labelled Visitors, Pages viewed and Time on site and each has a sparkline element;
- `page.tsx` calls `getRepoReadContext` before any panel, and the staff strip sits behind the `hasGithubIdentity` gate.

Unit tests: `rangeChange` (exact totals and percent, previous zero gives "new", all zeros gives none); `activitySentence` and `initials` from fixtures; publish model for published, publishing, failed, unknown; the map parser reading `pages`; a file-type schema fed through the health loop; `seriesSiteKey` lowercases.

Mutation check: (1) delete the "Most viewed pages" `<h2>` from `kc/dashboard-server.tsx`, the section guard fails naming it; (2) make `SearchHealthPanel` return `null` on an empty check, the allowlist test fails; (3) hand the staff strip to clients, the client-payload test fails; (4) treat a failed Pages fetch as published, the publish tests fail. Name the failing test for each.

Live proof (coordinator, after deploy, not the card): as Rob and as `+kctest`, at 375 and 1280, against `desktop-1280.png`; every mockup section visible; no sideways scroll; nothing moves under the OS reduced-motion setting.

## Config only (the coordinator does these, not the card)

1. `D:\Dev\htdocs\besciworks\.pages.yml`, under `kc:`, add `site: https://besciworks.com` (turns on "See live site"). Not `pagesProject`: the card reads the Pages project from the box map (audit decision).
2. Same file, under `kc:`, add `actions` with `weekly: New Weekly post`, `papers: New paper`, `insights: New Insight Brief` (keys match the collection `name` values; What Works then drops out of the row, as the plan intended). Commit and push to `main` from the BeSciWorks session; the CMS reads it from GitHub.
3. On the CMS box, in the file at `KC_INSIGHTS_MAP`, add `"pages": "besciworks"` to the `kingsburycreative/besciworks` entry, after the card ships.
4. Cloudflare: the token behind `CLOUDFLARE_ANALYTICS_TOKEN` (or a second token) needs Account, Cloudflare Pages, Read on the KC account. Unverified whether it has it. Test by status code only, never printing the value.
5. Content, not config: BeSciWorks has no entries in Weekly, What Works, Insight Briefs or Papers (only `.gitkeep`), so recent changes and the collection half of search health stay sparse until David adds real entries. The ten page files count once the card lands.
6. Deploy (card 42's step) after the card passes the gate.
