# Board

## Now

- **otp-atomic-limit**: from the otp-ip-key audit. better-auth's limiter checks
  before the request and counts after it (`better-call/dist/router.mjs`
  103-107), so a burst of simultaneous sends from one IP all get through, and
  an IPv6 /48 gives 65,536 separate buckets. Fix: a `hooks.before` on
  send-verification-otp and sign-in/email-otp that increments then checks
  before the handler runs. In memory is enough on the one process (a Postgres
  counter needs a schema change, which parks). The same hook also refuses every
  path in `kc/auth-disabled-paths.ts` by `ctx.path`. Risky path: top tier and
  an audit. Resumed 2026-10-23 from `wip/otp-atomic-limit-count-first`
  (b87d389), whose two audit rounds both found a lockout. Decided by the rubric
  (consensus and security): the per-IP check runs first and a refused request
  never touches any other counter; the tight limit, 5 per 10 minutes, is keyed
  on email and IP together, so one attacker cannot lock out a client signing
  in from elsewhere; a looser ceiling of 30 per email across all IPs stops
  spread-out guessing. A test proves one IP sending to many emails, and one IP
  sending to one email, cannot stop that email signing in from a second IP.
  The app listens on 127.0.0.1:3000 only (checked on the box 2026-10-23), so
  `x-real-ip` comes from nginx.
- **19**: Sidebar: Insights, History and Help (`.claude/work/15-plan-client-experience/plan.md` card 19)
- **20**: Advanced section for KC's view (`.claude/work/15-plan-client-experience/plan.md` card 20)

## Next

## Waiting on Rob

- **nginx limit_req** (from the otp-ip-key audit): an nginx `limit_req` zone on
  `/api/auth/email-otp/` and `/api/auth/sign-in/` would cap the send race at
  the edge. It is a box change, so it is yours.
- **invite emails unlimited** (same audit): a signed-in client with push access
  can send any number of KC-branded invite emails to any addresses
  (`lib/actions/collaborator.ts` 20-29, 190, 211, 340). Worth a limit?

- **media categories** (from the media-types audit): a `.pages.yml` media config using `categories: [image]` still allows `.svg` (and `code` allows `.html`, `.js`), because a config that names its own types is honoured as before. Unchecked whether any client config uses `categories`; listing `extensions` explicitly in KC configs avoids it.
- **scripts in content** (same audit): the rich-text field saves `<script>` in a markdown body unchanged, so a client can still put script on their own site through content. Whether each Astro site renders it is unchecked. Acceptable, or sanitise?

- **03** (`.claude/work/15-plan-client-experience/plan.md` card 03): deploy the lock to the box (`D:\Dev\htdocs\kc-cms\server\deploy.sh`) and confirm the 403 as the `+kctest` client before any client invite.
- **06** (`.claude/work/15-plan-client-experience/plan.md` card 06): write the CMS guide page in a session in `D:\Dev\htdocs\kingsburycreative` (`pages/cms-guide.php`, router, sitemap); card 19 waits on it.
- **07** (`.claude/work/15-plan-client-experience/plan.md` card 07): confirm Henike's client name for its `.pages.yml` (Henike's own session) and update `docs/NEW-CLIENT.md` in `D:\Dev\htdocs\kc-cms`.
- **22** (`.claude/work/15-plan-client-experience/plan.md` card 22): decide the AI writing helper first: provider and who pays for the key, client consent for text leaving the browser, and a per-site opt-in key. Nothing is built.
- **24** (`.claude/work/15-plan-client-experience/plan.md` card 24): deploy the finished work to the box and run the final check (invite email, dashboard at 375 and 1280, one restore).

## Blocked


## Done

- **email-verified-trust**: committed on feat/email-verified-trust, gate green, audit found nothing; GitHub is no longer trusted for automatic account linking, unclaimed invites match by email only when verified, and admin access needs a verified email.
- **run-claim**: committed on feat/run-claim, gate green, audit found nothing; a pending action row only claims a GitHub run created from 30 seconds before to 2 minutes after it, and after 2.5 minutes an unmatched row shows as a failed run and stops looking.
- **delete-guard-path**: committed on feat/delete-guard-path, gate green, audit found nothing; client delete and any rename now refuse a single-file page path whatever schema name is sent, and media delete checks allowed file types. Route tests only match source text.
- **branch-create-gate**: committed on feat/branch-create-gate, gate green, audit found nothing; creating a branch now needs a user token with push on the repo, and the branch lock compares the name exactly so %6Dain is not main. The branch layout still decodes a second time.
- **23** feature security audit: no high finding; ?ref=, restore, other repos, redaction and tokens closed. One live low and two latent fixes queued in Next. Result in `.claude/work/31-feature-audit/result.md`.
- **25** insights-cloudflare: committed on feat/25-insights-cloudflare, gate green, audit found nothing; Cloudflare gives visits and top pages beside GA4 detail under "From visitors who allowed analytics", GA4 alone on any Cloudflare failure. Only the dataset name is confirmed in Cloudflare docs; the other field names need an introspection check at deploy. Not tried live or seen in a browser.
- **21** seo-panel: committed on feat/21-seo-panel, gate green, no audit (not a risky path); a panel beside the editor checks title and description length, headings, image descriptions, reading grade (flags above 9, the worker's threshold) and an answer-first opening. Not seen in a browser.
- **17** history-pages: committed on feat/17-history-pages, gate green, no audit (not a risky path); new site history and one-edit pages show what changed field by field, and the editor history panel links there instead of GitHub. Not seen in a browser.
- **16** site-dashboard: committed on feat/16-site-dashboard, gate green, no audit (not a risky path); the branch home shows content, Media, History and Insights tiles with recent edits instead of jumping to the first item. Not seen in a browser.
- **15** history-data: committed on feat/15-history-data, gate green, audit found nothing; new site history feed route, and the entries route reads an old version only when its commit is on the branch.
- **14** commit-identity: committed on feat/14-commit-identity, gate green, no audit (not a risky path); saves are now credited to the signed-in user unless a site sets identity: app.
- **13** invite-name: committed on feat/13-invite-name, gate green, audit found nothing; the invite form takes an optional name, applied at sign-in only when the user has none. Resending an invite drops the name.
- **12** email-logo: committed on feat/12-email-logo, gate green, no audit (not a risky path); the three emails show the KC wordmark at 198x40 and the dot generator is gone.
- **10** client-no-delete-file: committed on feat/10-client-no-delete-file, gate green, audit found nothing; clients get a 403 deleting single-file entries and the editor hides the button.
- **08** client-third-party: committed on feat/08-client-third-party, gate green, no audit (not a risky path); clients get no GitHub links, nobody gets unavatar.io avatars.
- **02** client-identity-redact: PR #29, merged.
- **01** client-branch-lock: committed on feat/01-client-branch-lock, gate green, audit found nothing; clients work on the default branch only. Card 03 (deploy) still gates any client invite.
- **04**: resolved by Rob 2026-10-23, the email logo is `D:\Dev\htdocs\kingsburycreative\img\logos\kc-wordmark-logo.png` (copied by card 12).
- **05**: resolved by Rob 2026-10-23, one nullable `name` column on `collaborator_invite` approved (used by card 13).
- **otp-disabled-paths**: committed on feat/14-otp-disabled-paths, gate green, audit found no live attack; five unused email-OTP endpoints now answer 404 (the card's three plus the deprecated forget-password twin and verify-email).
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
