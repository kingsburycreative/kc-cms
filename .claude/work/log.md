- 2026-10-14 card 01 insights-core: round 1 failed tsc (TS5097 on .ts imports). Coordinator widened the brief to allow one line in upstream tsconfig.json (allowImportingTsExtensions), the smallest hook; project.md permits a named upstream file.
- 2026-10-14 card 01 upstream-watch: audit found no attack. Keep the workflow on github.token (a PAT with workflow rights would let an upstream release run workflows with KC's secrets); if CI is added, keep upstream/** out of push triggers. Needs Rob: turn on "Allow GitHub Actions to create pull requests" in repo settings. Minor: newerRelease validates tag.trim() but returns the untrimmed tag; not exploitable.
- 2026-10-14 card 01 upstream-watch PARKED: extra_checks failed, tsc TS5097 on `.ts` import paths (required by project.md) because tsconfig.json lacks allowImportingTsExtensions. Fix is an upstream-file edit the card doesn't name, so Rob decides. Work on branch wip/01-upstream-watch. Any future card importing between kc/ files hits the same wall.
- 2026-10-14 card 02 uptime: audit found no attack. Needs Rob: if the repo is private, a 15-minute schedule is about 2,880 Actions minutes a month, over the Free plan's 2,000; make it public, or slow the cron. Minor: a failed connection logs "000000"; still fails correctly.
- 2026-10-14 merged insights-core (PR #1, renumbered 00) and uptime (PR #3) with Rob's yes. upstream-watch unparked: main now has allowImportingTsExtensions.
- 2026-10-14 card 01 upstream-watch round 2: restored onto main, scope ok with mutation evidence; workflow identical to the audited one, test now normalises CRLF. Sent to the loop's gate.
- 2026-10-14 card 03 branding: scope ok with mutation evidence; audit found no attack (lib/auth.ts changed only the import and the OTP subject). Worker left About's Website/Docs/GitHub links pointing at pagescms.org, and two listed files had no Pages CMS logo so stayed untouched. Credit link uses github.com/pagescms/pagescms; project.md names hunvreus/pagescms, unchecked which is current. Sent to the loop's gate.
- 2026-10-14 card 04 dark-primary: scope ok with mutation evidence; diff read, no weakened tests; not a risky path, no audit. Dark ratios 5.86 link, 5.30 button. Sent to the loop's gate.
- 2026-10-14 card 04: R --pass first refused because check-scope had been given a short start sha; re-recorded with the full sha on the unchanged tree.
- 2026-10-14 card 05 client-view: round 1 left the one-repo redirect and list labels undone because the brief omitted components/repo/repo-select.tsx (coordinator's miss); brief widened, round 2 finished it. Call made: the home project list labels each repo with the fallback dashboard name, not kc.client, to avoid a .pages.yml fetch per repo. document-title.tsx calls useConfig inside try/catch (no provider on home) with a rules-of-hooks disable; works, worth a tidier provider check later. Scope ok with mutation evidence, not a risky path, no audit. Sent to the loop's gate.
- 2026-10-14 card 06 update-banner: scope ok with mutation evidence after the coordinator listed the five fixture files by name (the brief's glob was not expanded by the scope check). Diff read, no weakened tests; admin page is not a risky path, no audit. Several open upstream PRs: highest version wins. Banner not seen in a browser. Sent to the loop's gate.
- 2026-10-14 card 07 title-hook: branch feat/07-title-hook from main after PR #13. Scope ok with mutation evidence; diff read, no weakened tests; one added export (useOptionalConfig) in upstream contexts/config-context.tsx as the brief named; not a risky path, no audit. Sent to the loop's gate.

## 2026-10-14 insights-route (08)
- Audit: one latent finding. The reused repo-access check lets any signed-in GitHub user open a *public* mapped repo's Insights. Not live: no kingsburycreative repo but kc-cms is public, and client repos are created private. The card says reuse the existing check, so I did not change access rules; needs Rob: should Insights require push access or a collaborator row instead? Also noted: the map keys on mutable owner/repo names.
- Worker call: a missing key file shows the failure message without logging.

## 2026-10-14 insights-gate (09)
- Branch feat/09-insights-gate. Scope ok with mutation evidence; diff read, no weakened tests. Push permission costs one extra repos.get call for GitHub-login users (the cached access check holds only a yes/no). Audit (Opus) found no attack on the new gate. Latent, pre-existing, needs Rob: hasAdminAccess (lib/admin.ts) trusts ADMIN_EMAILS without checking emailVerified, and GitHub sign-in can record an unverified email; requiring emailVerified would close it. Known side effect: an email collaborator who links GitHub loses Insights unless they have push. getInsightsAccess itself is untested (needs DB and GitHub). Sent to the loop's gate.

## 2026-10-14 insights-labels (10)
- Branch feat/10-insights-labels. Scope ok with mutation evidence; diff read, no weakened tests. Call made: pages and channels get their own "aren't known yet" sentences alongside the card's cities one. Audit (Opus) found no attack; labels render as escaped React text. Sent to the loop's gate.

## 2026-10-15 settings-gate (11)
- The 18:56 pass was killed at 19:19 mid re-audit; its output was stashed. This pass restored the stash onto feat/11-settings-gate and gated it. Scope ok; the runner reported mutation evidence "no" only because restoring re-created the card folder after the 19:17 fail-then-pass mutation runs, which are in test-runs.jsonl. Diff read, all tests new, none weakened.
- Fresh Opus audit: the round 3 path fix holds, no way past the new gate. Two older findings the diff did not create, so the card was not sent back (it started on the top tier and had used one round on an audit fix; parking it would leave the .pages.yml write hole open): run-claim (a client can cancel Rob's workflow run via an orphaned run row) queued in Next; config-exposure (clients can read the parsed .pages.yml through the page data) put under Waiting on Rob.
- Calls the worker made: renaming onto .pages.yml is refused for everyone; GET actions stays open; email collaborators can no longer dispatch actions. Sent to the loop's gate.

## 2026-10-15 otp-ip-key (12)
- Branch feat/12-otp-ip-key from main after PR #19. Scope ok with mutation evidence; diff read, all tests new. better-auth 1.5.6 source confirms the option path (advanced.ipAddress.ipAddressHeaders), the limiter is on when NODE_ENV is production, and a request with no IP skips it; the app listens on 127.0.0.1 only, so only something on the box can skip it.
- Opus audit: no attack on the change; a caller can no longer pick the key. Two older better-auth weaknesses stop the card's goal being fully met: the limiter counts after the request, so simultaneous sends all pass, and the same race lets bursts of wrong code guesses cost one attempt. Not sent back (outside the brief, card started on the top tier). Queued otp-disabled-paths in Now and otp-atomic-limit in Next; nginx limit_req and unlimited invite emails under Waiting on Rob. Sent to the loop's gate.

## 2026-10-15 media-types (13)
- Branch feat/13-media-types from main after PR #20. Brief widened the card to the rename route too (otherwise upload photo.jpg, rename to photo.html). Worker left DELETE on upstream's check so existing files of any type can still be removed. Scope ok with mutation evidence; diff read, all tests new.
- Opus audit: no attack. Round 2 fixed a jammed line and, on the audit's unverified point, refuses control characters (a null byte in x.html%00.jpg) under any list. Outside the diff, under Waiting on Rob: `categories: [image]` still allows .svg; rich-text content saves <script> unchanged. Also noted, low risk, upstream: the media path check has no folder boundary (public/media-other/ passes a public/media input). Sent to the loop's gate.

## 2026-10-15 otp-disabled-paths (14)
- Branch feat/14-otp-disabled-paths from main after PR #22. Brief widened the card's three paths to five: /forget-password/email-otp (deprecated twin of request-password-reset, still routed) and /email-otp/verify-email (checks a silent email-verification code and sets emailVerified). Scope ok with mutation evidence; diff read, all tests new.
- Opus audit: no way past the 404 today, no other open endpoint checks a guessable code, sign-in unaffected. Latent: if the app is ever served under a URL prefix (Next basePath) with BASE_URL a bare origin, better-auth's disabled check and its router strip the base path differently and the block stops applying; the fix is a hooks.before on ctx.path, folded into otp-atomic-limit, which adds one anyway. Not sent back: not live, card started on the top tier. Also noted: the tests read source rather than send a request (a memory-adapter handler test would prove the 404), and the constant's comment says all five take a code when two only mint one. Sent to the loop's gate.

## 2026-10-23 client-branch-lock (plan card 01, checklist c01)
- Branch feat/01-client-branch-lock from main at 08d19dd. Opus worker. Scope ok with mutation evidence; diff read, tests all new. Lock sits after every getToken in the seven [branch] API routes and in getRepoReadContext; branches POST refuses users without githubUsername; repo layout gives clients an empty branch list, branch layout shows Access denied off the default branch. A client is refused when the default branch is unknown. Not seen in a browser. Sent to the loop's gate with an audit (app/api/).

## 2026-10-23 client-identity-redact (plan card 02, checklist c02)
- Branch feat/02-client-identity-redact from main at ef2cb98. Opus worker. Scope ok with mutation evidence; diff read, tests all new. Clients get sha, parentSha, date and authorName from entry history; action runs blank email, GitHub username, avatar and run link; all=1 refused with 403. The single-run GET now looks up the token for finished runs too, so it knows the caller is a client. Actions POST routes return only an id, nothing to redact. The 403 text went through prose, avoid-ai-writing and humanizer: "Only Kingsbury Creative can see the full list of site actions." Not seen in a browser. Sent to the loop's gate with an audit (app/api/).

## 2026-10-23 client-third-party (plan card 08, checklist c08)
- Branch feat/08-client-third-party from main at 0c69f87 (PR #29 merged). Sonnet worker, not a risky path. Scope ok with mutation evidence; diff read, tests all new. viewFor gains githubLinks; the six components hide github.com links and avatars for clients; unavatar.io is gone for everyone; new kc/avatar.ts initialFor gives the email's first letter when the name is empty. Calls: the actions hover card no longer shows triggeredByImage (could be a third-party URL); client history rows are plain, not links. No new copy. Not seen in a browser. Sent to the loop's gate, no audit.

## 2026-10-23 client-signin (plan card 09, checklist c09)
- Branch feat/09-client-signin from main at 66f3277 (PR #30 merged). Sonnet worker, not a risky path. Scope ok with mutation evidence; diff read, tests all new. Sign-in shows email only; GitHub button and the "Or" divider only at /sign-in?staff=1. Settings hides the whole GitHub identity row for clients. lib/auth.ts untouched, so the GitHub provider still answers a direct call. No new copy. Not seen in a browser. Sent to the loop's gate, no audit.

## 2026-10-23 client-no-delete-file (plan card 10, checklist c10)
- Branch feat/10-client-no-delete-file from main at a88ea85 (PR #31 merged). Opus worker, risky path. Scope ok with mutation evidence; diff read, tests all new. Files DELETE refuses a client (installation token) on a type: file schema with a 403; collection entries and media unchanged; the editor hides delete for anyone without a GitHub identity. 403 text through prose, avoid-ai-writing and humanizer: "This page can't be deleted. Ask Kingsbury Creative if it needs to go." Not seen in a browser. Sent to the loop's gate with an audit (app/api/).

## 2026-10-23 white-label-emails (plan card 11, checklist c11)
- Branch feat/11-white-label-emails from main at df4d454 (PR #32 merged). Sonnet worker, not a risky path. Scope ok with mutation evidence; diff read, brand test tightened (whitespace collapsed), new tests added, none weakened. From gets "Kingsbury Creative <...>" when bare; invite and added subjects and bodies use the kc.client name, no owner/repo, no GitHub link, no Pages CMS. Call: client name read from the "main" branch config, so a repo whose default branch differs falls back to the readable repo name. Copy through prose, avoid-ai-writing, humanizer. Not seen in a mail client. Sent to the loop's gate, no audit.

## 2026-10-23 email-logo (plan card 12, checklist c12)
- Branch feat/12-email-logo from main at 3f6c3c9 (PR #33 merged). Sonnet worker, not a risky path. Scope ok with mutation evidence; diff read, the 96x96 test replaced by an aspect and sharpness check on all three templates. Logo is the 1624x328 wordmark copied byte for byte, shown at 198x40; generator deleted. No new copy. Not seen in a mail client. Sent to the loop's gate, no audit.

## 2026-10-23 invite-name (plan card 13, checklist c13)
- Branch feat/13-invite-name from main at 297871d (PR #34 merged). Opus worker (sign-in hook). Scope ok with mutation evidence; diff read, tests all new. Migration 0013 adds one nullable name column (approved, card 05). Invite form takes an optional name; sign-in sets user.name from it only when blank, through nameToApply. Copy through prose, avoid-ai-writing, humanizer: "Name (optional)", "Jane Smith", "Keep the name to one line of 80 characters or fewer." Not done: resending an invite drops the name. The sign-in lookup takes any named invite for that email, not scoped to a site or expiry. Not seen in a browser. Sent to the loop's gate with an audit (sign-in hook).

## 2026-10-23 commit-identity (plan card 14, checklist c14)
- Branch feat/14-commit-identity from main at bc69c48 (PR #35 merged). Sonnet worker, not a risky path. Scope ok with mutation evidence; diff read, tests all new. New kc/commit-identity.ts defaults commits to the signed-in user; explicit identity app or user in .pages.yml or a schema still wins; the routes still fall back to the app when the user has no email. No new copy. Not tried against GitHub. Sent to the loop's gate, no audit.

## 2026-10-23 history-data (plan card 15, checklist c15)
- Branch feat/15-history-data from main at 3be961d (PR #36 merged). Opus worker, risky path (app/api/). Built the site feed route and the ref check on the entries route; done-test, tsc and eslint pass. Parked: the auto-mode classifier refused the mutation run that forces refIsOnBranch to true ("Security Test Removal"); not routed around. Code pushed to wip/c15-history-data. Worker also reports the runner ran the whole suite when given a test file. Needs Rob: allow the mutation run, or run it by hand.
- Resumed 2026-10-23 on feat/15-history-data from main at cc23868 (PR #38 merged). Opus worker brought the six files over from wip/c15-history-data unchanged and ran the mutation check through the runner (two ref-check tests failed with the check skipped, green after restore). Scope ok with mutation evidence; diff read, tests all new. Sent to the loop's gate with an audit (app/api/).

## 2026-10-23 site-dashboard (plan card 16, checklist c16)
- Branch feat/16-site-dashboard from main at 3a40460 (PR #39 merged). Sonnet worker, not a risky path. Scope ok with mutation evidence; diff read, tests all new. Branch home is now a server page computing hasInsights like the layout and rendering a dashboard of tiles (content, Media, History, Insights with access) and recent edits from the history feed; the first-item redirect is gone, the empty states stay. Copy through prose, avoid-ai-writing, humanizer: "Recent edits", "Loading recent edits", "Nothing has been edited yet.", "Recent edits could not be loaded." Not seen in a browser at 375 or 1280. Sent to the loop's gate, no audit.

## 2026-10-23 history-pages (plan card 17, checklist c17)
- Branch feat/17-history-pages from main at 1c62c11 (PR #40 merged). Sonnet worker, not a risky path. Round one left client-view.test.ts expecting githubLinks in entry-history.tsx and skipped avoid-ai-writing, humanizer and avoid-ai-design; brief widened to drop that one path from the old test, second Sonnet worker fixed both. Scope ok with mutation evidence; diff read, the old test's dropped path is covered by the new no-github.com source test. New site history and one-edit pages, field-by-field diff in kc/history/diff.ts, history panel links stay in the CMS. Not seen in a browser at 375 or 1280. Sent to the loop's gate, no audit.

## 2026-10-23 restore-version (plan card 18, checklist c18)
- Branch feat/18-restore-version from main at 6f3eba4 (PR #41 merged). Sonnet worker, not a risky path. Scope ok with mutation evidence; diff read, tests all new. New kc/history/restore.ts; the one-edit page links "Restore this version" to the editor with ?restore=<sha>; the editor loads that version through the existing entries route with ref, keeps the current sha and marks the form changed, save path unchanged. Copy: "Restore this version", "This is an older version. Save to keep it as your latest edit." Unchecked: whether EntryForm reloads its fields when the content changes, and whether the restore re-applies after a save while ?restore= stays in the URL. Not seen in a browser. Sent to the loop's gate, no audit.

## 2026-10-23 seo-panel (plan card 21, checklist c21)
- Cards 19 and 20 skipped: 19 waits on card 06 (Rob's guide page), 20 waits on 19. Branch feat/21-seo-panel from main at 706df1f (PR #42 merged). Sonnet worker, not a risky path. Round one wrote the copy by hand; a second Sonnet worker ran prose, avoid-ai-writing, humanizer and avoid-ai-design for real and changed three strings. Scope ok with mutation evidence; diff read, tests all new. New kc/seo/ rules, readability and panel; entry-form wraps form and panel in a grid, one column on a phone and two from 1280; the panel is a details, opened at 1280 by matchMedia. Reading grade above 9 is flagged, the worker's own threshold. Not seen in a browser. Sent to the loop's gate, no audit.

## 2026-10-23 insights-cloudflare (plan card 25, checklist c25)
- Cards 19 and 20 still wait on card 06. Branch feat/25-insights-cloudflare from main at 14265be (PR #43 merged). Opus worker, risky path (kc/insights/, token-bearing outbound call). Scope ok with mutation evidence; diff read, existing insights tests unchanged, eight new tests. New kc/insights/cloudflare.ts, map takes { ga, cf }, loadSiteInsights runs both and falls back to GA4 on any Cloudflare failure (one log line, status only); GA4 detail cards carry "From visitors who allowed analytics" only when Cloudflare gives the totals. Unconfirmed: only the dataset name rumPageloadEventsAdaptiveGroups is in Cloudflare's docs; siteTag, date_geq/leq, sum.visits, count, requestPath and count_DESC are the worker's guess, to check by introspection at deploy (card 24). Missing token or account id falls back to GA4 silently. Not tried against the live API or seen in a browser. Sent to the loop's gate with an audit.

## 2026-10-23 feature security audit (plan card 23)
- Cards 19 and 20 still wait on card 06. Opus security-auditor, read-only, no code changed. No high; a client can create branches after linking GitHub (low, live); email trusted without emailVerified in three places (latent); delete guard keys on the named schema (latent). Queued as branch-create-gate, email-verified-trust, delete-guard-path. Auditor had no shell, so live probes are unverified.

## 2026-10-23 branch-create-gate (board Next, checklist branch-create-gate)
- Cards 19 and 20 still wait on card 06, so the top Next card was taken. Branch feat/branch-create-gate from feat/25-insights-cloudflare at 0b26f70 (main plus the card 23 board commit). Opus worker, risky path (app/api/). Scope ok with mutation evidence; diff read. Branches POST now also refuses a non-user token and requires push on the route's repo, before the body or any GitHub call. The lock compares the branch exactly (Next 16 already decodes params once), so %6Dain no longer passes as main; the old feat%2Fx assertion flipped to false by design. Not changed: the branch layout still decodes a second time (not on the list; the API lock still holds). Worker reports the runner ran the whole suite when given two files. Sent to the loop's gate with an audit (app/api/).

## 2026-10-23 email-verified-trust (board Next, checklist email-verified-trust)
- Cards 19 and 20 still wait on card 06. Branch from main at 06e472e (PR #45 merged). Opus worker, risky path (lib/auth.ts). Code done: trustedProviders empty (better-auth still links a verified GitHub email), unclaimed invites match by email only when verified, hasAdminAccess needs emailVerified. PARKED: the permission classifier refused the mutation-check run ("Security Weaken") on the temporarily weakened hasAdminAccess, so there is no mutation evidence. Not routed around. Code on wip/email-verified-trust-verified-email. Needs Rob: allow that run, or run the mutation check himself, then gate it.

## 2026-10-23 delete-guard-path (board Next, checklist delete-guard-path)
- Cards 19 and 20 still wait on card 06; email-verified-trust parked. Branch feat/delete-guard-path from feat/branch-create-gate at b2ce83e (main plus the park commit). Opus worker, risky path (app/api/). Scope ok with mutation evidence; diff read, existing tests unchanged, five new. New isSingleFilePath in kc/content-ops.ts; client DELETE and everyone's rename refuse any path that is a file schema's path whatever name is sent; media DELETE uses isMediaPathAllowed, so with no extensions configured a client can no longer delete e.g. an .svg through it. Route tests are source matches, so only the function test caught the mutation. Sent to the loop's gate with an audit (app/api/).

## 2026-10-23 run-claim (board Next, checklist run-claim)
- Cards 19 and 20 still wait on card 06; email-verified-trust parked. Branch feat/run-claim from feat/delete-guard-path at cf512d8. Opus worker, risky path (app/api/). Scope ok with mutation evidence; diff read, tests all new. New kc/action-run-claim.ts: a pending row only claims a run created 30s before to 2 minutes after it; past 2.5 minutes an unmatched row is marked completed/failure (existing values, no migration) and never looks up again. Cancel still 409s with no run id. Sent to the loop's gate with an audit (app/api/).

## 2026-10-23 unpark email-verified-trust, resume otp-atomic-limit
- Rob asked for the email-verified-trust mutation check; the coordinator window ran it through the runner: all three guards broken, the three new tests failed (215 of 218), restored 218 of 218. Unparked with a Resume note. otp-atomic-limit back in Now with the fix decided by the rubric (now in project.md): IP first, the tight limit keyed on email and IP, a loose per-email ceiling. Box checked: the app listens on 127.0.0.1:3000 only.

## 2026-10-23 email-verified-trust (board Now, resumed)
- Stale empty feat/email-verified-trust reset to main at 93ef6c1; start_sha moved there. Opus worker restored the four files from the wip branch, done-test green. Scope ok; mutation evidence "no" in this run is accepted because the coordinator window ran the mutation on Rob's instruction (all three guards broken, three new tests failed, restored green). Diff read: trustedProviders empty, unclaimed invites match by email only when verified, hasAdminAccess needs emailVerified; no existing test touched. Sent to the loop's gate with an audit (lib/auth.ts).

## 2026-10-23 otp-atomic-limit (board Now, resumed from wip b87d389)
- Branch feat/otp-atomic-limit from main at e15bdc3 (PR #50 merged). Opus worker, risky path (lib/auth.ts). Scope ok with mutation evidence (tight limit keyed on email only: three tests failed, restored green); diff read, tests all new. Counts before checking: per IP 10 first, then 5 per email and IP together, then 30 per email across IPs; each refusal stops before the next counter; hooks.before also 404s the disabled paths. Worker reports the runner ignored the file argument and ran the whole kc suite each time. Sent to the loop's gate with an audit (lib/auth.ts).

## 2026-10-26 insights-series (plan 38 card 28, checklist 28)
- Top Now card. Branch feat/28-insights-series from main at 329cfed. Opus worker, risky path (kc/insights/). Scope ok with mutation evidence (UTC bucketing failed the late-evening test; GA4-first failed both-sources and fallback). Diff read, tests all new, existing query untouched. Cache keyed by a caller-given site string; failures not cached. Sent to the loop's gate with an audit.
- Round two: tsc failed on the test helper's return type; Opus worker made it generic, one line, no assertion changed. Scope ok; back to the gate with the audit.

## 2026-10-26 insights-chart (plan 38 card 29, checklist 29)
- Top Now card; uplot 1.6.32 already installed. Branch feat/29-insights-chart from feat/28-insights-series at d80de1d. Sonnet worker, Normal, not a risky path. Scope ok with mutation evidence (top-level uplot import failed the lazy-load test; dropping the table failed the markers test). Diff read, three new files, no existing file touched. Copy skills ran per the worker. tsc and eslint left to the loop's gate. Sent to the gate.

## 2026-10-26 insights-page (plan 38 card 30, checklist 30)
- Top Now card. Branch feat/30-insights-page from feat/29-insights-chart at 4972453. Opus worker, Risky (new file under kc/insights/). Scope ok with mutation evidence (removing the section failed three tests). Diff read, tests all new; only series.days reaches the client chart. The worker renamed the heading to "Daily traffic" after the copy skills reviewed "Visits by day"; accepted by the rubric (two plain words, no banned pattern), Rob may overrule. Sent to the loop's gate with an audit.

## 2026-10-26 33 dashboard-mockup (board Now)
- Cards 19 and 20 still wait on card 06. Branch feat/33-dashboard-mockup from main at 0e7f0a7. Sonnet worker, Normal. Scope ok with mutation evidence (uppercase and max-width each failed their test). First phone screenshot looked clipped at the right; second round found Chrome's window-size cropped a wider layout, retook with a true 375 viewport and hardened the grid. Viewed: nothing clipped. Sent to the loop's gate, no audit (not a risky path).

## 2026-10-26 35 dashboard-model (board Now)
- approved.md for card 34 was never written; the board records Rob approved the mockup 2026-10-26, taken as the approval. Branch feat/35-dashboard-model from main at 2cab416. Sonnet worker, Normal, not a risky path. Scope ok with mutation evidence (collection filter dropped failed two tests; weeks swapped failed three). Diff read, tests all new. Worker added site and actions to the strict KcSchema so configs with them still parse. Sent to the gate, no audit.

## 2026-10-26 36 seo-site (board Now)
- Branch feat/36-seo-site from feat/35-dashboard-model at ab1fda5. Sonnet worker, Normal, not a risky path. Scope ok with mutation evidence (counting reading grade failed the page-file and advice tests; dropping the advice no-body guard failed the page-file test). The counted no-body guard is redundant today since body checks pass on an empty body. Diff read, all new files. Sent to the gate, no audit.
- Round two: tsc flagged two dead status comparisons in the test after assert.equal had already narrowed; Sonnet worker removed them, no assertion changed. Scope ok; back to the gate.

## 2026-10-26 37 version-status (board Now)
- Branch feat/37-version-status from feat/36-seo-site at d5fc358. Sonnet worker, Normal, not a risky path (public GET, no token). Scope ok with mutation evidence (failed fetch as current failed five failure tests). Diff read, all new files; warn lines use fixed text so no URL or header reaches the log. Sent to the gate, no audit.

## 2026-10-26 38 sparkline (board Now)
- Branch feat/38-sparkline from feat/37-version-status at d3054ea. Opus worker, Risky (kc/insights/). Scope ok with mutation evidence (value import of uplot failed the lazy-load test). Diff read, two tests added, none changed. Worker dropped the "Touch or hover the chart for a day." hint since the tooltip replaces it; accepted by the rubric, no new copy written. Sent to the gate with an audit.

## 2026-10-26 39 dashboard-loaders (board Now)
- Branch feat/39-dashboard-loaders from feat/38-sparkline at d5032de. Opus worker, Risky (calls loadSeries in kc/insights/ with the GA and Cloudflare credentials). PublishStatus left to card 43, which owns its state. Scope ok with mutation evidence (full version to clients failed the client-props test; dropped access check failed the gate test). Diff read, all new files; credentials read from env on the server only, never props. Count-up, ring fill and bar growth not built, left for card 40. Sent to the gate with an audit.

## 2026-10-26 43 publish-status (board Now)
- Branch feat/43-publish-status from feat/40-dashboard-layout at 8e6df34. Opus worker, Risky (new Cloudflare call with a token). Scope ok with mutation evidence (previews counted failed the preview tests; failed fetch as published failed the three failure tests). Diff read, tests all new; result holds only state and time, project name checked against [a-z0-9-]+. No UI built: card 39 shipped without the PublishStatus render, so the dashboard still needs a small card to show it. Sent to the gate with an audit.

## 2026-10-26 41 dashboard audit (board Now)
- Opus security-auditor, read-only, on the working branch feat/43-publish-status. No high finding; one low (series cache key case), two latent (branch decoded twice, pagesProject from client config), three observations. Fixes queued in Next. Committed board, result and log only; suite left to the next card's gate.

## 2026-10-26 47 short-url-core (board Now)
- Branch feat/47-short-url-core from main at 4fbdb06. Sonnet worker, Normal, not a risky path (pure functions). Scope ok with mutation evidence (admin unreserved, decoded branch, no method check each failed their tests). Diff read, all new files. Worker's call: a short path whose third segment is main gives null so /other-owner/x/main is never rewritten; a collection named main gets no short form on that deep path. Sent to the gate, no audit.

## 2026-10-26 48 proxy-hook (board Now)
- Branch feat/48-proxy-hook from feat/47-short-url-core at c362f14. Opus worker, Risky (proxy.ts holds the /api/ Origin check). Scope ok with mutation evidence (hook above Origin check, return-to after rewrite, redirect on POST each failed their test). Diff read: 11-line hook after the Origin check and x-return-to; test loads a patched copy of proxy.ts against real NextRequest. Order check is a source test since every /api/ path is reserved. Sent to the gate with an audit.

## 2026-10-26 49 link-helper (board Now)
- Branch feat/49-link-helper from feat/48-proxy-hook at 86e0deb. Sonnet worker, Normal, no risky path (page hrefs only, /api/ strings pinned at 8 by a source test). First scope check failed on my brief listing components/repo files by bare name; fixed the brief's paths, scope ok with mutation evidence (shortHref as identity failed the dashboard, client-view and two short-url tests). Diff read: one import plus wrapped hrefs per file, tests only added. Worker did not write progress.md. Sent to the gate, no audit.

## 2026-10-26 50 editor-links (board Now)
- Branch feat/50-editor-links from feat/49-link-helper at 9369fe8. Sonnet worker, Normal, no risky path (page hrefs in upstream editor files; layout access code untouched). Card 51's guard not written yet, so the brief gave a scoped source test (short-href-editor.test.ts, /api/ count pinned at 12). Scope ok with mutation evidence (unwrapped links in entry.tsx and collection.tsx failed the wrap test). Diff read: import plus wrapped hrefs only. Sent to the gate, no audit.

## 2026-10-26 51 link-guard (board Now)
- Branch feat/51-link-guard from feat/50-editor-links at 17054e0. Sonnet worker, Normal, test only, no risky path. Scope ok with mutation evidence (unwrapped entry.tsx and repo-sidebar links and a stale allowlist entry each failed). Diff read: one new test, allowlist adds kc/dashboard.ts's base (only used through link(), which wraps). No unwrapped links found. Sent to the gate, no audit.

## 2026-10-26 59 sidebar-pages (board Now)
- Skipped 53: waits on 19, which waits on Rob's card 06. Branch feat/59-sidebar-pages from feat/51-link-guard at 1233d5a. Sonnet worker, Normal, no risky path. Scope ok with mutation evidence (file entry back at top level, h-8 item height each failed). Diff read: pure helper in kc/, one-line hook in repo-sidebar, aria-expanded on both disclosures, h-11 in ui/sidebar.tsx; Pages opens on its own path through the existing isActive default. Not checked in a browser. Sent to the gate, no audit.

## 2026-10-26 54 short-url audit (board Now)
- 53 still waits on 19. Opus security-auditor, read-only, on feat/59-sidebar-pages. No high; one low (auth-redirect backslash open redirect, predates feature), two bugs that should land before deploy 55 (dotted-file short links 404 via proxy.ts:19, segments[5] off by one at short-url.ts:79), latent notes. Cards queued on the board. Committed board, result and log only.

## 2026-10-26 short-url-dotted (board Now)
- 53 still waits on 19. On feat/59-sidebar-pages at 6a1ba48. Opus worker, Risky (proxy.ts). Scope ok with mutation evidence (old dotted rule failed dotted-file and dotted-root tests; unreserving images failed the public-file test). Diff read: isStaticPath helper in kc/short-url.ts, one-line proxy call, tests only added. Worker's call: no separate public/ guard since public names are in RESERVED; dotted /api/ paths now get the Origin check, which they skipped before. Worker did not write progress.md. Sent to the gate with an audit.

## 2026-10-26 60 dashboard-mockup (board Now)
- Branch feat/60-dashboard-mockup from main at 361c004. Opus worker, Risky (kc/insights/, publish token, staff-only server gate). Scope ok with mutation evidence (all four plan mutations failed their named tests). Diff read: a few old assertions rewritten to the new shapes, none dropped. Worker's calls: publish token KC_CF_PAGES_TOKEN falling back to CLOUDFLARE_ANALYTICS_TOKEN; pages counts only beside ga or cf; client history always says "changed"; Insights page still keys its series mixed-case. Not seen in a browser. Sent to the gate with an audit.

- 2026-10-26 park proxy-rewrite-origin: worker (Opus) found the briefed cause does not match Next 16.2.1 source; the real mismatch needs a log on the box, which the Never list keeps from the loop. No code changed.

- 2026-10-26 pass: no card to take. Now holds 53, 19 and 20, all waiting on Rob's card 06 (CMS guide page); Next is not pulled up without Rob.

- 2026-10-26 park proxy-rewrite-origin again: Opus worker found request.url is normalized to localhost too (spec-extension/request.js:50) and the adapter rewrites any rewrite host back to localhost (adapter.js:287-295), so proxy.ts cannot fix it. Its recommendation, untested: kc-cms server/deploy.sh ExecStart `-H localhost` instead of `-H 127.0.0.1` (check localhost resolves to 127.0.0.1, not ::1, on the box). Box change, Rob's. No code changed.

## 2026-10-26 62 add-editor-script (board Now)
- Branch feat/62-add-editor-script from main at 32d0c45. Opus worker, Risky (GitHub App credentials, invites, client emails). Brief file list named the new collaborator-invite.ts and package-lock.json by path after check-scope flagged them; both were allowed in words. Scope ok with mutation evidence (owner check removed failed "another owner is refused"). Diff read: invite logic moved out of the action unchanged, script takes mocked deps. Lock bump of esbuild 0.27 to 0.28 came with tsx 4.23.15. Not run on the box. Sent to the gate with an audit.

- 2026-10-26 dashboard-gaps (63): gated. Call: the new strings are the approved mockup's own text, so not sent back for the prose skills. Staff strip cause not found; worker removed the client-side gate, needs Rob's live GitHub check.
- 2026-10-27 github-verified-email (67): Opus worker, scope ok with mutation evidence, diff read; refusal uses better-auth's existing unable_to_get_user_info redirect, no plain message on the sign-in page yet. Sent to the gate with an audit.
- 2026-10-27 auth-redirect-backslash (68): Opus worker, scope ok with mutation evidence, diff read; tests cover kc/safe-redirect.ts, not getSafeRedirect (extensionless import). Sent to the gate with an audit.
- 2026-10-27 deps-update (69): Opus worker, two rounds (round one broke a test import moved in better-auth 1.7; brief widened to that test file). Scope ok, diff read: package bumps plus one import. Call: npm run build compiles, then stops on BASE_URL unset on this machine, not the bumps. nodemailer and zod highs left, fixes are majors. Sent to the gate with an audit.
- 2026-10-27 add-editor-repo-guard (72): sized Risky (GitHub App credentials, as card 62). Opus worker, scope ok with mutation evidence (4 new tests failed with the check removed), diff read. Not run against GitHub. Sent to the gate with an audit.
- 2026-10-27 load-config (73, plan 66 card 01): Sonnet worker, two rounds (round one's unknown-type test did not check which field; now checks the error range points at it, since core's message names no field). Scope ok with mutation evidence, diff read. Sent to the gate.
- 2026-10-27 customizations-register (74, plan 66 card 02): Opus worker, scope ok with mutation evidence (short-url entry removed names proxy.ts), diff read. Register is in kc/register only, no project.md risky path, so no audit. Sent to the gate.

- 2026-10-27 nodemailer-major parked: suite red on main (CHANGELOG-KC.md unclaimed by the customizations register after PR 79). Work on wip/nodemailer-major-10. Queued register-changelog at the top of Now.
- 2026-10-27 register-changelog (76): Sonnet worker, Small, scope ok with mutation evidence, diff is one line in the register. Sent to the gate.
- 2026-10-27 save-size-cap (77): call: uploads are JSON base64 on the same /files/ route as saves, so the proxy allows /files/ to 25 MB and the route refuses non-media over 1 MB before zod. Opus worker, two rounds (round one stopped for a missing test file in the list). Scope ok with mutation evidence, diff read, no fixture over 256 KB. Worker's call: a DELETE without a body needs no Content-Length. Sent to the gate with an audit.
- 2026-10-27 media-refs-wide (79): Opus worker, scope ok with mutation evidence, diff read; route now reads the repo through one recursive tree call. Sent to the gate with an audit.

- 2026-10-28 card 80 round 2: four new error strings in kc/insights/keys.ts (NOT_STAFF, TAKEN) were written by hand, not through prose/avoid-ai-writing/humanizer. Call by the rubric (security over UX): ship the security fix rather than park it over four staff-only error lines; a copy pass on them is owed. Rob may overrule.

## 2026-10-28T05:58Z AFK: kc.4 released and deployed
- Decision: released cards 85-89 as 2.1.8+kc.4 (commit 2f878ba, gated: suite, tsc, eslint, verify), deployed to the box (answering 200, public 200), tagged kc-2.1.8.4. Allowed by /afk --allow-outward deploy.
- Checked live: Henike header reads "Live site not set up yet"; staff strip shows GA4 561101654 and the Cloudflare site; Visits now reads 0 with real tiles, so the service account reads GA4. Zeros until the tracking tags are on the site.
- Rubric basis: clear-cut, the release Rob asked for.
- Parked (needs Rob): phone and desktop screenshots of BeSciWorks and Henike. Chrome's screenshot timed out three times (renderer unresponsive, likely the window minimized or hidden); page text loaded fine. Retake with Chrome in front.
- 2026-10-28 save-baseline (90): Sonnet worker, scope ok with mutation evidence, diff read (entry.tsx onSubmit now returns true or false; entry-form resets the baseline after a good save, keepValues). No risky path. Sent to the gate.
