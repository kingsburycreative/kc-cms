# Plan 108: the /help guide

From docs/PRD-help-guide.md and ADRs 0001 to 0003. Nine cards. Run in order; 01 and 03 do not depend on each other and 03 can go first if 01 is slow. Card 02 is a split from the brief's card 1: the brief says add a fix card if the check fails, and the code says it likely will (see 01), so the slot is reserved and 02 is dropped if 01 passes.

Facts used: restore (kc/history/restore.ts) only loads an old version's contentObject into the editor and keeps the current sha, so the normal save writes it back as a new edit. Core guide sections come from public/guides/besciworks/index.html: sections 1, 2, 4, 6, 7, 8, 9, 11 are shared; 3 (Weekly post), 5 (Papers) and 10 (search health) are BeSciWorks-specific. Version is package.json "2.1.8+kc.8". All module lists are in client repos' .pages.yml only; kc-cms-app has no client code.

Upstream rule: KC code goes under kc/. Upstream files touched are named per card. package.json, package-lock.json and db/migrations/ are never touched. No card here touches a risky path (kc/insights/, .github/workflows/, lib/auth.ts, lib/crypto.ts, lib/token.ts, app/api/); the /help route must stay public by living outside any auth layout, and card 03 states how.

### 01. Would restore have recovered Henike's wiped FAQ? (job: code)
Objective: find out, with a test over a fixture of the real Henike case (commit 98ce106 in D:\Dev\htdocs\henike-contracting: the Services page before and after the save that dropped the FAQ), whether opening the old version in History and saving gets the FAQ back. Read restore.ts, history-view.tsx and the entry save path to see if a field missing from the .pages.yml schema is dropped on save even when the restored content has it. Write the finding to `.claude/work/108-01-restore-check/finding.md` in plain words: yes, or no and why.
Files it may touch:
- `kc/tests/restore-wiped-field.test.ts` (new)
- `kc/tests/fixtures/henike-services-before.md` and `henike-services-after.md` (new, trimmed copies)
- `.claude/work/108-01-restore-check/finding.md` (new)
Done-test: `node --test kc/tests/restore-wiped-field.test.ts` passes and finding.md starts with the line `Result: restores` or `Result: does not restore`. The test asserts whichever is true; a "does not restore" result is a recorded finding, not a failure. Mutation check applies to any helper added.
Risky path: no. Client data is a fixture only; no network.

### 02. Fix restore so a wiped field comes back (job: code) (only if 01 says "does not restore")
Objective: make the restore-then-save path keep fields the schema does not list (or refuse to save over them), so the Henike case is recovered. Smallest hook into kc/; if the fix needs an upstream file (likely lib/serialization.ts or components/entry/entry.tsx), the card names it and the hook stays one line. Skip this card if 01 says "restores".
Files it may touch:
- `kc/history/restore.ts`
- `kc/tests/restore-wiped-field.test.ts` (flip the 01 assertion to the fixed behaviour)
- `kc/register/customizations.json` (an entry for any upstream file touched; its test fails otherwise)
- upstream, named by 01's finding.md, at most one hook line each
Done-test: `node --test kc/tests/restore-wiped-field.test.ts kc/tests/customizations.test.ts` passes. Mutation check: remove the fix; the restore test fails.
Risky path: no, unless 01 shows the fix reaches lib/crypto.ts or app/api/; then the card stops and is re-planned as risky.

### 03. /help route and page shell (job: code)
Objective: a public /help with a mobile-first shell (header, list of pages, content area), reachable signed out, and a version stamp on every page read from package.json ("Checked on KC CMS {version}, {date}"). The date is one constant per page in a front-matter-like header, so a recheck changes one line. Pages are plain files under kc/help/pages/ rendered by the shell; this card ships one placeholder page. avoid-ai-design runs on the shell. The only upstream hook is the route file app/help/page.tsx (and app/help/[slug]/page.tsx) delegating to kc/help/; confirm no middleware or layout above it requires sign-in, and that the sign-in redirect does not catch /help. Skeleton rule: pages are server-rendered, so none needed.
Files it may touch:
- `kc/help/shell.tsx`, `kc/help/pages.ts`, `kc/help/version.ts`, `kc/help/pages/placeholder.ts` (new)
- `app/help/page.tsx`, `app/help/[slug]/page.tsx` (new, upstream directory, one-line delegates)
- `kc/register/customizations.json` (entry for the new routes)
- `kc/tests/help-route.test.ts` (new)
Done-test: `node --test kc/tests/help-route.test.ts` passes: the version helper returns package.json's version, every page renders the stamp, the route files import only from kc/help, and no file under app/help imports lib/auth. Mutation check: hard-code a wrong version; the test fails.
Risky path: no, but the "public" requirement is checked by the test above because a sign-in gate there would hide sign-in help.

### 04. Screenshot script and changed-pictures report (job: code)
Objective: one command that opens the demo site (kc-test-site, with copies of each module's config) in headless Playwright at 375 and 1280 widths, takes every screenshot the pages name in a manifest (page, picture name, URL, steps), writes them to public/help/img/, and prints which guide pages have a picture that changed since the last run (by image hash kept in a manifest file). Fixtures only in tests; the script itself is the one place that talks to the demo site and is not run by the suite. No real client data. No npm install: Playwright must already be present; if it is not, the card parks.
Files it may touch:
- `kc/help/screenshots/run.mjs`, `kc/help/screenshots/manifest.json`, `kc/help/screenshots/compare.ts` (new)
- `kc/tests/help-screenshots.test.ts` (new)
Done-test: `node --test kc/tests/help-screenshots.test.ts` passes: compare.ts on two fixture folders lists exactly the pages whose picture hash differs and none that match, and the manifest names a picture file for every `<img>` a guide page uses. Mutation check: make compare report every page; the test fails.
Risky path: no. Running the script against the live demo is Rob's or the coordinator's step, not the card's.

### 05. Core guide pages (job: content)
Objective: split the shared BeSciWorks sections into core pages: sign in, find your way around, change the text on a page, add and remove an entry in a list, photos and files, format text, save and what Save does to the live site, undo and get an old version back (written from card 01's finding and 02's result), see who visits, getting help. Weekly, Papers and search health are not core. Copy goes through prose, then avoid-ai-writing and humanizer via the Skill tool; result.md lists each piece of copy. Words the reader does not know ("repo", "commit", "collection", "field") are not used. An agent that has never seen the CMS follows each task from the page once and the copy is rewritten where it stalls (a filter only). Pictures come from card 04.
Files it may touch:
- `kc/help/pages/core-*.ts` (new, one per page)
- `kc/help/pages.ts` (list the pages)
- `public/help/img/core-*.png` (from the script)
- `kc/tests/help-pages.test.ts` (new)
Done-test: `node --test kc/tests/help-pages.test.ts` passes: every core page has a title, a version stamp, a date, alt text on every image and no banned word (repo, commit, collection, field, markdown) in its text.
Human step: Rob reads each page and approves it in the coordinator's chat; a page he has not approved stays out of the nav (`approved: false` in its header) until he has. His read is the sign-off for understandable and accurate.
Risky path: no.

### 06. Henike module pages (job: content)
Objective: pages for what only Henike has, read from D:\Dev\htdocs\henike-contracting\.pages.yml: English and French post pairs (posts, posts-fr, linked by file name via the stem token), page pairs (home and others), project photo categories, Google reviews and rating (typed figures, hidden, follow reviews), business details. Same copy rule, same plain-words rule as 05. Screenshots from the demo site with a copy of the config. Each page header names its module (`module: henike`) so card 08 can list it.
Files it may touch:
- `kc/help/pages/henike-*.ts` (new)
- `kc/help/pages.ts`
- `public/help/img/henike-*.png` (from the script)
- `kc/tests/help-pages.test.ts` (extend, same checks as 05)
Done-test: `node --test kc/tests/help-pages.test.ts` passes, and every page with `module: henike` has a stamp, a date and alt text.
Human step: Rob reads each page and approves it; unapproved pages stay out of the nav.
Risky path: no.

### 07. BeSciWorks module pages (job: content)
Objective: pages for Papers (journal details, PDF), Weekly, What Works and Insight Briefs, from the BeSciWorks guide's sections 3 and 5 and D:\Dev\htdocs\besciworks\.pages.yml. Search health (section 10) is dropped unless Rob asks; say so in result.md. Same copy and plain-words rules as 05; header `module: besciworks`. These pages go live before /guides/besciworks redirects (08 waits on all of 05 to 07 approved).
Files it may touch:
- `kc/help/pages/besciworks-*.ts` (new)
- `kc/help/pages.ts`
- `public/help/img/besciworks-*.png` (from the script)
- `kc/tests/help-pages.test.ts` (extend)
Done-test: `node --test kc/tests/help-pages.test.ts` passes for every page with `module: besciworks`.
Human step: Rob reads each page and approves it.
Risky path: no.

### 08. In-app Help link listing only the client's modules (job: code)
Objective: the in-app Help link opens /help and lists the core guide plus only the modules that client's site has, read from that site's .pages.yml (a collection or file name matching a module's declared names). Relation to the board: this builds on card 19 (sidebar footer help links in kc/help.ts, `helpLinks()` now pointing at kingsburycreative.com/cms-guide, and it waited on card 06 which is Rob's page there) and replaces that target with /help; card 19 stays the card that adds the History and Insights items, this one only changes where the Help link goes and what it lists. Card 53 (`kc/tests/help-urls.test.ts`, no UI string with the long CMS address or the word "tile") stays and must still pass; the new link and page text count under it. If 19 has not run when this card is reached, this card does the Help part of 19 in kc/help.ts and says so in result.md. Upstream file: components/repo/repo-sidebar.tsx only if 19 has not already hooked it.
Files it may touch:
- `kc/help.ts`
- `kc/help/modules.ts` (new, name-to-module map)
- `kc/tests/help-modules.test.ts` (new)
- `kc/tests/sidebar.test.ts`, `kc/tests/help-urls.test.ts` (only to keep them correct)
- `components/repo/repo-sidebar.tsx` (upstream, one-line hook, only if not already there)
Done-test: `node --test kc/tests/help-modules.test.ts kc/tests/sidebar.test.ts kc/tests/help-urls.test.ts` passes: a config with `papers` lists Papers and not Menu; a config with none lists only core; `helpLinks()` points at /help. Mutation check: list every module for every client; the test fails.
Risky path: no; it reads the config the client already receives.

### 09. Redirect /guides/besciworks to /help (job: code)
Objective: after Rob has approved /help (cards 05 to 07 approved), make /guides/besciworks answer a permanent redirect to /help, and remove public/guides/besciworks/ (html and img/) in the same card, so the old guide stops being a second copy to keep up. Do not run before Rob says go. Use next.config.ts redirects only if it already holds KC redirects; else a one-line hook into kc/.
Files it may touch:
- `kc/help/redirects.ts` (new)
- `next.config.ts` (upstream, one-line hook if needed; named here)
- `public/guides/besciworks/` (delete)
- `kc/register/customizations.json`
- `kc/tests/help-redirect.test.ts` (new)
Done-test: `node --test kc/tests/help-redirect.test.ts` passes: the redirect list has `/guides/besciworks` to `/help` with permanent true, and no file remains under public/guides/besciworks. Mutation check: set permanent false; the test fails.
Risky path: no. Human step: Rob's go-ahead on /help comes first.
