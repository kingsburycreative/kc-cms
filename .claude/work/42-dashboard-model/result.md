# 42 result

Changed: `kc/dashboard.ts` (`quickActions`), `kc/dashboard-visits.ts` (new, `weekSummary`), `kc/client-view.ts` (`siteUrl`; `KcSchema` now also takes `site` and `actions`, comment updated), tests in `dashboard.test.ts`, `dashboard-visits.test.ts` (new), `client-view.test.ts`.

Tests added: quick actions (labels, order, encoded hrefs, Add to fallback, file nodes, no collection, images-only media), weekSummary (totals, up, down, same, new, zeros, singular), siteUrl and schema.

Done-test: the runner runs the whole suite whatever the args; 294 pass. `tsc --noEmit` and `eslint kc` print nothing.

Mutation: dropping the collection filter failed "quick actions fall back to Add to <label>" and "quick actions skip file nodes and need a collection". Swapping the weeks failed "14 known days give exact totals...", "a drop reads as down", "a zero previous week is new". Restored, 294 green.

Call: a media node with no `extensions` or `categories` counts as accepting PDFs. `KcSchema` is strict, so I had to add `site` and `actions` to it.

Copy (prose, avoid-ai-writing, humanizer all ran; no edits needed): "Add to <label>", "Upload a PDF", "N visits in the last 7 days, up/down X% on the week before.", "the same as the week before", "N visits in the last 7 days. None the week before.", "No visits yet this week". The "new" badge is the `change: "new"` value; the UI card renders the word.

Not done: no UI, no page wiring.
