# Plan: short addresses, and the help files for this push (Rob, 2026-10-26)

Paths are relative to `D:\Dev\htdocs\kc-cms-app` unless a card says otherwise. Tests run with `node --test --test-reporter=tap "kc/tests/**/*.test.ts"`, then `npx tsc --noEmit && npx eslint kc`. Cards 47 to 53 and 54 to 58 are the two features. Numbering continues from 46.

## Design (Feature A)

`kc/short-url.ts` holds all the logic, pure, no imports. `/besciworks/history` rewrites to `/kingsburycreative/besciworks/main/history`. The owner and branch are constants (`kingsburycreative`, `main`), so a short path can never name another owner or branch. `/kingsburycreative/<repo>/main/...` answers 308 to `/<repo>/...` for GET and HEAD only. Everything else is untouched. `/<owner>/<repo>` with no branch stays as it is: it is the default-branch resolver the invite email links to, and it redirects client-side to the short form for `main`. Access is not touched: layouts still run `getToken` and `assertBranchAllowed` on the rewritten params, so the short URL reaches exactly what the full one did.

## Flags

1. **Reserve `kingsburycreative` as a repo name too.** A repo called `kingsburycreative` (the KC site) would make `/kingsburycreative/...` both a full path and a short one. It keeps its full path.
2. **The short form means branch `main`, hard-coded.** Resolving the real default branch needs a GitHub call in the proxy. A repo whose default is not `main` keeps full URLs. Say so if any client repo differs.
3. **The 308 compares the raw branch segment to `main`.** `%6Dain` is not redirected, so the branch lock's exact-name check still sees it.
4. **`proxy.ts` is risky.** It carries the Origin check on `/api/` writes. The hook goes after that check, and `x-return-to` stays the original path so sign-in returns to the short URL.
5. **Sidebar highlight compares `usePathname()` (browser URL) to each href.** One unconverted href loses its highlight. Card 51 is a source scan that fails on any unwrapped page link, which also protects future upstream merges.
6. **Left alone on purpose:** `lib/actions/collaborator.ts:161` (invite email) and `app/api/collaborator-invites/[token]/route.ts:54` build full paths. Both are risky paths, and the 308 covers them. A dotted repo name (`x.github.io`) hits the proxy's static-asset skip and gets no short form.
7. **Folded Pages menu has no card** in any plan I can read (15, 38, 39). Card 58 describes it only once someone names the card that builds it.
8. **`kc-cms/docs/NEW-CLIENT.md` is at 117 lines, its test caps 120, and the test lists 8 steps while the doc has 9.** Unverified whether the test passes today. Card 52 fixes that first.
9. **The guide's sign-in link is the bare domain**, so there is no URL to rewrite. Only the bookmark advice changes.
10. **In-app help grep found no text naming the old URLs.** Card 53 is a guard plus fixes if card 19's `kc/help.ts` adds any.
11. The audit (54) precedes the deploy because deploy waits on it, so it is not the last card. Feature B touches no risky path.
12. I cannot edit `kc/BOARD.md`; the coordinator adds 47 to 58.

## Cards

### 47. Short-URL core
Role: `implementer`. Risky path: no (pure functions; the audit covers use).
- `kc/short-url.ts`
- `kc/tests/short-url.test.ts`
- `kc/tests/short-url-reserved.test.ts`

Exports `resolveShort(pathname, method)` returning `{ rewrite }`, `{ redirect }` or `null`; `shortHref(fullPath)`; `RESERVED`. Reserved names are every top-level segment under `app/` (route groups flattened, dynamic segments dropped: `api`, `auth`, `sign-in`, `settings`, `admin`), plus `_next`, `images`, `favicon.ico` and `kingsburycreative`, compared after one decode and lowercase. A first segment that decodes to something with `/`, `\`, `..`, a control character or a leading `.` gives `null`. `shortHref` shortens only owner `kingsburycreative` (any case), branch exactly `main`, non-reserved repo, with query and hash kept; anything else is returned as given.

Done-test: `node --test kc/tests/short-url.test.ts kc/tests/short-url-reserved.test.ts`, then `npx tsc --noEmit && npx eslint kc`. Asserts: `/besciworks`, `/besciworks/`, `/besciworks/collection/papers/edit/a%2Fb.md?x=1` rewrite to the full path with query kept; `/kingsburycreative/besciworks/main/history` redirects to `/besciworks/history`; `/kingsburycreative/besciworks/%6Dain` and `/other-owner/x/main` and `/kingsburycreative/x/dev/y` give `null`; a POST to a full path gives `null`; `/api/x`, `/sign-in`, `/%61pi/x`, `/Admin`, `/_next/x`, `/kingsburycreative` give `null`; `/kingsburycreative//evil.com` and `//evil.com` never yield a redirect starting `//`; for 20 sample full paths `resolveShort(shortHref(p))` rewrites back to `p`. Reserved test reads `app/` and `public/` from disk and fails if a top-level name is missing from `RESERVED`. Mutation check: remove `admin` from `RESERVED` (reserved test fails), compare the branch decoded (the `%6Dain` test fails), drop the method check (POST test fails).

### 48. Hook the proxy
Role: `implementer`. Risky path: yes (`proxy.ts` enforces the `/api/` Origin check). Waits on 47.
- `proxy.ts` (upstream file; the smallest hook, about 10 lines after the existing Origin check and before `NextResponse.next`)
- `kc/tests/short-url-proxy.test.ts`

A redirect answers `NextResponse.redirect(url, 308)` with the pathname swapped on a clone of `nextUrl`. A rewrite uses `NextResponse.rewrite(url, { request: { headers } })`, with `x-return-to` still set from the original path and query.

Done-test: `node --test kc/tests/short-url-proxy.test.ts`, then `npx tsc --noEmit && npx eslint kc`. Builds `NextRequest` objects (if the runner cannot load `next/server`, the same asserts run as source tests plus card 47's function tests; say which). Asserts: a short GET is rewritten and carries `x-return-to` equal to the short path; a full GET answers 308 with `Location` on the same host; a cross-origin POST to `/api/x/y/main/files/a` still answers 403 and is never rewritten; `/api/webhook/github` unchanged; `/sign-in` and `/_next/x` pass through; the source of `proxy.ts` imports nothing about sessions, tokens or fetch. Access test: for 10 repos (reachable, unreachable, non-main default), the rewritten pathname equals the full pathname byte for byte, so the downstream checks see the same params. Mutation check: move the hook above the Origin check (the 403 test fails), set `x-return-to` after the rewrite (the return-to test fails), redirect on POST (the method test fails).

### 49. Link helper in `kc/` and the repo chrome
Role: `implementer`. Risky path: no. Waits on 47.
- `kc/client-view.ts` (line 71)
- `kc/dashboard.ts` (lines 31 and 71)
- `kc/dashboard.tsx` (line 48)
- `kc/history/history-view.tsx` (lines 52, 134, 136)
- `components/repo/repo-nav.tsx`
- `components/repo/repo-sidebar.tsx`
- `components/repo/repo-dropdown.tsx`
- `components/repo/repo-branches.tsx`
- `components/repo/repo-latest.tsx`
- `components/repo/repo-action-buttons.tsx` (line 381 only)
- `components/repo/repo-templates.tsx` (line 101)
- `kc/tests/dashboard.test.ts`
- `kc/tests/client-view.test.ts`

Wrap each page link in `shortHref(...)` and nothing else; `/api/`, `github.com` and `raw.githubusercontent.com` strings stay. Upstream files named here are touched only on those lines.

Done-test: `node --test kc/tests/dashboard.test.ts kc/tests/client-view.test.ts kc/tests/short-url.test.ts`, then `npx tsc --noEmit && npx eslint kc`. Asserts: for owner `kingsburycreative`, branch `main`, `quickActions` and `dashboardTiles` hrefs start `/besciworks/`; for owner `acme` or branch `dev` they keep the full form; the one-repo client link is `/besciworks`; no `/api/` string changed (a source test compares the `/api/` literal count with a number recorded from the current files). Mutation check: make `shortHref` return its input (the dashboard and client-view tests fail).

### 50. Link helper in the editor pages
Role: `implementer`. Risky path: no. Waits on 49 (same helper, different files).
- `components/entry/entry.tsx`
- `components/entry/entry-history.tsx`
- `components/collection/collection.tsx`
- `components/media/media-view.tsx`
- `components/empty-create.tsx`
- `fields/core/file/edit-component.tsx` (line 320)
- `fields/core/image/edit-component.tsx` (line 268)
- `app/(main)/[owner]/[repo]/[branch]/settings/page.tsx` (line 9)
- `app/(main)/[owner]/[repo]/[branch]/layout.tsx` (line 74 only; the access code above it is not touched)
- `app/(main)/[owner]/[repo]/page.tsx` (line 13)

Done-test: `node --test kc/tests/short-url-links.test.ts` (card 51 writes it; this card runs it red-to-green) plus the full suite, `npx tsc --noEmit && npx eslint kc`. Mutation check: unwrap one link in `entry.tsx` and one in `collection.tsx` and name the failing test.

### 51. Link coverage guard
Role: `implementer`. Risky path: no. Writes the test first; waits on 49; run with 50.
- `kc/tests/short-url-links.test.ts`

Scans `components/`, `fields/`, `kc/` (not `kc/tests/`) and `app/(main)/` for template literals starting `` `/${...owner...}/${...repo...} `` and requires `shortHref(` on the same statement unless the line is in a named allowlist with a reason (`/api/`, `github.com`, `raw.githubusercontent.com`, `lib/actions/collaborator.ts`). Done-test: `node --test kc/tests/short-url-links.test.ts` green after card 50; asserts the allowlist has no entry that no longer matches a line. Mutation check as card 50.

### 52. kc-cms docs for the new settings and the short address (outside kc-cms-app)
Role: `implementer`, in `D:\Dev\htdocs\kc-cms`, by a person or a session in that repo. Risky path: no. Does not wait on a deploy; waits on card 35 and 43 for key names.
- `D:\Dev\htdocs\kc-cms\docs\NEW-CLIENT.md`
- `D:\Dev\htdocs\kc-cms\server\tests\new-client-doc.test.mjs`
- `D:\Dev\htdocs\kc-cms\README.md`

Adds one step (10): per-site settings under `kc:` in `.pages.yml`: `client`, `site` (https only, enables "See live site"), `actions` (quick-action labels by collection name), `pagesProject` (Cloudflare Pages project, enables publish status), with BeSciWorks' values; and the address rule: `cms.kingsburycreative.com/<repo>`, full paths still work, a repo called `sign-in`, `api`, `admin` and the other reserved names cannot get a short form, so name client repos with that list in mind. Step 6 says what to send the client: the short link. The test is updated for the new step order and the line cap is raised deliberately; first run it as-is and record whether it passes today.

Done-test: from `D:\Dev\htdocs\kc-cms`, `node --test server/tests/new-client-doc.test.mjs`: 10 steps in order, the four key names appear in step 10, step 6 contains no `/kingsburycreative/` path, quoted `.pages.yml` lines still match the starter. Mutation check: delete the `pagesProject` line (a test fails).

### 53. In-app help text guard
Role: `implementer`. Risky path: no. Waits on 19 and 40.
- `kc/tests/help-urls.test.ts`
- `kc/help.ts` (only if it names an old URL or the tile dashboard)
- `kc/client-view.ts` (comment only, line 5 and 74)

Grep today finds no UI string with the long address; the dashboard name is "<Client> Dashboard". Adds a test over every `.ts` and `.tsx` string in `kc/` and `components/` that none contains `cms.kingsburycreative.com/kingsburycreative` or "tile". Copy changes (if any) go through `prose`, `avoid-ai-writing`, `humanizer`, listed in result.md.

Done-test: `node --test kc/tests/help-urls.test.ts`, then `npx tsc --noEmit && npx eslint kc`. Mutation check: add the long URL to a label (the test fails).

### 54. Security audit of short addresses
Role: `security-auditor`. Risky path: yes. Waits on 48 and 50.
- `kc/short-url.ts`
- `proxy.ts`
- `app/(main)/[owner]/[repo]/[branch]/layout.tsx`
- `kc/branch-lock-server.ts`
- `kc/tests/short-url-proxy.test.ts`

Done-test: result names each finding by file and line, none high open, and answers: can any short path reach a repo, owner or branch the full URL could not (decoded and double-encoded first segments, `%2F`, `..`, trailing dots, case); can a repo name shadow or hijack a route (reserved list vs `app/` and `public/`); can the 308 become an open redirect; does the Origin check still run first for `/api/`; does a client session still get only `main`; does the redirect or rewrite differ for a repo that does not exist versus one the user cannot read (no existence oracle). Suite green.

### 55. Deploy short addresses (waiting on Rob)
Role: waiting on Rob. Risky path: no (box step). Waits on 54. Can be the same deploy as 42 and 32.
- `D:\Dev\htdocs\kc-cms\server\deploy.sh`

Done-test: after deploy, `curl -sI https://cms.kingsburycreative.com/kingsburycreative/besciworks/main/history` shows 308 and `Location: /besciworks/history`; `curl -sI https://cms.kingsburycreative.com/besciworks` redirects to `/sign-in?redirect=%2Fbesciworks` when signed out; signed in as the `+kctest` client at 375, `/besciworks` shows the dashboard, the sidebar highlights the current page, an editor save returns to a short URL, `/kingsburycreative/besciworks/dev` shows Access denied or the lock page as before, and `/sign-in`, `/admin` and `/api/app/version` are unchanged.

### 56. Rob signs the capture browser in as +kctest (waiting on Rob)
Role: waiting on Rob (the sign-in code goes to his inbox). Risky path: no. Waits on 55 and 42. Context memory says the `+kctest` OTP path is unproven through the limit.
- (none; a signed-in headless Chrome profile in the scratchpad, windowsHide)

Done-test: `GET /besciworks` in that profile returns the dashboard HTML with "Dashboard" in the title and no redirect to `/sign-in`.

### 57. Retake the guide screenshots
Role: `implementer`. Risky path: no. Waits on 56. Outside kc-cms-app.
- `D:\Dev\htdocs\kingsburycreative\clients\besciworks\cms-guide\img\01-sign-in.png`
- `D:\Dev\htdocs\kingsburycreative\clients\besciworks\cms-guide\img\02-dashboard.jpg`
- `D:\Dev\htdocs\kingsburycreative\clients\besciworks\cms-guide\img\08-page-history.jpg`
- `D:\Dev\htdocs\kingsburycreative\clients\besciworks\cms-guide\img\09-restore.jpg`
- `D:\Dev\htdocs\kingsburycreative\clients\besciworks\cms-guide\img\11-insights.jpg`
- `D:\Dev\htdocs\kingsburycreative\clients\besciworks\cms-guide\img\12-quick-actions.jpg` (new)
- `D:\Dev\htdocs\kingsburycreative\clients\besciworks\cms-guide\img\13-publish-status.jpg` (new)

Headless Chrome, `windowsHide: true`, same sizes as the current images (1165x874 and 699x524). Crop out any email address and hide none of the BeSciWorks content; check each at full size by eye.

Done-test: `node -e` size check prints each file's width and height matching the `width` and `height` attributes in `index.html`, and each file is newer than 2026-10-26.

### 58. Guide copy and PDF
Role: `implementer`. Risky path: no. Waits on 57 (and a card for the folded Pages menu, flag 7). Outside kc-cms-app.
- `D:\Dev\htdocs\kingsburycreative\clients\besciworks\cms-guide\index.html`
- `D:\Dev\htdocs\kingsburycreative\clients\besciworks\cms-guide\BeSciWorks-CMS-Guide.pdf`
- `D:\Dev\htdocs\kingsburycreative\clients\besciworks\cms-guide\guide.test.mjs` (new; the runner of that repo is unread, so this runs with `node --test`)

Section 1 gets the short bookmark (`cms.kingsburycreative.com/besciworks`) and says the old long address still works. Section 2 describes the new dashboard (quick actions, visits chart, search health, recent changes) and drops the grid of buttons. New short sections: quick actions, publish status ("Published 2 minutes ago", publishing, did not publish), See live site, the folded Pages menu. Insights and undo sections match the new screens. Copy goes through `prose`, then `avoid-ai-writing` and `humanizer`; each paragraph is listed in the result. PDF from headless Chrome print, `windowsHide: true`.

Done-test: `node --test clients/besciworks/cms-guide/guide.test.mjs` from `D:\Dev\htdocs\kingsburycreative`: every `<img>` has non-empty `alt` and a file on disk; no `grid of buttons`; the words "quick actions", "Published" and "See live site" appear; no em dash; the page has one `<h1>`; each section id has a nav link; the PDF is newer than `index.html` and has at least as many pages as before. Mutation check: delete one `img` file (the test fails).

### 59. Sidebar: fold the single pages under one Pages entry, 44px items
Role implementer. Risky path: no. Rob approved this in the round-2 dashboard mockup, 2026-10-26 (`.claude/work/39-plan-dashboard/mockup/index.html` shows it). Runs before the deploy card 55, so it ships in the same deploy.
(a) In the site sidebar, every `.pages.yml` entry of `type: file` (single pages: Home page, About page...) folds under one collapsible "Pages" entry, closed by default and open when the current page is one of them; collections (Weekly, What Works, Insight Briefs, Papers), Media and the Site group stay as they are, collections first. The disclosure is a real button with `aria-expanded` that changes, works by keyboard, and the open state survives navigation within the site (derive it from the path, no storage needed). The phone menu gets the same grouping.
(b) Sidebar items are at least 44px tall at every width (`components/ui/sidebar.tsx` uses `h-8`). Smallest edit in the upstream file, or a `kc/` override if the project's upstream rules prefer that; say which in result.md.
Files: the sidebar component(s) that render the repo navigation (find them: `components/repo/` and `components/ui/sidebar.tsx`), a pure helper in `kc/` that groups `.pages.yml` content entries (file vs collection), `kc/tests/sidebar-groups.test.ts`.
Done-test: through the project's runner, `kc/tests/sidebar-groups.test.ts` asserts the grouping from a fixture `.pages.yml` (files under Pages, collections first, Media and Site untouched), that the Pages group is open when the current path is a file entry and closed otherwise, and a source test that the sidebar item height class is 44px or more and the disclosure carries `aria-expanded`; then `npx tsc --noEmit && npx eslint kc`. Mutation check: put a file entry back at the top level, then set the item height to `h-8`.
