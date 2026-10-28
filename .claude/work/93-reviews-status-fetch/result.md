# 93 reviews-status fetch: result

Built:
- `kc/reviews/status.ts`: `validateReviewsStatus` (exactly source/rating/count/asOf/error?, ISO asOf not in the future) and `reviewsLine` (key `reviews-typed|hidden|live`, `stale` only for typed older than `STALE_MONTHS` = 6, injected now).
- `kc/reviews/status-fetch.ts`: `reviewsUrl` (https only, no port, refuses IP literals incl. numeric forms like `0x7f.1`, localhost, single-label, `.local`, `.internal`; reduces to origin + `/reviews-status.json`) and `fetchReviewsStatus` (injected fetch, `AbortSignal.timeout`, `redirect: "error"`, `MAX_BYTES` 16 KB cap on declared and streamed length, `createCache` keyed by origin URL, failure thrown inside load so not cached, one fixed `WARN_LINE`, never throws).

Tests: `kc/tests/reviews-status.test.ts`, 8 tests, one per done-test bullet.

Mutation (via runner; it ran the full suite each time, 561 tests):
- Origin reduction (href instead of origin): failed "the URL is the origin..." and "a second call inside the TTL...".
- Cap (streamed check at 4x): failed "a body over the cap is refused...".
- Stale boundary (`<` to `<=`): failed "each source maps to its key...".
Restored, green 561/561.

Calls: non-default ports refused too (not asked, cheap SSRF narrowing).

For the audit: DNS rebinding / a public name resolving to a private IP is not closed.

## Gate fix
TS2551 in kc/tests/reviews-status.test.ts lines 122-123: added assert.ok(x.state === "known") narrowing before reading .stale; assertions unchanged. tsc --noEmit and eslint kc exit 0; card test green through runner.
