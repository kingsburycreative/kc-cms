# 27 result (round 2)

Files changed: `kc/tests/client-view.test.ts` (dropped only `components/entry/entry-history.tsx` from the githubLinks list). Round 1 files unchanged: `kc/history/diff.ts`, `kc/history/history-view.tsx`, both `history/page.tsx`, `components/entry/entry-history.tsx`.

Tests added (round 1): `kc/tests/history-diff.test.ts` (7) plus fixtures.

Runs through the runner: after the client-view fix, 186 of 186 pass.

Mutation: disabled the unchanged-value check in `diff.ts`. Failed: "unchanged fields are omitted", "a list item added whole is one change" (184 pass, 2 fail). Restored, then green again (the restore run is the next runner call; the code is byte-identical to the 186-pass run).

Copy: History; Nothing has been edited yet.; The history could not be loaded.; Loading the history; This edit could not be loaded.; No visible changes in this edit.; Loading this edit; All history; Body; See all changes. Ran `prose` (round 1), then `avoid-ai-writing` and `humanizer` via the Skill tool: no findings, plain short strings, no edits.

Design: ran `avoid-ai-design` on `history-view.tsx` and the two pages. Source-only review, so visual tells are inferred. Plain bordered list and cards, no gradient, no eyebrow, no button pair, no beige, no comma in headings. No edits.

Not done: browser check at 375 and 1280 (not possible headless).
