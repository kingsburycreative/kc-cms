# Board

## Now

- **reviews-line-numbers** (Normal, Rob 2026-10-28 after kc.6): the dashboard reviews line says where the rating comes from but not the rating. When source is typed, show the stars and count from the status file and the date it was typed, e.g. 5 stars from 24 reviews, typed in by hand on Oct 12 (`kc/dashboard-server.tsx` ReviewsLine, `reviewsText`, `kc/tests/reviews-status-line.test.ts`). Hidden and live copy unchanged; the six-month nudge stays. Numbers are rendered as text only, never from the remote `error` field. Copy through prose, then avoid-ai-writing and humanizer.
- **route-skeleton** (Normal, global rule 8, seen on kc.6): opening a site shows a full page with only a centred spinner and "Loading" for about 4 s (`app/loading.tsx`, `app/(main)/loading.tsx`). Replace both with a skeleton in the final shape: sidebar column with placeholder rows, header bar, and a content area of placeholder blocks, using the shimmer block from `kc/dashboard-skeleton.tsx` (still under prefers-reduced-motion). Mobile first: on a phone, no sidebar column, just header and blocks. Test asserts neither file renders the Loader and both use the shimmer block. Proof: one phone-width and one desktop screenshot of the skeleton.

Then the customization guard (`.claude/work/66-plan-customization-guard/plan.md`, rewritten 2026-10-27); cards 03 and 04 are Rob's, 05 on follow.

- **53**: In-app help text guard (`.claude/work/40-plan-short-urls/plan.md` card 53)
- **19**: Sidebar: Insights, History and Help (`.claude/work/15-plan-client-experience/plan.md` card 19)
- **20**: Advanced section for KC's view (`.claude/work/15-plan-client-experience/plan.md` card 20)

## Next

- **gbp-reviews** (Risky, waits on Google Business Profile API access for KC's Cloud project): optional live rating for clients who add KC as a manager on their profile. Business Profile API, free, needs approval (applicant manages a profile verified 60+ days). Weekly rebuild, stored values never older than 30 days, Google's attribution as provided. Typed numbers stay the default and the fallback. Status file gains `source: live` again. Research: `scratchpad gbp-research/progress.md`, 2026-10-28.
- **short-url-polish** (card 54 audit C, D, F): other owners rewritten into kingsburycreative (kc/short-url.ts:84-88); reserved test misses dotless route files (short-url-reserved.test.ts:13); 308 cached on rollback.
- **44**: Edit markers on the visits chart, after launch (`.claude/work/39-plan-dashboard/plan.md` card 44)
- **45**: PDF downloads per paper, after launch (`.claude/work/39-plan-dashboard/plan.md` card 45)
- **46**: Top Google searches from Search Console, after launch (`.claude/work/39-plan-dashboard/plan.md` card 46)
- **branch-decode-once** (card 41 audit, tidy-up only since the 10-27 sweep; access check and panels now use the same string): decode the branch once and pass the same string to the access check and getCollectionCache (kc/dashboard-server.tsx:44,85; page.tsx:18).
- **dashboard-polish** (card 41 audit, observations): key recent changes by index and drop the file path line for clients (dashboard-server.tsx:106-107, dashboard.tsx:151); ISO-parse ended_on (kc/publish/status.ts:34); sparkline gets 30 days not 90 (dashboard-server.tsx:70).

## Waiting on Rob

- **dashboard-gaps live check**: card 63 shipped; check the Staff only strip live while signed in with GitHub (the cause was not found, the client-side second gate was removed), and collection entry titles are not used for Most viewed names yet.
- **52** (`.claude/work/40-plan-short-urls/plan.md` card 52): coordinator does it in kc-cms (docs for the new settings and the short address).
- **55** (`.claude/work/40-plan-short-urls/plan.md` card 55): deploy short addresses; the coordinator's deploy per the exception in `.claude/project.md` (Rob, 2026-10-26).
- **56** (`.claude/work/40-plan-short-urls/plan.md` card 56): Rob signs the capture browser in as +kctest.
- **57** (`.claude/work/40-plan-short-urls/plan.md` card 57): retake the guide screenshots.
- **58** (`.claude/work/40-plan-short-urls/plan.md` card 58): guide copy and PDF.
- **42** (`.claude/work/39-plan-dashboard/plan.md` card 42): deploy the dashboard, live check as the +kctest client at 375 and as Rob.
- **32** (`.claude/work/38-plan-insights-charts/plan.md` card 32): deploy the Insights charts to the box, then a live check with BeSciWorks's numbers at 375px.

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

- **96 reviews-ssrf-resolve**: the reviews fetch resolves the host, refuses special-purpose addresses and connects to the address it checked; hanging fetch aborts.

- **reviews-status-line** (94): the dashboard shows one muted line under the client name saying whether the review rating is typed in, hidden or set to follow reviews, plus a six-month nudge for old typed figures; nothing when kc.site is missing or the status is unknown. Shimmer skeleton while it loads. Not seen in a browser.
- **reviews-status-fetch** (93): kc/reviews/ fetches a site's /reviews-status.json from the kc.site origin only (https, public hostname, default port, no redirects, 5 s timeout, 16 KB cap), validates the five keys, caches by origin, and maps it to a source-line key with a six-month stale flag for typed figures. DNS rebinding is still open for the feature audit. Not wired into the dashboard yet.
- **keys-copy-pass** (92): the analytics IDs editor says "Only a GitHub admin of this repository can change these IDs." and the Cloudflare tag error names underscores, which the validator accepts. Rebased onto main after the mid-gate park.
- **json-trailing-newline** (91): JSON saves end with one trailing newline (lib/serialization.ts serialize); json-frontmatter output unchanged. Not seen in a browser.
- **save-baseline** (90): after a successful save the entry form's baseline is the saved values (form.reset with keepValues), so changing a field back to its pre-save value enables Save again; a failed save keeps the old baseline. Not seen in a browser.
- **kc-tokens-header** (89): app/globals.css moves to cool neutrals, adds radius, shadow and focus-ring tokens, and swaps the green chart colours for blue, amber, violet, cyan and slate in light and dark; terracotta stays primary (sidebar primary too now). The page header takes a subtitle (publish status on the dashboard) with the action under the title on a phone and at the row end from 768px. Not seen in a browser.
- **kc-stat-tile** (88): dashboard stat tiles use a new kc/stat-tile.tsx (number first, plain-case label, change and sparkline), two columns at phone width from container queries, and the loading skeleton uses the same grid and tile count. Not seen in a browser.
- **setup-banner** (87): with no analytics IDs the dashboard shows one full-width Visits banner (staff link once, staff only) and no stat tiles; could-not-load unchanged; the header slot reads "Live site not set up yet". Not seen in a browser.
- **kc-shimmer** (86): dashboard skeletons use one `.kc-shimmer` class in app/globals.css (left-to-right sheen on --muted/--accent, still under reduced motion) instead of animate-pulse. Not seen in a browser.
- **keys-form-keeps-values** (85): after a save the analytics IDs form holds the saved IDs (a second Save no longer clears them) and the repo's dashboards are revalidated so the staff strip shows them without a reload. Not seen in a browser.
- **panel-setup-pending** (84): dashboard Visits panel and stat boxes say "not set up" with no analytics IDs and "couldn't load" when the fetch fails; staff get a link to the staff strip. Users without insights access see the not-set-up state. Not seen in a browser.
- **sidebar-not-set-up** (83): sites missing media or insights config keep the Media and Site sidebar groups with a muted "Not set up yet" line, and no kc.site shows the same text in the live-site slot; configured insights without access stays hidden. Not seen in a browser at 375px.
- **dashboard-action-buttons** (82): dashboard quick actions are secondary Buttons around Link, one weight, 44px, stacked on a phone and a wrapping row from 600px. avoid-ai-design was not run; not seen in a browser.
- **sidebar-dashboard-link** (81): the sidebar opens with a Dashboard link to the branch root, current on the dashboard only. Not seen in a browser.
- **insights-keys-editor** (80): KC staff with GitHub admin on a repo set its GA4, Cloudflare and Pages IDs from the staff strip; stored in the new insights_keys table (migration 0014), read before insights.json, which stays the fallback. The Cloudflare tag rule is now letters, digits, dash and underscore. The migration still has to run on the box at deploy.
- **media-refs-wide** (79): the media-delete guard now searches every .pages.yml path (file entries and collections, all subfolders) and text files under src/, matching input, output and relative import paths; one tree call per delete, files over 1 MB and binaries skipped.
- **media-delete-guard** (78): deleting a media file that content under the .pages.yml content paths still uses is refused with a 409 naming up to five pages; nested collection subfolders are not searched yet, src code references do not block.
- **save-size-cap** (77): /api bodies capped at 1 MB in the request filter (25 MB on /files/, where non-media saves over 1 MB are refused before zod); a 413 shows a plain too-large message in the editor and uploader.
- **nodemailer-major** (75): nodemailer 8.0.11 to 10.2.1, no nodemailer advisory left; a jsonTransport test checks from, to, subject and both bodies.
- **register-changelog** (76): CHANGELOG-KC.md claimed under the release-version register entry; main suite green again.
- **customizations-register** (74, plan 66 card 02): kc/register/customizations.json lists 31 fork customizations against upstream base 6f4e860; a test fails on any changed upstream file no entry claims.
- **load-config** (73, plan 66 card 01): kc/register/load-config.ts loads lib/config.ts and lib/schema.ts under plain node --test through tsx (CJS hook for the @/ alias, .css stubbed).
- **add-editor-repo-guard** (72): add-editor refuses a repo with no .pages.yml on its default branch, dry run included.
- **series-cache-case** (71): the Insights page keys the series cache on seriesSiteKey, as the dashboard does; the cache was already capped.
- **publish-status-log** (70): a refused deployments request now logs its HTTP status.
- **deps-update** (69): next 16.4.3, better-auth 1.7.14, nodemailer 8.0.11, tiptap 3.32, resend 6.35. nodemailer and zod highs left, fixes are majors (see .claude/work/69-deps-update/result.md).

- **auth-redirect-backslash**: the sign-in redirect accepts only same-origin paths, refusing backslashes, encoded slashes, whitespace and control characters (`.claude/work/68-auth-redirect-backslash/result.md`). Tests cover the helper, not getSafeRedirect itself.

- **add-editor-script**: box command scripts/add-editor.mts adds a client editor with no browser session; tsx now a runtime dependency (`.claude/work/62-add-editor-script/result.md`). PR #77, deployed, dry-run checked.

- **live-site-header**: "See live site" moved into the top bar, right, through an optional action slot on PageHeader; also fixed a line-ending bug in a dashboard test (`.claude/work/61-live-site-header/result.md`). Not seen in a browser at 375px.

- **proxy-rewrite-origin**: resolved on the box by starting Next with `-H localhost` (kc-cms commit e265178); short addresses live 200. No code change here.

- **short-url-main-segment**: the full-path redirect now checks the right segment, with a round-trip test (`.claude/work/59-short-url-main-segment/result.md`).

- **60**: dashboard brought to the approved mockup on feat/60-dashboard-mockup (`.claude/work/58-dashboard-mockup/result.md`). Not seen in a browser; needs the map `pages` entry and a Pages-read token before the publish line shows.

- **47 to 59**: short addresses, link helper and guard, folded Pages sidebar, audit (`.claude/work/40-plan-short-urls/plan.md`); PRs #67 to #72

- **35 to 43**: the new dashboard (`.claude/work/39-plan-dashboard/plan.md`); PRs #60 to #66

- **33 to 34**: Dashboard mockup, approved by Rob 2026-10-26 (`.claude/work/39-plan-dashboard/plan.md`); PR #59
- **28 to 31**: Insights history series, uPlot chart component, charts on the Insights page, audit (`.claude/work/38-plan-insights-charts/plan.md`); PRs #56 to #58
- **26** phone-menu: committed on feat/26-phone-menu, gate green, no audit (not a risky path); dashboard, History and Insights set the page header so the phone menu button shows, and History labels every nested value by path instead of printing JSON. Not seen at 375; History and Insights show their title twice on desktop.
- **otp-atomic-limit**: committed on feat/otp-atomic-limit, gate green, audit found nothing; OTP sends and sign-ins are counted before they run: 10 per IP first, then 5 per email and IP together, then 30 per email across IPs, so one attacker cannot lock out a client signing in from elsewhere. Disabled OTP paths 404 in the same hook. In memory on the one process.
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
