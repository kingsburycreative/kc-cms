# Board

## Now

Three fixes from the 2026-10-15 security audit, in this order. All three
are risky paths (`app/api/`, `lib/auth.ts`): top model tier and a
`security-auditor` pass on each.

- **settings-gate**: a client can rewrite `.pages.yml` today. A client is an
  email user invited to one repo. If they make a free GitHub account with
  the same email and click Connect, better-auth links it without asking
  (`lib/auth.ts:28-35`, `trustedProviders: ["github"]`) and the login sets
  `githubUsername` (`lib/github-account.ts:45-47`). Their own token can't
  see the private repo, so `getToken` falls back to the installation token
  (`lib/token.ts:37-47`), while the settings routes only ask "has a GitHub
  username" (`assertGithubIdentity`). Result: they can read, write, rename
  and delete `.pages.yml`, which strips the CMS's required fields and opens
  every path in the repo to them. Fix: settings need push access proven
  with the user's own GitHub token, the same check collaborators already
  use (`requireGithubRepoWriteAccess`, `lib/authz-server.ts:16-39`). Put
  the check in one `kc/` helper and call it from each place that now calls
  `assertGithubIdentity` for settings:
  `app/api/[owner]/[repo]/[branch]/files/[path]/route.ts:186`,
  `.../entries/[path]/route.ts:44`, `.../entries/[path]/history/route.ts:37`,
  and the `.pages.yml` guard in `lib/operations.ts` (around lines 17-21).
  Same card: the Actions dispatch in `.../actions/route.ts` (POST, around
  line 24) takes `action.workflow` from the request body and has no
  identity check at all, so a client can run any workflow in their repo.
  Gate dispatch with the same helper. Upstream files touched: the four
  routes and `lib/operations.ts`, one-line hooks each. Tests: the helper's
  decision as a pure function (no identity, identity without push, push),
  and a test per route that reads its source and fails if the settings
  branch or the dispatch can be reached without the helper. Mutation check:
  remove the call from one route.
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

## Waiting on Rob

## Blocked

## Done

- **insights-labels**: PR #18, merged.
- **insights-gate**: committed on feat/09-insights-gate, gate green, audit found no attack.
- **title-hook**: committed on feat/07-title-hook, gate green, no audit (not a risky path).
- **update-banner**: committed on feat/06-update-banner, gate green, no audit (not a risky path).
- **client-view**: committed on feat/05-client-view, gate green, no audit (not a risky path).
- **branding**: committed on feat/03-branding, gate green, audit clean.
- **upstream-watch**: PR #5, merged. A manual run went green and opened no PR.
- **insights-core**: PR #1, merged.
- **uptime**: PR #3, merged, and `KC_UPTIME_ENABLED` is `true`.
