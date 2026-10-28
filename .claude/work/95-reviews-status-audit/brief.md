# 95. reviews-status feature security audit (Risky)

Plan: `.claude/work/93-plan-reviews-status/plan.md` card 03. Read-only audit by a security-auditor on Opus.

## Files you may touch
- `.claude/work/95-reviews-status-audit/result.md`
- `.claude/work/95-reviews-status-audit/progress.md`
- `kc/BOARD.md` (coordinator: card moved to Done, follow-up reviews-ssrf-resolve filed in Next)

Read-only: `kc/reviews/`, `kc/dashboard-server.tsx`, `kc/dashboard.tsx`, `kc/tests/reviews-status*.test.ts`.

## Done-test
result.md states a verdict on each of: SSRF host guard (including DNS rebinding, left open by card 93), redirects, size cap, timeout, the cache key, and any URL or response text leaking into logs or the page (React-escaped, no `dangerouslySetInnerHTML`). Each finding names the test that covers it, or says none does. `node --test "kc/tests/**/*.test.ts"` green (run by the loop).
