# 36 result

Files: `kc/otp-limit.ts` (new, from b87d389), `kc/tests/otp-limit.test.ts` (new), `lib/auth.ts` (imports plus `hooks.before`, same as b87d389).

Design: the IP counter goes first (10 per 10 min, IPv6 cut to /64). Then the tight limit, 5 per email+IP. Then the loose ceiling, 30 per email. Each refusal returns before the next counter, and a request with no email counts only its IP.

Tests (10): sixth request for an email+IP gets 429 with the count at 6; 11 synchronous calls give 10 allows; an IP spending its budgets does not block the victim email from a second IP; the 31st request across 31 IPs gets 429; a request refused by IP leaves the email counters alone; no-email requests count only the IP; IPv6 /64 shares a key; window reset; disabled paths give 404 and other paths are allowed; the wiring in `lib/auth.ts`.

Mutation: the tight limit keyed on email only. Three tests failed: the sixth-request test, the one-IP-cannot-block test and the 31-IP test. After the restore it is green again (241 pass).

tsc and eslint exit 0. The runner ran the whole kc glob even with the file argument, so each of the three runs was the full kc suite (241 tests).
