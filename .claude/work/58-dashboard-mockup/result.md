# 58 result

Files changed: kc/dashboard.tsx, kc/dashboard-server.tsx, kc/dashboard-skeleton.tsx, kc/dashboard.ts, kc/dashboard-visits.ts, kc/insights/chart.tsx, kc/insights/map.ts, kc/insights/route.ts, kc/client-view.ts (comment only), kc/publish/status.ts, kc/publish/status-fetch.ts (mutation only, restored), app/(main)/[owner]/[repo]/[branch]/page.tsx. No new component files.

Tests: new kc/tests/dashboard-sections.test.ts (the section guard). Extended dashboard, dashboard-server, dashboard-visits, publish-status, insights-chart and insights-route tests. Some existing assertions were changed to the new shape: the visits gate, the lowercase seriesSiteKey, LiveSiteLink and the skeleton slice. Done-test green (415 pass). tsc and eslint exit 0.

Mutations, each restored and the run green again:
1. Deleted the "Most viewed pages" h2. Failed: the dashboard draws the "Most viewed pages" heading.
2. SearchHealthPanel returned null on an empty check. Failed: no panel returns null before its heading, except the three allowed.
3. Staff strip passed to everyone (`true ?` in page.tsx). Failed: a client's payload never holds the staff strip.
4. A failed fetch returned published. Failed: three "gives unknown and one clean warn line" tests, plus "a failed fetch never reads as published".

Calls I made:
- The publish token is `KC_CF_PAGES_TOKEN`, falling back to `CLOUDFLARE_ANALYTICS_TOKEN`.
- `pages` in the map only counts on an entry that also has ga or cf.
- Client history feeds carry no commit message, so a client's changes read as "changed".
- The insights page still keys the series cache with mixed case. That file is not mine to touch.
- Items under "Fix these next" are plain text, not edit links.

Copy went through prose, avoid-ai-writing, humanizer and avoid-ai-design (no design findings). Strings: "Published N ago", "Publishing your change...", "Your last change didn't publish. Your site still shows the version before it.", "Visit numbers aren't available right now.", "Not available", "None the 30 days before", "Last 30 days against the 30 before.", "No page views to show yet.", "No towns to show yet.", "No pages to check yet.", "Some pages need a fix for Google.", "Every checked page passes.", "N pages pass", "Fix these next", "X updated/added an entry in Y", "See all changes", "See live site", "Your CMS is up to date.", "Recent changes couldn't load.", "Not set up".

Not done: live render and screenshots.
