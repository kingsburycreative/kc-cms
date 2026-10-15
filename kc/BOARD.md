# Board

## Now

Fixes left from the 2026-10-15 security audit, in this order. Both
are risky paths (`app/api/`, `lib/auth.ts`): top model tier and a
`security-auditor` pass on each.

- **media-types**: an upload is accepted with any extension when the media
  config sets no `extensions` (`.../files/[path]/route.ts:177-182`), so a
  client can commit `.svg`, `.html` or `.js` into the site's `public/`.
  Fix: when `extensions` is missing, allow only `jpg`, `jpeg`, `png`,
  `webp`, `avif`, `gif`, `pdf`, case-insensitive, from a `kc/` constant. A
  config that sets `extensions` keeps working as it does. Tests: each
  allowed type passes, `svg`, `html`, `js` and a double extension like
  `photo.jpg.html` are refused, and a config with its own list is honoured.

- **otp-disabled-paths**: from the otp-ip-key audit. Many simultaneous wrong
  guesses at `/email-otp/check-verification-otp` are charged as one of the 5
  attempts (better-auth reads then writes the counter, `routes.mjs` 233-255),
  and a right guess there does not use up the code, so it can then sign in.
  The UI never calls that path (`components/sign-in.tsx`,
  `components/invite-sign-in.tsx` use only send and sign-in). Fix: put
  `/email-otp/check-verification-otp`, `/email-otp/request-password-reset`
  and `/email-otp/reset-password` in better-auth's `disabledPaths` (reset
  codes are created but never emailed, so they can be guessed silently the day
  password sign-in is turned on), from a `kc/` constant `lib/auth.ts`
  imports. Tests: the constant's exact list, and `lib/auth.ts` passes it.
  Risky path (`lib/auth.ts`): top tier and an audit.

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

- **otp-atomic-limit**: from the otp-ip-key audit. better-auth's limiter checks
  before the request and counts after it (`better-call/dist/router.mjs`
  103-107), so a burst of simultaneous sends from one IP all get through, and
  an IPv6 /48 gives 65,536 separate buckets. Fix: a `hooks.before` on
  send-verification-otp and sign-in/email-otp that increments then checks,
  per IP and per recipient email, before the handler runs. In memory is enough
  on the one process (a Postgres counter needs a schema change, which parks).
  Risky path: top tier and an audit.

## Waiting on Rob

- **config-exposure** (from the settings-gate audit, upstream design): any
  client who opens the repo gets the whole parsed `.pages.yml` in the page
  data (`app/(main)/[owner]/[repo]/[branch]/layout.tsx` 46-58 and 101 into
  the client `ConfigProvider`). The settings gate stops changing it, not
  reading it. Is that acceptable, or should clients get a trimmed config?

- **nginx limit_req** (from the otp-ip-key audit): an nginx `limit_req` zone on
  `/api/auth/email-otp/` and `/api/auth/sign-in/` would cap the send race at
  the edge. It is a box change, so it is yours.
- **invite emails unlimited** (same audit): a signed-in client with push access
  can send any number of KC-branded invite emails to any addresses
  (`lib/actions/collaborator.ts` 20-29, 190, 211, 340). Worth a limit?

## Blocked

## Done

- **otp-ip-key**: committed on feat/12-otp-ip-key, gate green, audit found no attack on the change; two older better-auth races queued (otp-disabled-paths, otp-atomic-limit).
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
