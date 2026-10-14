# Board

## Now

- **insights-route**: the Insights screen, built on `kc/insights/`
  (token, reports, cards from PR #1). A GA4 property now exists to test
  against: Kingsbury Creative's own, `532281228`, already readable by the
  service account KC uses (`analytics.readonly`).
  - **Where the property ID lives** (decided 2026-10-14, no schema change):
    a server-side JSON file mapping `"owner/repo"` to a numeric property ID,
    at the path in env `KC_INSIGHTS_MAP` (on the box
    `/srv/kc-cms/shared/insights.json`, root:kccms 640, written by Rob or an
    ops script, never by the app). Not `.pages.yml`: anyone who can commit to
    a site could point it at another client's property, and the one service
    account reads them all. A malformed file or a non-numeric ID means "not
    set up", never a crash.
  - The key file is at the path in env `KC_GA4_KEY_FILE`. Read it on the
    server only; never send any part of it to the browser or a log.
  - Route `app/(main)/[owner]/[repo]/[branch]/insights/page.tsx`, a server
    component. Before anything else it runs the same repo-access check the
    other repo pages and `app/api/[owner]/[repo]/...` routes use (find it and
    reuse it, do not write a new one), then looks the property up by
    `owner/repo` from the URL **after** that check passes. No property ID is
    ever read from the request.
  - Cards: visitors (last 28 days versus the 28 before), top towns, top
    pages, how people found the site, average time on site, using the
    builders in `kc/insights/reports.ts` and `cards.ts`. Every value renders
    as plain text in JSX, never `dangerouslySetInnerHTML` or markdown;
    `pagePath` is cut to 80 characters before it goes into a sentence.
  - Reports are cached in memory per property for one hour; one failed
    Google call shows "Insights couldn't load right now" and logs one line
    with the status code only.
  - Sidebar (`components/repo/repo-sidebar.tsx`): an "Insights" item for
    everyone who can open the repo, clients included, shown only when the map
    has that repo. Server tells the client a boolean, never the ID.
  - Tests in `kc/tests/insights-route.test.ts`, fixtures only: map parsing
    (good, malformed, non-numeric, missing file), lookup by owner/repo, the
    cache's one-hour expiry with an injected clock, pagePath trimming, and the
    error path. Risky path: security-auditor pass.

## Next

## Waiting on Rob

- B2 signup.

## Blocked

## Done

- **title-hook**: committed on feat/07-title-hook, gate green, no audit (not a risky path).
- **update-banner**: committed on feat/06-update-banner, gate green, no audit (not a risky path).
- **client-view**: committed on feat/05-client-view, gate green, no audit (not a risky path).
- **branding**: committed on feat/03-branding, gate green, audit clean.
- **upstream-watch**: PR #5, merged. A manual run went green and opened no PR.
- **insights-core**: PR #1, merged.
- **uptime**: PR #3, merged, and `KC_UPTIME_ENABLED` is `true`.
