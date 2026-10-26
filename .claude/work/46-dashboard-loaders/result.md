Files: `kc/dashboard-server.tsx` (VisitsPanel, SearchHealthPanel, VersionLine, plus the pure helpers versionFor, versionText, visitsView, seriesSiteKey), `kc/dashboard-skeleton.tsx` (VisitsSkeleton, SearchHealthSkeleton, VersionSkeleton), `kc/tests/dashboard-server.test.ts` (9 tests).

Tests: green (325/325; the runner ran the whole glob). tsc and eslint both exit 0.

Mutation: when I gave clients the full version object, "a client's version props hold no tag, url or version string" failed. When I removed the getInsightsAccess check, "the visits panel is only built behind getInsightsAccess" failed. Restored, then green.

Calls: each panel takes only owner/repo/branch (VersionLine takes user) and calls getRepoReadContext itself, so no token is ever passed as a prop. Staff means hasGithubIdentity(user). The runner can't load "@/" imports or JSX, so versionFor and versionText are cut out of the source and run through stripTypeScriptTypes. Everything else is checked against the source text.

Copy (prose, avoid-ai-writing and humanizer all left these unchanged): "Visit numbers aren't available right now." / "Visits" / "Search health" / "{passing} of {checked} pages pass the search checks" / "Fix these next" / "The CMS is up to date." / "Pages CMS {tag} is out." / "A CMS update is available." / "Couldn't check the CMS version." / "Loading visits" / "Loading search health" / "Loading CMS version". avoid-ai-design found nothing to change.

Not done: the count-up island, ring fill and bar growth. They need a client file or global CSS that this card doesn't list, so they belong with card 40. PublishStatus is out of scope.
