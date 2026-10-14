# Board

## Now

- **update-banner**: the one-click update from PLAN.md step 8. On the admin
  page (`app/(main)/admin/page.tsx`, Rob only, already behind
  `requireAdminSession`), when `kingsburycreative/kc-cms` has an open pull
  request from a branch starting `upstream/` (opened by the weekly
  upstream-sync workflow), show a banner: "Pages CMS <tag> is available",
  with a button that opens that pull request on GitHub. No banner when
  there is none.
  - A pure module `kc/update/banner.ts` turns GitHub's pulls list into
    `{ tag, url } | null`; a server-only fetch calls
    `GET /repos/kingsburycreative/kc-cms/pulls?state=open` (public repo, no
    token) and caches the answer for an hour, so the admin page costs at most
    one GitHub call an hour. A failed fetch shows no banner and logs one line.
  - The pull request URL comes only from GitHub's `html_url` and must start
    with `https://github.com/kingsburycreative/kc-cms/pull/`; anything else is
    dropped.
  - Tests: fixtures for none open, one open, a non-upstream branch ignored,
    a foreign URL rejected, and the tag parsed from the branch name.

- **title-hook**: `components/document-title.tsx` (from client-view) calls
  `useConfig()` inside a try/catch to survive pages with no config provider.
  Replace that with a context read that returns null outside a repo (a
  `useOptionalConfig` in `kc/`, reading the same context the provider sets,
  or the smallest export from `contexts/config-context.tsx` that allows it),
  and drop the eslint disable. Behaviour is unchanged: a client inside a repo
  sees "<client> Dashboard", everyone else sees the page title. Test the
  title helper both ways.

## Next

- **insights-route**: the Insights screen and its route, after insights-core
  (PR #1) merges and a GA4 property exists to try it on. Needs a schema
  change (a GA4 property ID per repo), which this board parks, so Rob decides
  how. Two hard rules from the audit of insights-core: render every card value
  as plain text, never HTML or markdown, and length-limit `pagePath` before
  it goes into a sentence (anyone can send GA4 a fake page path); and look up
  the property ID on the server from the repo record, only after checking the
  user can open that repo, never from the request. Cache reports for an hour.

## Waiting on Rob

- GA4 property and Google Cloud project under KC's account; B2 signup.

## Blocked

## Done

- **client-view**: committed on feat/05-client-view, gate green, no audit (not a risky path).
- **branding**: committed on feat/03-branding, gate green, audit clean.
- **upstream-watch**: PR #5, merged. A manual run went green and opened no PR.
- **insights-core**: PR #1, merged.
- **uptime**: PR #3, merged, and `KC_UPTIME_ENABLED` is `true`.
