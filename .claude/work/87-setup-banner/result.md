# 87 result

Changed: kc/panel-state.ts (dropped TILE_NOT_SET_UP), kc/not-set-up.ts (added LIVE_SITE_NOT_SET_UP), kc/dashboard.tsx (header slot uses it), kc/dashboard-server.tsx (VisitsPanel returns one banner when not set up, no tiles; Tile lost its not-set-up branch). Tests: dashboard-server.test.ts (new banner test, tile test updated), dashboard.test.ts, not-set-up.test.ts.

Copy (prose, avoid-ai-writing, humanizer and avoid-ai-design all ran; no changes needed):
- Banner: "Visit numbers will show here once analytics is connected." (kept)
- Staff link: "Add the analytics IDs" (kept, staff only, once)
- Header slot: "Live site not set up yet" (new)

Design: banner is the existing bordered panel, muted text, wraps at 375px, full width since there are no tiles beside it. Could-not-load state is unchanged.

Mutation: rendered StatTiles inside the banner branch; "not set up renders one banner with the staff link once, and returns before the tiles" failed. Restored, green.

Done-test: the runner ran the whole suite each time (533 pass, 0 fail). tsc and eslint printed nothing (clean).
