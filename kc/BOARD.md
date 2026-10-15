# Board

## Now

Two fixes left from the 2026-10-15 security audit, in this order. Both
are risky paths (`app/api/`, `lib/auth.ts`): top model tier and a
`security-auditor` pass on each.

- **otp-ip-key**: the sign-in code rate limit is keyed on the first
  `X-Forwarded-For` value, which the caller sets, so anyone can send login
  codes to any address without limit. nginx already sets
  `X-Real-IP $remote_addr` (`D:\Dev\htdocs\kc-cms\server\deploy.sh:142`).
  Make better-auth read only `x-real-ip` for the client IP. Find the exact
  option name in `node_modules/better-auth` (1.5.6) source, do not guess it
  (likely `advanced.ipAddress.ipAddressHeaders`). Keep the value in a `kc/`
  constant that `lib/auth.ts` imports. Also confirm from the same source
  that the rate limiter is on in production with no extra setting, and say
  so in the commit. Tests: the constant is exactly `["x-real-ip"]`, and
  `lib/auth.ts` passes it.
- **media-types**: an upload is accepted with any extension when the media
  config sets no `extensions` (`.../files/[path]/route.ts:177-182`), so a
  client can commit `.svg`, `.html` or `.js` into the site's `public/`.
  Fix: when `extensions` is missing, allow only `jpg`, `jpeg`, `png`,
  `webp`, `avif`, `gif`, `pdf`, case-insensitive, from a `kc/` constant. A
  config that sets `extensions` keeps working as it does. Tests: each
  allowed type passes, `svg`, `html`, `js` and a double extension like
  `photo.jpg.html` are refused, and a config with its own list is honoured.

## Next

- **run-claim**: from the settings-gate audit, older than that card. A run
  row whose dispatch threw or whose 9-second lookup missed keeps a null
  `workflowRunId` (`actions/route.ts` around 412, 430, 472); a later GET
  attaches the newest unclaimed run on that workflow and ref, checking only
  a lower time bound (`actions/route.ts` around 72, `actions/[runId]/route.ts`
  around 67). A client holding such a row can claim Rob's run, and then cancel
  it as their "own" run without the push check. Fix: attach only runs created
  within a short window after the row's `createdAt`, and expire rows whose run
  id is still null. Risky path (`app/api/`): top tier and an audit.

## Waiting on Rob

- **config-exposure** (from the settings-gate audit, upstream design): any
  client who opens the repo gets the whole parsed `.pages.yml` in the page
  data (`app/(main)/[owner]/[repo]/[branch]/layout.tsx` 46-58 and 101 into
  the client `ConfigProvider`). The settings gate stops changing it, not
  reading it. Is that acceptable, or should clients get a trimmed config?

## Blocked

## Done

- **settings-gate**: committed on feat/11-settings-gate, gate green, audit found no way past the gate; two older findings queued (run-claim, config-exposure).
- **insights-labels**: PR #18, merged.
- **insights-gate**: committed on feat/09-insights-gate, gate green, audit found no attack.
- **title-hook**: committed on feat/07-title-hook, gate green, no audit (not a risky path).
- **update-banner**: committed on feat/06-update-banner, gate green, no audit (not a risky path).
- **client-view**: committed on feat/05-client-view, gate green, no audit (not a risky path).
- **branding**: committed on feat/03-branding, gate green, audit clean.
- **upstream-watch**: PR #5, merged. A manual run went green and opened no PR.
- **insights-core**: PR #1, merged.
- **uptime**: PR #3, merged, and `KC_UPTIME_ENABLED` is `true`.
