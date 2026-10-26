# Plan: a slicker site dashboard (Rob, 2026-10-26)

Rob: "clean up the dashboard for kc-cms so it's slicker (including besciworks). Some analytics, version checker/updater, seo health check, etc." Paths are relative to the kc-cms-app root. Depends on cards 28 to 30 of `.claude/work/38-plan-insights-charts/plan.md` landing first (`loadSeries`, `chart-model.ts`, `chart.tsx`).

New layout (Rob approved the direction 2026-10-26, round 2 of the mockup), inside the app's own shell (sidebar at 768px and up, the phone menu below): a header with the site name, the publish status ("Published 2 minutes ago") and a "See live site" link to the client's public site; quick actions as quiet tinted links (New Weekly post, New paper, New Insight Brief, Upload a PDF); a visits chart with a 7/30/90 toggle beside three tiles (visitors, pages viewed, time on site), each with change and a sparkline; recent changes as plain sentences with initials; search health as a ring plus the pages to fix first, the passing ones collapsed; most viewed pages and visitor towns as bar lists; a client version line; one staff-only strip. Motion runs once per visit and is off under `prefers-reduced-motion`: chart draw-in, ring fill, staggered bars, count-up, skeleton crossfade, range crossfade, pointer crosshair and tooltip, and the publishing pulse. The tile wall goes; the sidebar already lists every page.

## Flags

1. **No updater can exist on the dashboard.** An update is: merge the upstream PR, then `deploy.sh` on the box. Merging needs a write token and deploying is on the Never list. Staff get a status line and the PR link, nothing that acts.
2. **The current banner checks the wrong thing.** `kc/update/banner-fetch.ts` asks GitHub, without a token, for open PRs on `kingsburycreative/kc-cms`. If that repo is private it answers 404 and the banner is always empty (unverified). An open PR also does not mean the box runs it. Card 37 compares the running `package.json` version (2.1.8) with `hunvreus/pagescms` releases, which are public. The banner stays on `/admin`.
3. **`page.tsx` does no server-side access check today**; the client fetches go through checked API routes. New server data must call `getRepoReadContext` first (card 40).
4. **SEO health needs a site-wide read.** The rules run per open entry in the editor. BeSciWorks Weekly, What Works and Insight Briefs have title, description and body; the page files have title and description only; Papers has no description (abstract), so it is not covered. The reading-grade and opening-answer checks will mark most research briefs "fix", so the headline counts only title, description, headings and image text; the other two show as advice.
5. **`kc/insights/chart.tsx` is in a risky directory**, and `MetricChart` is not exported today. Card 38 edits it, so it gets the audit.
6. **Client view.** Clients see: their own visit totals (same gate as Insights), their own page titles, one "up to date" line. Staff only: version numbers, PR link, file paths. Enforced on the server by leaving the data out of the props. My worry: a list of "fix" pages can alarm a client, so the copy is calm and capped at three.
7. **Upstream files touched:** only `app/(main)/[owner]/[repo]/[branch]/page.tsx`, already KC-edited.
8. **Two new outward reads.** The site URL is client config (`kc.site`), so the link is only rendered when it parses as `https:`; anything else is dropped, never echoed into `href`. Publish status calls the Cloudflare Pages deployments API, which needs a token with Pages read on the KC account; the existing Web Analytics token may not carry that scope (unverified). Card 43 gets the audit.
9. **Sidebar touch targets.** The app's shadcn sidebar items are 32px tall (`h-8` in `components/ui/sidebar.tsx`), under the 44px floor. The mockup draws them at 44. Fixing the upstream sidebar is not in this round; it needs its own card naming that file.
10. Render code is tested by source text only (no harness), so card 42's live check carries the browser proof. I cannot edit `kc/BOARD.md`; the coordinator adds cards 33 to 42.

## Cards

### 33. Design mockup
Role: `implementer`. Risky path: no.
- `.claude/work/39-plan-dashboard/mockup/index.html`
- `.claude/work/39-plan-dashboard/mockup/mockup.css`
- `.claude/work/39-plan-dashboard/mockup/phone-375.png`
- `.claude/work/39-plan-dashboard/mockup/desktop-1280.png`
- `kc/tests/dashboard-mockup.test.ts`

Static page with BeSciWorks-like data (4 collections, 14 pages, 412 visits, 2 pages to fix, 5 recent changes) inside the app shell, with a compact row of other states (loading, publishing, publish failed, no visits, check failed) and one staff strip. Round 2 adds `mockup.js` (motion, range toggle, crosshair, phone menu) and `desktop-1024.png`; the page reads fully without the script. Mobile-first CSS, `min-width` queries only; screenshots by headless Chrome with `windowsHide: true`. Run through `avoid-ai-design`; copy through `prose`, `avoid-ai-writing` and `humanizer` with the Skill tool, each string listed in result.md.

Done-test: `node --test --test-reporter=tap "kc/tests/**/*.test.ts"`, then `npx tsc --noEmit && npx eslint kc`. `dashboard-mockup.test.ts` reads the mockup and asserts: only `min-width` media queries; no `max-width` query; no `letter-spacing` above 0.05em and no `text-transform: uppercase`; no `gradient`; no beige background (no hex in the f3efe7 family); no `<h1>` to `<h3>` text containing a comma; every skeleton block carries an `animation` and a `prefers-reduced-motion` rule that sets it to `none`; every link and button has `min-height: 44px`; no `<button>` pair with filled and outline classes in one parent; both PNGs exist and are 375 and 1280 wide. Mutation check: add `text-transform: uppercase` to a heading, then a `max-width` query, and name the failing tests.

### 34. Rob approves the mockup (waiting on Rob)
Role: waiting on a person. Risky path: no.
- `.claude/work/39-plan-dashboard/mockup/index.html`

Rob opens the mockup at 375 and 1280 and says yes or what to change. No build card (35 onward) runs before this. Done-test: `Select-String -Path .claude/work/39-plan-dashboard/approved.md -Pattern "approved"` finds a line the coordinator writes from Rob's reply.

### 35. Dashboard model: quick actions and visits summary
Role: `implementer`. Risky path: no (pure functions; imports only types from `kc/insights/series.ts`). Waits on 34 and card 28.
- `kc/dashboard.ts` (add `quickActions(config, ctx)`, keep `recentEdits`; `dashboardTiles` stays for the bottom link list)
- `kc/dashboard-visits.ts` (new: `weekSummary(days)` gives last 7 total, previous 7 total, change, sentence)
- `kc/tests/dashboard.test.ts`
- `kc/tests/dashboard-visits.test.ts` (new)
- `kc/client-view.ts` (add `siteUrl`)
- `kc/tests/client-view.test.ts`

Quick actions: one per `collection` node, `/collection/<name>/new`, groups flattened, order as the config. Files are not actions. The label comes from an optional `kc.actions.<name>` in `.pages.yml` (BeSciWorks: "New Weekly post", "New paper", "New Insight Brief"), else "Add to <label>"; once any `kc.actions` is set, only the labelled collections show (BeSciWorks leaves What Works out). A media node that accepts PDFs gives one more, "Upload a PDF", linking to the media upload.

Site URL: `kc.site` in `.pages.yml` (BeSciWorks: `https://besciworks.com`), read by a new `siteUrl(kc)` in `kc/client-view.ts` that returns the URL only for `https:` and null otherwise. The header renders "See live site" (new tab, `rel="noopener"`) only when it is set. `client-view.ts` currently documents one `kc` key; the comment changes with it.

Done-test: `node --test kc/tests/dashboard.test.ts kc/tests/dashboard-visits.test.ts kc/tests/client-view.test.ts`, then `npx tsc --noEmit && npx eslint kc`. Asserts: `siteUrl` keeps `https://besciworks.com` and returns null for `javascript:alert(1)`, `http://`, an empty string and a missing key; `kc.actions` labels win over "Add to"; with a BeSciWorks-shaped config: the three labelled actions plus Upload a PDF, in config order with encoded hrefs; none for `file` nodes; a config with no collection gives none; `weekSummary` on 14 known days gives exact totals and percent; previous week zero gives "new" not a divide error; all zeros gives "No visits yet this week"; 1 gives singular. Mutation check: drop the `collection` filter and the file-node test fails; swap the two weeks and the change test fails.

### 36. Search health model
Role: `implementer`. Risky path: no. Waits on 34.
- `kc/seo/site.ts` (new: `seoTargets(schemaFields)`, `entryHealth(values)`, `siteHealth(entries, limit)`)
- `kc/tests/seo-site.test.ts` (new)
- `kc/tests/fixtures/seo/` (entries shaped like BeSciWorks Weekly, a page file, a paper)

Reuses `runChecks` and the single checks from `kc/seo/rules.ts`. Counted checks: title, description, main heading, heading order, image text, and only when a body exists. Advice (not counted): opening answer, reading level. Entries without top-level `title` are skipped and counted as "not checked". Cap 200 entries. Returns `{checked, passing, notChecked, fix: [{title, path, name, firstProblem}]}` sorted by problem count, at most `limit`.

Done-test: `node --test kc/tests/seo-site.test.ts`, then `npx tsc --noEmit && npx eslint kc`. Asserts: a 55-character title with a 130-character description and clean body passes; a page file with title and description and no body is not failed for a missing body; a paper with no description is "not checked"; a high reading grade alone leaves the entry passing and appears in advice; a body with `# Heading` fails; 250 fixtures stop at 200; `fix` is capped by `limit` and ordered worst first. Mutation check: count the reading-grade check and the advice test fails; remove the no-body guard and the page-file test fails.

### 37. Version status
Role: `implementer`. Risky path: no (outbound GET to a public API, no token). Waits on 34.
- `kc/update/status.ts` (new: `versionStatus(running, releases)` returns `current`, `behind` with tag, or `unknown`)
- `kc/update/status-fetch.ts` (new: server fetch of `hunvreus/pagescms` releases, `revalidate` 3600, one warn line on failure, never throws)
- `kc/tests/version-status.test.ts` (new)
- `kc/tests/fixtures/releases/` (new)

Reuses `newerRelease` from `kc/update/upstream.ts`. Running version read from `package.json` in `process.cwd()`. Failure or unparseable gives `unknown`, never "current".

Done-test: `node --test kc/tests/version-status.test.ts`, then `npx tsc --noEmit && npx eslint kc`. Asserts from fixtures: equal version gives current; newer stable release gives behind with that tag; prerelease and draft ignored; a 403, a thrown fetch and bad JSON each give unknown and log one line with no URL query or header; a source test finds no network call in the test. Mutation check: treat a failed fetch as current and the failure tests fail.

### 38. Sparkline from the Insights chart
Role: `implementer`. Risky path: yes (`kc/insights/`). Waits on cards 29 and 30.
- `kc/insights/chart.tsx` (export `MetricChart` with a `compact` prop: 72px tall, no axes, no table, same lazy `import("uplot")`, same shimmer skeleton)
- `kc/tests/insights-chart.test.ts`

No second uPlot setup and no new dependency. The compact chart keeps the `role="img"` label from `summarySentence`.

Also the full dashboard chart's motion, matching the mockup: a 7/30/90 range toggle (buttons with `aria-pressed`) that calls `setData()` while the wrapper fades opacity; the draw-in as a one-off CSS `clip-path` reveal on the wrapper (500ms); the crosshair and tooltip from uPlot's own cursor with a `setCursor` hook moving a positioned tooltip (date and "N visits"). All three skip under `prefers-reduced-motion` (`motion-reduce:` classes and a `matchMedia` check before the fade).

Done-test: `node --test kc/tests/insights-chart.test.ts`, then `npx tsc --noEmit && npx eslint kc`. Source asserts: `MetricChart` is exported; `compact` branches height to 72; `import("uplot")` is still only inside the effect; `motion-reduce:animate-none` still beside the shimmer; the existing chart tests still pass. Mutation check: import uplot at the top of the file and the lazy-import test fails.

### 39. Server loaders and skeletons
Role: `implementer`. Risky path: yes (reads `loadSeries`, which uses the Google and Cloudflare tokens, and repo content). Waits on 35, 36, 37, 38.
- `kc/dashboard-server.tsx` (new: async `VisitsPanel`, `SearchHealthPanel`, `VersionLine`)
- `kc/dashboard-skeleton.tsx` (new: one skeleton per panel at its final height, shimmer, still under `prefers-reduced-motion`)
- `kc/tests/dashboard-server.test.ts` (new, source and unit)

`VisitsPanel` calls `loadSeries` with `defaultSeriesCache` and the site key from `insightsSourcesFor`, returns null when the site has no sources, and a short "not available right now" line when the series is null. `SearchHealthPanel` reads each collection through `getCollectionCache`, parses with `parse`, feeds `siteHealth`. `VersionLine` returns the full object for staff (no GitHub identity absent) and only `{state}` for clients, decided on the server. `PublishStatus` renders card 43's state: "Published <relative time>" with a check, "Publishing your change..." with a soft pulse, or "Your last change didn't publish. Your site still shows the version before it." with a help link; nothing when the site has no Pages project. Skeletons crossfade into the loaded panel once (opacity, 300ms); ring fill, staggered bar growth and the count-up on the headline numbers run once on mount, all CSS except the count-up island, all off under reduced motion.

Done-test: `node --test kc/tests/dashboard-server.test.ts`, then `npx tsc --noEmit && npx eslint kc`. Asserts: the visits panel is only built behind `getInsightsAccess`; the cache key is the site, not the user; a client's version props hold no `tag`, `url` or version string; a null series renders the fallback line, not a throw; each skeleton has `animate-pulse` and `motion-reduce:animate-none`; no token, account id or key file name appears in any prop. Mutation check: pass the full version object to clients and the client-props test fails; drop the access check and the gate test fails.

### 40. Dashboard layout and page wiring
Role: `implementer`. Risky path: yes (`app/(main)/.../page.tsx` is server code that now reads repo content). Waits on 39.
- `kc/dashboard.tsx` (new layout from the approved mockup; takes the three server panels as props; keeps the no-config and redirect branches)
- `app/(main)/[owner]/[repo]/[branch]/page.tsx` (upstream file; the smallest change: call `getRepoReadContext`, then render panels inside `Suspense` with their skeletons)
- `kc/tests/dashboard.test.ts`

Copy and mobile rules as the mockup. Quick actions are plain links in one list, not a button pair. The dashboard sits in the existing app shell; its grid uses container queries (Tailwind v4 `@container` with size variants) on the main panel, so the chart and the three tiles stack below about 900px of panel width, which is the 1024px viewport with the sidebar open.

Done-test: `node --test kc/tests/dashboard.test.ts`, then `npx tsc --noEmit && npx eslint kc`. Source asserts: `page.tsx` calls `getRepoReadContext` before any panel; each panel sits in `Suspense`; the file has no `max-width` query and no `uppercase`; `quickActions` renders before the visits panel; the old tile grid class is gone; recent edits still fetch `history?limit=`; no em dash in copy. Mutation check: move `getRepoReadContext` below the panels and the order test fails.

### 41. Security audit of the dashboard
Role: `security-auditor`. Risky path: yes.
- `kc/dashboard-server.tsx`
- `kc/insights/chart.tsx`
- `app/(main)/[owner]/[repo]/[branch]/page.tsx`
- `kc/seo/site.ts`
- `kc/update/status-fetch.ts`
- `kc/publish/status-fetch.ts`
- `kc/client-view.ts` (`siteUrl`)

Done-test: result names each finding by file and line, none high open; confirms a client session gets no version string, PR link or file path in the page payload, the series cache is keyed by site, the branch lock applies before the panels load, no token reaches a log line or a prop, the Cloudflare deployments call sends only the project name and returns only state and time to the page (no commit message, author email or deployment URL for clients), `kc.site` cannot inject a non-https `href`, and `node --test "kc/tests/**/*.test.ts"` is green.

### 42. Deploy and live check (waiting on Rob)
Role: waiting on Rob. Risky path: no (box step).
- `D:\Dev\htdocs\kc-cms\server\deploy.sh`

Done-test: signed in as the `+kctest` client at 375: the dashboard shows quick actions, a visits number matching the Insights page, search health, recent edits, and no version number or GitHub link; as Rob: the version line and PR link show. Skeletons show then resolve, no sideways scroll. "See live site" opens besciworks.com in a new tab; the publish line changes to publishing within a minute of a CMS save and back to published after the deploy; with reduced motion set in the OS, nothing on the dashboard moves. The page source of the client session holds no version string. Also confirms the Cloudflare and GA4 series from card 32 work, since the dashboard reuses them.

### 43. Publish status from Cloudflare Pages
Role: `implementer`. Risky path: yes (new outward call with a Cloudflare token). Waits on 34; card 39 waits on it.
- `kc/publish/status.ts` (new: `publishStatus(deployments, now)` returns `published` with time, `publishing`, `failed` with time, or `unknown`)
- `kc/publish/status-fetch.ts` (new: server fetch of `GET /accounts/{account}/pages/projects/{project}/deployments`, `revalidate` 30, one warn line on failure with no URL query or header, never throws)
- `kc/tests/publish-status.test.ts` (new)
- `kc/tests/fixtures/deployments/` (new)

The Pages project per site comes from config: `kc.pagesProject` in `.pages.yml` (BeSciWorks: `besciworks`), else no status line. Token and account id come from where the Cloudflare analytics token does (`kc/insights/cloudflare.ts`); it needs Pages read, which the analytics token may lack (flag 8). Only the latest production deployment counts; previews are ignored. A failed latest deployment after a good one gives `failed`, and the copy says the site still shows the version before it.

Done-test: `node --test kc/tests/publish-status.test.ts`, then `npx tsc --noEmit && npx eslint kc`. Asserts from fixtures: latest production `success` gives published with its time; `active` or `queued` gives publishing; `failure` gives failed; previews ignored; a 403, a thrown fetch and bad JSON each give unknown and log one line with no token; the client payload holds only state and time; no network call in the test. Mutation check: let a preview deployment count and the preview test fails; treat a failed fetch as published and the failure tests fail.

## Later (not this round)

### 44. Edit markers on the visits chart
Role: `implementer`. Risky path: yes (`kc/insights/`). Small dots on the chart's x axis on days with a published change, from the same history call as recent changes, with the tooltip naming the change ("David updated the Home page"). Lets a client see whether a post moved visits. Waits on 38 and 40.

### 45. PDF downloads per paper
Role: `implementer`. Risky path: yes (Cloudflare token). Download counts for each file under `public/papers/` from Cloudflare analytics (request paths ending `.pdf`), shown as a bar list "Most downloaded papers". Path-level counts likely need the site on its own zone after the DNS move; on `pages.dev` they may not be available (unverified).

### 46. Top Google searches from Search Console
Role: `implementer`. Risky path: yes (a new Google credential per site). The top queries that brought people to the site, from the Search Console API. **Flag:** this needs a per-site Search Console connection (the service account added as a user on each verified property), which no site has yet, and BeSciWorks cannot verify until besciworks.com is live. Plan the connection with Rob before the card.
