# Plan: reviews-status

Board entry: `kc/BOARD.md`, Now, first item. Two cards. Card 01 is the fetcher and the pure model, card 02 draws the line.

## What I found

- A site's live origin is `kc.site` in `.pages.yml`, read through `siteUrl(object.kc)` in `kc/client-view.ts`. It keeps https URLs only and returns the string as written, path included. `kc/dashboard.tsx` line 67 already calls it. The fetcher must reduce it to `new URL(site).origin` and append the fixed path `/reviews-status.json`.
- Insights caching is `createCache` in `kc/insights/route.ts`: a one-hour TTL, 500 entries, oldest dropped first, and a failure is not cached. Import it and do not edit that file. It lives on a risky path, so editing it would pull in the security-auditor tier.
- The server-fetch pattern is `kc/publish/status-fetch.ts`: an injected `fetchImpl`, one fixed warn line with no URL, and it never throws. Copy the shape.
- `dashboard-server.tsx` is where `fetchPublishStatus` is called (about line 286), so the new fetch is wired next to it.

## Flags

1. The board calls this "configured origin only", but `kc.site` is written by the client, who can edit `.pages.yml`. It is a server-side fetch of a client-chosen URL, so there is an SSRF risk. Card 01 must refuse IP literals, `localhost`, single-label hosts and `.local` or `.internal` names. It must also refuse redirects (`redirect: "error"`) and require https. DNS rebinding is not fully closed by this. The security-auditor card decides whether that residual risk is acceptable.
2. Key the cache by origin, not by repo. Two repos pointing at one origin then share an entry, and an unrelated repo cannot read another's cached result.
3. Henike's file is `source: typed|hidden`, and `live` is reserved. The validator accepts all three. The line must never claim "live" more strongly than the file does.
4. `asOf` must be a valid ISO date and not in the future. Otherwise the stale check can be bypassed.

## Cards

### 01. Reviews-status fetcher and pure model
- Role: implementer (Opus, effort high)
- Size: Risky. It does a server-side fetch of a client-configured URL.
- Risky path: no listed path, but it counts as Risky by this feature's own rule. The final audit covers it.
- Files:
  - `kc/reviews/status.ts`
  - `kc/reviews/status-fetch.ts`
  - `kc/tests/reviews-status.test.ts`
- Done-test: `node --test kc/tests/reviews-status.test.ts` passes. It uses fixtures and an injected fetch, with no network. It asserts:
  - The URL fetched is exactly `<origin>/reviews-status.json`, even when `kc.site` has a path, query or credentials.
  - http, IP literal, localhost and single-label hosts make no fetch call.
  - The call is made with an `AbortSignal` and `redirect: "error"`.
  - A body over the cap (the cap is a named constant) is rejected, both when the declared length is over and when the streamed bytes are over.
  - The validator accepts exactly `{source, rating, count, asOf, error?}`. It rejects an extra key, a rating outside 0 to 5, a negative or non-integer count, a bad or future `asOf`, and an unknown `source`.
  - Every failure returns `unknown` with one fixed warn line that contains no URL.
  - A second call inside the TTL does not refetch, and a failure is not cached.
  - The pure function maps each of typed, hidden and live to a source-line key. It sets `stale` only for typed with `asOf` older than 6 months, using an injected `now`, with the boundary tested on both sides.
  - Mutation check: break the origin reduction, the cap and the stale boundary on purpose, and name which tests failed.

### 02. Dashboard line
- Role: implementer (Sonnet)
- Size: Normal. It touches upstream-adjacent dashboard files.
- Risky path: no.
- Files:
  - `kc/dashboard-server.tsx`
  - `kc/dashboard.tsx`
  - `kc/tests/reviews-status-line.test.ts`
- Done-test: `node --test kc/tests/reviews-status-line.test.ts` passes. It asserts that:
  - With no `kc.site`, or an `unknown` status, nothing is drawn and the page still renders.
  - A source-line key from card 01 maps to its copy string.
  - The stale nudge shows only when `stale` is true.
  - The line sits inside the dashboard-sections count of pieces that may draw nothing, and `kc/tests/dashboard-sections.test.ts` and `kc/tests/dashboard.test.ts` still pass.
  - It reads in a 375px column with no JS.
  
  Copy is written with the `prose` skill, then `avoid-ai-writing`, `humanizer` and `avoid-ai-design`, and `result.md` lists each string. The dashboard files are not upstream files, but this is the smallest hook if either is.

### 03. Security audit of the whole feature
- Role: security-auditor (Opus)
- Risky path: covers card 01's server-side fetch.
- Files: read-only on `kc/reviews/`, `kc/dashboard-server.tsx` and `kc/tests/reviews-status.test.ts`.
- Done-test: the audit report states a verdict on each of: SSRF host guard, redirects, size cap, timeout, the cache key, and any URL or response text leaking into logs or the page (React-escaped, no `dangerouslySetInnerHTML`). It lists any finding against a test that covers it. `node --test "kc/tests/**/*.test.ts"` is green.

Nothing here waits on a person.
