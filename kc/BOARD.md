# Board

## Now

Fixes left from the 2026-10-15 security audit. A risky path (`app/api/`, `lib/auth.ts`): top model tier and a
`security-auditor` pass on each.

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

From the 2026-10-15 client-view review and Rob's dashboard request. client-branch-lock and client-identity-redact are risky paths.

- **client-branch-lock**: a client is held to the default branch only in the
  browser. `getToken` (`lib/token.ts:37-47`) never looks at the branch, so a
  client who types another branch into the URL reads and writes it with the
  installation token, and `POST .../branches` (`branches/route.ts:24`) lets
  them create branches on KC's repo (each one starts a Cloudflare Pages
  preview build). `app/(main)/[owner]/[repo]/layout.tsx:36-56` also sends
  them every branch name. Fix: when `getToken` returns
  `source: "installation"`, refuse any branch but the repo's default branch
  (one `kc/` helper, called from `lib/api-repo-context.ts` and both repo
  layouts), refuse the branches POST for anyone without
  `hasGithubIdentity(user)`, and give clients an empty branch list. Risky
  path (`app/api/`, `lib/token.ts`): top model tier and a `security-auditor`
  pass. Tests: the helper's decision as a pure function (installation +
  default branch passes, installation + other branch refused, user token
  any branch passes); a source test per route that fails if the helper is
  not called; the branches POST refuses an email-only user. Mutation check:
  drop the helper call from one route.

- **client-identity-redact**: two APIs hand clients other people's identity.
  The entry history route returns GitHub's raw `listCommits` data
  (`entries/[path]/history/route.ts:60-69`): author and committer emails,
  logins, profile links. `GET .../actions?all=1` (`actions/route.ts:243-278`)
  and `actions/[runId]/route.ts:29-31` return the triggering user's email,
  GitHub username and run link, and the Actions page is only hidden in the
  browser (`actions/page.tsx:17`). Fix: for an installation-token caller,
  history returns only sha, date and author name (no links, no emails), and
  the actions routes refuse `all=1` and blank those three fields. One `kc/`
  mapper for each shape; `entry-history.tsx` drops the GitHub links when
  they are absent. Risky path: top tier and a `security-auditor` pass.
  Tests: the mappers keep exactly the allowed fields; a source test per
  route that it calls the mapper for clients. Mutation check: return the
  raw data from one route.

- **client-third-party**: two small leaks to outside services. Every page
  sends an email user's address to unavatar.io (`components/user.tsx:50`);
  show initials when there is no `githubUsername`. "View on GitHub" links
  show to clients (`components/file/file-options.tsx:119`,
  `fields/core/image/edit-component.tsx:62`,
  `fields/core/file/edit-component.tsx:68`), naming the repo and landing on
  a GitHub 404; add a `githubLinks` flag to `viewFor()` in
  `kc/client-view.ts` and hide them with it. Tests: no unavatar URL is built
  for a user without a GitHub username; `viewFor` returns
  `githubLinks: false` for a client and true for a GitHub user; a source
  test that each of the three files reads the flag.

- **advanced-toggle**: clients already never see Actions, Collaborators or
  Configuration (`components/repo/repo-nav.tsx:68-84`, gated on
  `hasGithubIdentity`), so this is for KC's own view. Move the sidebar's
  whole "Admin" group (those three today) into one "Advanced" section in the sidebar, collapsed by
  default, its open state remembered per browser (try/catch around
  storage, works without it). The toggle is a button with
  `aria-expanded`. The pages stay reachable by URL and their server checks
  are untouched. Flag lives in `viewFor()` in `kc/client-view.ts`. Tests:
  `viewFor` puts the admin items under advanced for a GitHub user and
  exposes none for a client; the nav reads the flag (source test).

- **site-dashboard**: opening a site lands on its first content file
  (`app/(main)/[owner]/[repo]/[branch]/page.tsx` redirects there), so
  there is no home screen. Replace the redirect with a dashboard titled by
  `dashboardName()`: one tile per top-level content item and group (label,
  link), a Media tile, an Insights tile when `getInsightsAccess` allows it,
  and the five most recent edits (title, date, author name only, no
  emails or GitHub links) linking to the entry. Same page for clients and
  KC staff; nothing on it a client could not already open. Data comes
  from the config already in `ConfigProvider` plus one server call for the
  recent edits, made with the caller's existing token. Build it under
  `kc/`, with a one-line hook in the page. Follow `.claude/rules/
  accessibility.md` (real headings, tiles are links, 44px targets) and
  check it at 375 and 1280 wide. Tests: the tile list as a pure function
  of a config (groups, files, collections, no Insights tile without
  access); the recent-edits mapper keeps only title, date, author name and
  path. Not a risky path unless the recent-edits call lands in `app/api/`,
  in which case it gets the audit.

## Waiting on Rob

- **nginx limit_req** (from the otp-ip-key audit): an nginx `limit_req` zone on
  `/api/auth/email-otp/` and `/api/auth/sign-in/` would cap the send race at
  the edge. It is a box change, so it is yours.
- **invite emails unlimited** (same audit): a signed-in client with push access
  can send any number of KC-branded invite emails to any addresses
  (`lib/actions/collaborator.ts` 20-29, 190, 211, 340). Worth a limit?

- **media categories** (from the media-types audit): a `.pages.yml` media config using `categories: [image]` still allows `.svg` (and `code` allows `.html`, `.js`), because a config that names its own types is honoured as before. Unchecked whether any client config uses `categories`; listing `extensions` explicitly in KC configs avoids it.
- **scripts in content** (same audit): the rich-text field saves `<script>` in a markdown body unchanged, so a client can still put script on their own site through content. Whether each Astro site renders it is unchecked. Acceptable, or sanitise?

## Blocked

## Done

- **config-exposure**: accepted 2026-10-15. Rob saw the config data a client receives (file paths and field names for their own site, no secrets) and asked for a dashboard and an Advanced toggle instead of trimming it.
- **media-types**: committed on feat/13-media-types, gate green, audit found no attack; upload and rename now allow only safe image and pdf types when the config names none, and refuse control characters.
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
