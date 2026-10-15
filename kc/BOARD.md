# Board

## Now

- **insights-labels**: GA4 returns `(not set)` (and sometimes `(other)` or an
  empty string) for towns, pages and channels it couldn't resolve. Seen live
  2026-10-14 as the second-biggest town. In `kc/insights/cards.ts`, show
  those as "Unknown" in the lists, and never let one be the "Most visitors
  come from ..." sentence: the sentence names the top real value, or says
  "Most visitors' towns aren't known yet." when there is none. Tests for
  each placeholder value in each card.


## Next

## Waiting on Rob

- B2 signup.

## Blocked

## Done

- **insights-gate**: committed on feat/09-insights-gate, gate green, audit found no attack.
- **title-hook**: committed on feat/07-title-hook, gate green, no audit (not a risky path).
- **update-banner**: committed on feat/06-update-banner, gate green, no audit (not a risky path).
- **client-view**: committed on feat/05-client-view, gate green, no audit (not a risky path).
- **branding**: committed on feat/03-branding, gate green, audit clean.
- **upstream-watch**: PR #5, merged. A manual run went green and opened no PR.
- **insights-core**: PR #1, merged.
- **uptime**: PR #3, merged, and `KC_UPTIME_ENABLED` is `true`.
