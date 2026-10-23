# Plan: the client experience (Rob's review, 2026-10-23)

## Decisions

- Card 04: the email logo is `D:\Dev\htdocs\kingsburycreative\img\logos\kc-wordmark-logo.png`; card 12 copies it to `public/images/email-logo.png`. Resolved.
- Card 05: approved, one nullable `name` column on `collaborator_invite`. Resolved.
- PRs may merge this session.

Rob signed in to BeSciWorks as a client and listed eleven fixes. This plan
turns them into cards, folding five existing board cards in rather than
duplicating them: client-branch-lock (01, rescoped), client-identity-redact
(02, extended), client-third-party (08, extended with decisions 4 and 9),
site-dashboard (16), advanced-toggle (20, file corrected). Every change reaches
BeSciWorks, Henike and kc-test-site on the next deploy.

## Wrong or missing in the existing plan

1. **client-branch-lock as written leaves most routes open.** It calls the
   helper from `lib/api-repo-context.ts` and the layouts, but seven routes
   under `app/api/[owner]/[repo]/[branch]/` call `getToken` directly (entries,
   entry history, files POST and DELETE, rename, branches, actions). Card 01
   covers every route and adds a test that fails on any new one.
2. **advanced-toggle names the wrong file.** `components/repo/repo-nav.tsx` and
   `components/repo/repo-dropdown.tsx` have no importers. The Admin group
   lives in `components/repo/repo-sidebar.tsx:343-386` and `:622`.
3. **The brand test misses "Pages CMS" in the invite email.** The words are
   split across `components/email/invite.tsx:79-80`, and
   `kc/tests/brand.test.ts:86-94` checks line by line. Card 11 fixes both.
4. **Merged is not closed.** The box runs `67bdaa5`. Nobody gets an invite
   until card 03 has deployed the lock.
5. **History cannot say who.** Commit identity defaults to the app
   (`lib/commit-message.ts:30`), so every client edit is authored by the bot.
   My call: card 14 flips the KC default to the signed-in user in code, not
   per site, so new clients need no `.pages.yml` step.
6. **A name on invite needs a database column.** `project.md` parks any
   migration, so card 05 asks Rob.
7. **Insights already has an icon**, under a "Site" label, and shows only for
   sites with a GA4 map. BeSciWorks has none yet. I read decision 11 as a
   top-level item.
8. **GitHub sign-in moves behind `/sign-in?staff=1`** (my call; Rob bookmarks
   it). `lib/auth.ts:37-41` still links a GitHub login to a client's account
   by matching email, which makes them look like staff. The audit (23)
   decides if that needs closing.
9. `.claude/context.md` says a STOP file exists. There is none.
10. Restoring a deleted entry is not covered.

## Cards

### 01. Lock clients to the default branch (board: client-branch-lock)
Role: `implementer`. Risky path: yes (`app/api/`).
- `kc/branch-lock.ts`
- `kc/tests/branch-lock.test.ts`
- `lib/api-repo-context.ts`
- `app/(main)/[owner]/[repo]/layout.tsx`
- `app/(main)/[owner]/[repo]/[branch]/layout.tsx`
- `app/api/[owner]/[repo]/[branch]/branches/route.ts`
- `app/api/[owner]/[repo]/[branch]/entries/[path]/route.ts`
- `app/api/[owner]/[repo]/[branch]/entries/[path]/history/route.ts`
- `app/api/[owner]/[repo]/[branch]/files/[path]/route.ts`
- `app/api/[owner]/[repo]/[branch]/files/[path]/rename/route.ts`
- `app/api/[owner]/[repo]/[branch]/actions/route.ts`
- `app/api/[owner]/[repo]/[branch]/actions/[runId]/route.ts`

Done-test: `node --test kc/tests/branch-lock.test.ts` passes. It asserts the
pure decision (installation + default branch passes, installation + other
branch refused, user token passes any branch); that every `route.ts` under
`app/api/[owner]/[repo]/[branch]/` that calls `getToken` or
`getRepoReadContext` also calls the lock helper (found by walking the folder,
so a new route without it fails); that the branches POST refuses a user
without `githubUsername`; and that both layouts give a client an empty branch
list. Mutation check: remove the call from the files route and the walk test
fails.

### 02. Strip identity from history and actions (board: client-identity-redact)
Role: `implementer`. Risky path: yes (`app/api/`).
- `kc/redact.ts`
- `kc/tests/redact.test.ts`
- `types/api.ts`
- `app/api/[owner]/[repo]/[branch]/entries/[path]/history/route.ts`
- `app/api/[owner]/[repo]/[branch]/actions/route.ts`
- `app/api/[owner]/[repo]/[branch]/actions/[runId]/route.ts`
- `components/entry/entry-history.tsx`

Done-test: `node --test kc/tests/redact.test.ts` passes. The history mapper
keeps exactly `sha`, `parentSha`, `date`, `authorName` (card 17's diff needs
the parent); an email-shaped author name comes back as the part before "@";
the actions mapper blanks email, GitHub username and run link; a source test
per route shows the mapper is applied for `source === "installation"` and
`all=1` is refused. Mutation check: return raw `listCommits` data from the
history route.

### 03. Deploy the lock before any client invite
Role: waiting on Rob. Risky path: no (box step).
- `D:\Dev\htdocs\kc-cms\server\deploy.sh`

Done-test: after the deploy, signed in as the `+kctest` client, Rob (or the
one background agent) runs `curl` against
`/api/<owner>/kc-test-site/<any-other-branch>/entries/<path>?name=<name>` and
gets 403. Only then do Kim and David get invites.

### 04. Choose the email logo
Role: resolved by Rob, 2026-10-23. Risky path: no.
- `D:\Dev\htdocs\kingsburycreative\img\logos\kc-wordmark-logo.png`

Decided: the wordmark PNG above is the email logo (the SVG won't do, because
Gmail and Outlook do not show SVG). Card 12 copies it to
`public/images/email-logo.png`. `Test-Path` on the named file is true.

### 05. Approve one migration for the invite name
Role: resolved by Rob, 2026-10-23. Risky path: no.
- `db/schema.ts`

Decided: yes. Card 13 adds one nullable `name` text column to
`collaborator_invite`, the only place a name can wait before the user exists.

### 06. Write the CMS guide page
Role: waiting on Rob (a session in `D:\Dev\htdocs\kingsburycreative`). Risky path: no.
- `D:\Dev\htdocs\kingsburycreative\pages\cms-guide.php`
- `D:\Dev\htdocs\kingsburycreative\router.php`
- `D:\Dev\htdocs\kingsburycreative\sitemap.php`

Done-test: `curl -sI https://kingsburycreative.com/cms-guide` returns 200. Copy
goes through the `prose` skill. Card 19 links here and does not ship before
this one is live.

### 07. Henike's client name and the onboarding doc
Role: waiting on Rob (Henike's own session owns its `.pages.yml`). Risky path: no.
- `D:\Dev\htdocs\henike-contracting\.pages.yml`
- `D:\Dev\htdocs\kc-cms\docs\NEW-CLIENT.md`

Done-test: `Select-String "client:" D:\Dev\htdocs\henike-contracting\.pages.yml`
finds the name Rob confirms; it falls back to "Henike Contracting" from the
repo name today. BeSciWorks and kc-test-site already set theirs. NEW-CLIENT
step 6 names the invite's name field, the guide URL and the sender
"Kingsbury Creative".

### 08. No GitHub links or third-party avatars for clients (board: client-third-party)
Role: `implementer`. Risky path: no.
- `kc/client-view.ts`
- `kc/avatar.ts`
- `kc/tests/client-view.test.ts`
- `kc/tests/avatar.test.ts`
- `components/user.tsx`
- `components/file/file-options.tsx`
- `fields/core/image/edit-component.tsx`
- `fields/core/file/edit-component.tsx`
- `components/entry/entry-history.tsx`
- `components/actions/actions-page.tsx`

Done-test: `node --test kc/tests/client-view.test.ts kc/tests/avatar.test.ts`
passes. `viewFor` returns `githubLinks: false` for a client and true for a
GitHub user; a source test shows each of the six component files reads the
flag; `initialFor({ name: "", email: "kim@example.com" })` is "K", a set name
wins, and "U" is never returned; `components/user.tsx` builds no
`unavatar.io` URL. `repo-dropdown.tsx` stays untouched (no importers).

### 09. Clients never see a GitHub sign-in
Role: `implementer`. Risky path: no (UI only; `lib/auth.ts` untouched).
- `kc/sign-in-methods.ts`
- `kc/client-view.ts`
- `kc/tests/sign-in-methods.test.ts`
- `components/sign-in.tsx`
- `components/settings/identities.tsx`

Done-test: `node --test kc/tests/sign-in-methods.test.ts` passes.
`signInMethods({ staff: false })` is `["email"]` and `{ staff: true }` adds
`"github"`; a source test shows `sign-in.tsx` renders the GitHub button only
through that function, and `identities.tsx` hides the GitHub row and its
Connect button when `viewFor(true).settings.connectGithub` is false.

### 10. Clients cannot delete single-file entries
Role: `implementer`. Risky path: yes (`app/api/`).
- `kc/content-ops.ts`
- `kc/tests/content-ops.test.ts`
- `components/entry/entry.tsx`
- `app/api/[owner]/[repo]/[branch]/files/[path]/route.ts`

Done-test: `node --test kc/tests/content-ops.test.ts` passes.
`clientMayDelete` refuses `type: file` with an installation token and allows
collection entries and every GitHub-token delete; a source test shows the
DELETE handler calls it after the schema is resolved and `entry.tsx` folds it
into `canDelete`. Mutation check: drop the route call.

### 11. White-label the three emails
Role: `implementer`. Risky path: no (`lib/auth.ts` keeps its subject line).
- `kc/email.ts`
- `kc/tests/email.test.ts`
- `kc/tests/brand.test.ts`
- `components/email/invite.tsx`
- `components/email/login.tsx`
- `components/email/collaborator-added.tsx`
- `lib/actions/collaborator.ts`
- `lib/mailer.ts`

Done-test: `node --test kc/tests/email.test.ts kc/tests/brand.test.ts` passes.
`withSenderName("noreply@kingsburycreative.com")` gives
`Kingsbury Creative <noreply@kingsburycreative.com>` and leaves a From that
already has a name alone; subjects use the site's `kc.client` name (read
server-side with `getConfig`, falling back to `clientName()`) and contain no
`owner/repo`; a source test finds no `invitedByUrl`, `github.com` or
"Pages CMS" in the three templates after collapsing whitespace across lines,
which is the fix to the brand test. Copy drafted through the `prose` skill.

### 12. Put the KC logo in the emails
Role: `implementer`. Risky path: no.
- `public/images/email-logo.png`
- `kc/brand/make-email-logo.ts`
- `kc/tests/brand.test.ts`
- `components/email/invite.tsx`
- `components/email/login.tsx`
- `components/email/collaborator-added.tsx`

Done-test: `node --test kc/tests/brand.test.ts` passes. It reads the PNG's
IHDR and asserts each template's `<Img>` width and height keep its aspect
ratio within 1% and the file is at least twice the displayed width. The
dot generator is deleted so nothing can overwrite the logo. The in-CMS dot
stays.

### 13. Name the client when inviting them
Role: `implementer`. Risky path: no by the list, but `lib/collaborator-access.ts`
runs in the sign-in hook, so card 23 reads it. The migration is approved (05).
- `db/schema.ts`
- `db/migrations/`
- `kc/invite-name.ts`
- `kc/tests/invite-name.test.ts`
- `components/collaborators.tsx`
- `lib/actions/collaborator.ts`
- `lib/collaborator-access.ts`

Done-test: `node --test kc/tests/invite-name.test.ts` passes.
`nameToApply(current, invited)` returns the invite name only when the user's
name is blank, trimmed, at most 80 characters, with control characters
refused; a source test shows the binding sets `user.name` only through it.

### 14. Commits carry the editor's name
Role: `implementer`. Risky path: no.
- `kc/commit-identity.ts`
- `kc/tests/commit-identity.test.ts`
- `lib/commit-message.ts`

Done-test: `node --test kc/tests/commit-identity.test.ts` passes. With no
setting the identity is `"user"`; an explicit `identity: app` in `.pages.yml`
or on a schema still wins; a source test shows `resolveCommitIdentity` takes
its default from the kc module.

### 15. History data: site feed and old versions
Role: `implementer`. Risky path: yes (`app/api/`).
- `kc/history/site.ts`
- `kc/history/ref-check.ts`
- `kc/tests/history-site.test.ts`
- `kc/tests/fixtures/history/`
- `app/api/[owner]/[repo]/[branch]/history/route.ts`
- `app/api/[owner]/[repo]/[branch]/entries/[path]/route.ts`

Done-test: `node --test kc/tests/history-site.test.ts` passes. From fixtures
it asserts the site feed merges per-path commit lists newest first, caps at the
limit, drops `.pages.yml` and settings paths for clients, and runs every item
through card 02's mapper; `refIsOnBranch` accepts only `ahead` or `identical`
from a compare, so a sha from another branch cannot be read past card 01's
lock; source tests show the new route uses the lock helper and the entries
route checks `ref` before `getContent`. Mutation check: skip the ref check.

### 16. Site dashboard as the landing page (board: site-dashboard)
Role: `implementer`. Risky path: no (data comes from card 15). Waits on 15.
- `kc/dashboard.ts`
- `kc/dashboard.tsx`
- `kc/tests/dashboard.test.ts`
- `app/(main)/[owner]/[repo]/[branch]/page.tsx`

Done-test: `node --test kc/tests/dashboard.test.ts` passes. Tiles are a pure
function of a config (groups, files, collections, Media, a History tile,
Insights only with access); recent edits keep title, date, author name and
path only; a source test shows the page no longer redirects to the first
content item. Checked at 375 and 1280 wide.

### 17. History pages with the change shown
Role: `implementer`. Risky path: no. Waits on 15.
- `kc/history/diff.ts`
- `kc/tests/history-diff.test.ts`
- `kc/history/history-view.tsx`
- `app/(main)/[owner]/[repo]/[branch]/history/page.tsx`
- `app/(main)/[owner]/[repo]/[branch]/history/entry/page.tsx`
- `components/entry/entry-history.tsx`

Done-test: `node --test kc/tests/history-diff.test.ts` passes. Two content
objects give changed, added and removed fields with schema labels; nested
objects and lists are labelled by path; the body diffs line by line;
unchanged fields are omitted. A source test finds no `github.com` in any file
listed, and "See all changes" points at the in-CMS page.

### 18. Restore an old version
Role: `implementer`. Risky path: no (save goes through the existing POST). Waits on 17.
- `kc/history/restore.ts`
- `kc/tests/history-restore.test.ts`
- `kc/history/history-view.tsx`
- `components/entry/entry.tsx`

Done-test: `node --test kc/tests/history-restore.test.ts` passes.
`restoreState` keeps the current sha and returns the old content as form
values; a source test shows `entry.tsx` reads `?restore=` only through it and
its save path is unchanged. Restore loads the version; Save commits it.

### 19. Sidebar: Insights, History and Help
Role: `implementer`. Risky path: no. Waits on 06.
- `kc/help.ts`
- `kc/client-view.ts`
- `kc/tests/sidebar.test.ts`
- `components/repo/repo-sidebar.tsx`

Done-test: `node --test kc/tests/sidebar.test.ts` passes. `helpLinks()`
returns `https://kingsburycreative.com/cms-guide` and
`mailto:hello@kingsburycreative.com`; a source test shows Insights as its own
top-level item, a History item, and both Help links in `SidebarFooter`.

### 20. Advanced section for KC's view (board: advanced-toggle)
Role: `implementer`. Risky path: no. Waits on 19 (same file).
- `kc/client-view.ts`
- `kc/tests/client-view.test.ts`
- `components/repo/repo-sidebar.tsx`

Done-test: `node --test kc/tests/client-view.test.ts` passes. As the board
card says, against `repo-sidebar.tsx:343-386` (Cache, Actions, Collaborators,
Configuration), not `repo-nav.tsx`.

### 21. SEO and AI-answer panel beside the editor
Role: `implementer`. Risky path: no.
- `kc/seo/rules.ts`
- `kc/seo/readability.ts`
- `kc/seo/panel.tsx`
- `kc/tests/seo-rules.test.ts`
- `components/entry/entry-form.tsx`

Done-test: `node --test kc/tests/seo-rules.test.ts` passes. Title 50 to 60
and description 120 to 155 characters (from `content-and-seo.md`); snippet
truncation; any H1 in the body flagged (the template's title is the H1);
skipped heading levels; markdown and `<img>` without alt; Flesch-Kincaid grade
on a fixed paragraph within 0.5 of a hand count; an answer-first check that
the first paragraph comes before any heading and runs 25 to 60 words. Fields
found by name (`title`, `description`, `body`), panel hidden without them; no
`fetch` or `http` in `kc/seo/`. Below the form in a `<details>` on a phone,
beside it from 1280.

### 22. AI writing helper (parked stub)
Role: waiting on Rob. Risky path: not yet known.
- `kc/BOARD.md`

Done-test: a parked board entry naming what Rob decides first: the provider
and who pays for the key, the client's consent for their text leaving the
browser, and a per-site opt-in key (`kc.ai`, a `KcSchema` change), off by
default. Nothing is built.

### 23. Security audit of the feature
Role: `security-auditor`. Risky path: yes.
- `kc/branch-lock.ts`
- `kc/redact.ts`
- `kc/content-ops.ts`
- `kc/history/site.ts`
- `kc/history/ref-check.ts`
- `lib/collaborator-access.ts`
- `lib/auth.ts`

Done-test: the result names each finding by file and line, none high left
open, and `node --test "kc/tests/**/*.test.ts"` is green. It covers cards 01,
02, 10, 13 and 15, the GitHub email linking in `lib/auth.ts:37-41`, and
whether a client can reach another branch through `?ref=` or restore.

### 24. Deploy
Role: waiting on Rob. Risky path: no (box step).
- `D:\Dev\htdocs\kc-cms\server\deploy.sh`

Done-test: the deployed sha matches fork main; an invite to the `+kctest`
address lands from "Kingsbury Creative" with the logo, the client name, no
GitHub link and no slug; the dashboard opens at 375 and 1280; one restore on
kc-test-site shows up as a commit under the editor's name.
