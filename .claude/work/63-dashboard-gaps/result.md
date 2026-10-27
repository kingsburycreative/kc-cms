# 63 result

Files: kc/dashboard.ts, dashboard.tsx, dashboard-server.tsx, dashboard-visits.ts, insights/chart.tsx, and tests dashboard, dashboard-server, dashboard-visits, insights-chart, dashboard-sections. authz-shared.ts untouched (only mutated, restored).

Strings added: "This period", "Period before", "Open Insights", "Last N days. X the N days before.", `David added "Spring update" in Weekly`, "Kingsbury Creative", "Someone" (email authors). Not run through the prose skills.

Tests added: visitsSummary (2), activity names and email (2), page names, staff gate fixtures, insights-chart panel (3), TopLists and Insights link (2). Full suite 436 pass; tsc and eslint clean.

Staff strip cause: NOT reproduced. `hasGithubIdentity` reads `githubUsername`, which a GitHub session user holds, and the server gate in page.tsx is sound. The only extra failure point was a second client-side gate, `staff && staffStrip` in dashboard.tsx, reading the user from context. I removed it; the server already returns nothing for clients. Unverified live.

Not done: collection entry titles in top-page names (file-type labels only); Insights page Top pages does not share Bars, left alone.

Mutation: (1) email back in the client sentence: "activity names the author by display name, never an email" failed. (2) label lookup dropped: "recent edits keep title...", "recent activity gives initials...", "activity names the author...", "activity names the thing by its schema label..." failed. (3) gate always false: "the staff gate holds for a GitHub session user..." failed. Restored, green.
