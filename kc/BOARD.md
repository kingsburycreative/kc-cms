# Board

## Now

- **client-view**: a client sees "[client] Dashboard" and their own site's
  content and media, nothing else. Rob, 2026-10-14: clients never create
  templates; they add sections only where he allows it, edit text, and edit
  the media gallery. Sections and text are already set per site in
  `.pages.yml` (blocks and fields), so this card is the shell around them.
  "Client" means a user without a GitHub identity (`hasGithubIdentity` in
  `lib/authz-shared.ts`); Rob keeps the full view.
  - Client name: an optional top-level `kc:` object in `.pages.yml` with one
    key, `client` (a string). Add it to `lib/config-schema.ts` as the
    smallest change that passes the strict schema, typed in `kc/`. With no
    `kc.client`, fall back to the repo name with dashes as spaces and words
    capitalised (`henike-tree-service` gives "Henike Tree Service").
  - The repo sidebar header (`components/repo/repo-sidebar.tsx`) shows
    "<client> Dashboard" with the KC mark, and links only to that repo's
    dashboard root. For a client: no GitHub link, no "All projects", no
    recent-visits switcher, no branch picker. The document title is
    "<client> Dashboard" too (`components/document-title.tsx`).
  - Home (`app/(main)/page.tsx`): the "Create from a template" section goes
    for everyone; KC never uses it. A client with exactly one repo is
    redirected straight to its dashboard; with more, they see only the
    project list, titled with each one's dashboard name.
  - The About dialog (`components/about.tsx`) shows for Rob only. The
    "Built on Pages CMS" credit stays there.
  - Done-test: `kc/tests/client-view.test.ts` covers the name fallback, the
    `kc.client` override, the schema accepting `kc.client` and rejecting
    other keys under `kc`, and a pure helper deciding which sidebar and
    home pieces a client sees versus Rob.

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

- **branding**: committed on feat/03-branding, gate green, audit clean.
- **upstream-watch**: PR #5, merged. A manual run went green and opened no PR.
- **insights-core**: PR #1, merged.
- **uptime**: PR #3, merged, and `KC_UPTIME_ENABLED` is `true`.
