# 96. Reviews fetch: resolve and pin the host before connecting (Risky)

Project: D:\Dev\htdocs\kc-cms-app. Read `.claude/project.md` first (Never list, test rules: relative imports with `.ts`, no `@/`, no real network in tests).

## Task
Close audit finding F1 and observation O1 from `.claude/work/95-reviews-status-audit/result.md`. `kc/reviews/status-fetch.ts` checks the kc.site host by name only, so `https://10.0.0.5.nip.io` makes the server connect to an internal address.

Replace the default fetch path with node:https using a `lookup` hook: resolve the host (all addresses), reject the request if any resolved address falls in an IANA special-purpose range (v4 and v6: loopback, private, link-local, CGNAT, unspecified, multicast, broadcast, documentation, benchmarking, reserved, ULA, v4-mapped/translated/6to4/Teredo forms of a blocked v4, etc.) built with `net.BlockList`, and hand the socket the exact address it checked, so no second lookup can swap it. TLS still verifies against the hostname (servername). Keep: no redirects (a 3xx is a failure), 5 s total timeout via AbortSignal, the 16 KB streamed cap, the cache, WARN_LINE behaviour, never throws. Keep `reviewsUrl` name checks as the first filter. Keep the `fetchImpl` injection working for existing tests; expose the address check (e.g. `isBlockedAddress(addr)`) and the lookup hook (with an injectable resolver) so they can be tested without network. Update the file's header comment (the "DNS rebinding is not closed here" line).

## Files you may touch
- `kc/reviews/status-fetch.ts`
- `kc/reviews/safe-lookup.ts` (new, if you split the guard out)
- `kc/tests/reviews-status.test.ts`
- `kc/tests/reviews-ssrf.test.ts` (new)
- `.claude/work/96-reviews-ssrf-resolve/result.md`
- `.claude/work/96-reviews-ssrf-resolve/progress.md`

No new dependencies. Do not edit `kc/insights/`.

## Done-test
`node --test kc/tests/reviews-ssrf.test.ts kc/tests/reviews-status.test.ts` passes, asserting:
- the lookup hook refuses a name resolving to each of: 10.x, 172.16.x, 192.168.x, 127.x, 169.254.x, 100.64.x, 0.0.0.0, ::1, fe80::, fc00::, ::ffff:10.0.0.5, and a mix where one of several addresses is private;
- a name resolving to a public address (e.g. 93.184.216.34, 2606:2800::1) passes and the hook returns exactly that address;
- a hanging fetchImpl aborts and gives `unknown` plus WARN_LINE within the timeout (use a short injectable timeout or mock timers; do not wait 5 s real time if avoidable);
- all existing reviews-status tests still pass.
Then the mutation check through the runner `node C:\Users\roban\.claude\bin\project-test.cjs`: remove the private-range check, then break address pinning (return a different address), one at a time; run, record which tests failed, restore, run green.

## Rules
- Fixtures and injected resolvers only; no real DNS or network.
- Keep `progress.md` beside this brief, updated after each step.
- Do not commit. Write `result.md`: what changed, tests added, mutation results.
