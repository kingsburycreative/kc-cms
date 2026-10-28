# 95. reviews-status audit

Security-auditor (Opus), read-only, 2026-10-28. Full report was returned in-session; summary of verdicts and findings below.

## Verdicts
- SSRF host guard: finding F1. IP literals in every form (decimal, octal, hex, short, IPv6, mapped v4) are refused (kc/reviews/status-fetch.ts:37,40). Host names are checked by name only, never by resolved address, so DNS rebinding and static records to private addresses get through.
- Redirects: sound, `redirect: "error"` (:84). Test reviews-status.test.ts:61-66 (checks the option only).
- Size cap: sound, declared length and streamed bytes after decompression (:45-58). Test :68-78.
- Timeout: sound, AbortSignal.timeout(5000) (:83). Test :64 checks only the type (O1).
- Cache key: sound, origin plus fixed path, own 500-entry cache. Test :103-115.
- Logs: sound, one fixed WARN_LINE, error dropped (:93-95). Test :93-101.
- Page: sound, text only from REVIEWS_COPY constants, no dangerouslySetInnerHTML. Test reviews-status-line.test.ts:53-57.

## Findings
- F1 (Low): kc.site like `https://10.0.0.5.nip.io` makes the server connect to an internal address on 443 (port scan by timing). Only client-chosen-host fetch in kc/. Fix: node:https with a `lookup` hook that rejects IANA special-purpose ranges via net.BlockList and connects to the checked address. Test: none. Follow-up card reviews-ssrf-resolve on the board.

## Observations
- O1: timeout tested for type only; add a hanging-fetch test.
- O2: remote `error` text is cached, never rendered; close F1 before any card renders it.
- O3: failures not cached, concurrent loads not merged.
- O4: not-ok and too-large paths do not cancel the body; bounded by the 5 s abort.
- O5: trailing dot gives a second cache key; harmless.

Not verified: the box's resolver, /etc/hosts, internal 443 listeners, and whether any GitHub account can sign in.
No copy written. Suite run by the loop.
