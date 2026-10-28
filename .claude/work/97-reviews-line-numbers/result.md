# 97 result

Built: `reviewsLine` (kc/reviews/status.ts) now also returns `rating`, `count`, `asOf` (never `error`). `reviewsText` (kc/dashboard-server.tsx, inside the copy block) renders the typed line with them; hidden, live, stale nudge unchanged.

Copy (prose, avoid-ai-writing, humanizer all run via Skill; no changes needed):
- Typed: "{rating} stars from {count} reviews, typed in by hand on {Mon D}[, YYYY]." ("1 star", "1 review" singular; 4.8 / 5 plain; year only when not the current year, UTC.)
- Fallback typed (no usable figures): "The review rating on your site was typed in by hand." (unchanged)

Tests added (reviews-status-line.test.ts): typed stars/count/date; plain rating and singular; error never shown; hidden/live unchanged and stale nudge on typed. Adjusted two existing assertions: the typed case in "each source key maps" (skipped, covered by new tests) and the deepEqual shape in reviews-status.test.ts.

Mutation: count +1 broke "typed status gives..." , "rating is plain...", "hidden and live..." ; plural rule (===1 to ===0) broke "rating is plain, and one review is singular". Restored, green (577 pass; runner ran whole suite).

Note: the year rule uses the real clock, not the test's `now`.
