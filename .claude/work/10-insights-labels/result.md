# 10. Insights placeholder labels: result

Files changed: `kc/insights/cards.ts`, `kc/tests/insights.test.ts`.

`listCard` gained an `isPlaceholder` check (missing value, empty/whitespace, `(not set)`, `(other)`). Placeholder rows stay in place as "Unknown" with counts unchanged; the sentence uses the first real value, or the card's "aren't known yet" sentence when none exists. An empty response keeps its old sentence. The real label is passed through unchanged, so route.ts's 80-character trim still applies.

Tests added: 24, for each of pages/cities/channels times `(not set)`, `(other)`, `""`, `"  "`: placeholder on top (Unknown in items, sentence names the next real value), and all-placeholder (including a row with no dimension value).

Full suite: 85 pass, 0 fail. `npx tsc --noEmit && npx eslint kc` exit 0.

Mutation: removed the `(other)` check. 6 failed: "pages/cities/channels card shows "(other)" as Unknown..." and "pages/cities/channels card with only "(other)" says it is not known yet". Restored, 85 green.

Not done: nothing outstanding.
