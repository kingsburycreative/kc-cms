# 96 result

Files: `kc/reviews/safe-lookup.ts` (new), `kc/reviews/status-fetch.ts`, `kc/tests/reviews-ssrf.test.ts` (new). `reviews-status.test.ts` untouched; all its tests pass.

- `safe-lookup.ts`: `isBlockedAddress` (net.BlockList v4 and v6 special-purpose ranges, plus v4-mapped, v4-translated, v4-compatible, NAT64, 6to4 embedded v4; Teredo inside blocked 2001::/23; unparseable is blocked). `createSafeLookup(resolver)` resolves all addresses, refuses if any is blocked or none, returns the first checked address (handles `all: true`).
- `status-fetch.ts`: default fetch is now `httpsFetch` (node:https, pinned lookup, `agent: false`, servername from URL so TLS verifies the name, 3xx not ok). Timeout injectable (`timeoutMs`), and the load races the abort so a fetch that ignores the signal still ends. Header comment updated.

Tests added (6): each private range refused, mixed list refused, public v4/v6 returns exact address, empty/failed resolution refused, embedded/reserved forms, hanging fetch gives unknown + WARN_LINE at 30 ms.

Mutation (runner ran the full suite each time, 573 tests):
- private check removed: failed "refuses a name resolving to any special-purpose address" and "one private address among several".
- pinning returns last address: failed "returns exactly the checked address".
Restored, green 573/573.

Not done: no test drives `httpsFetch` itself (would need real DNS/network).
