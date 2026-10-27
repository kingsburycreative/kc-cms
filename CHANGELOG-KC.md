# KC CMS releases

Our version is upstream Pages CMS's version plus `+kc.N`, for example
`2.1.8+kc.1`. The part before `+` says which upstream release we are built on,
and the update check compares only that part, so it still says when upstream
ships something newer. `N` counts our own releases on that base and goes back
to 1 when we take a new upstream release. Each deploy of a new release gets a
git tag with the same name, written as `kc-2.1.8.1` (git tags and some tools
dislike `+`).

To cut a release: bump `version` in package.json and package-lock.json, add a
section here, merge, deploy, then tag the deployed commit.

## 2.1.8+kc.2 (2026-10-27)

- Security: GitHub sign-ins need a verified email; the post-sign-in redirect accepts only same-origin paths; saves over 1 MB are refused before validation, with a plain message in the editor; nodemailer 10.2.1.
- Updates: Next 16.4.3, better-auth 1.7.14, Tiptap 3.32 and patch releases.
- Fixes: the publish status logs the HTTP status when Cloudflare refuses; the Insights page keys its chart cache case-insensitively; add-editor refuses a repo with no .pages.yml.
- Customization register for the fork's own changes, with a test that flags any unclaimed upstream file.

## 2.1.8+kc.1 (2026-10-27)

Everything since the fork was taken at upstream 2.1.8, PRs #1 to #78.

- Branding: Kingsbury Creative name, logo and emails; dark mode contrast; phone menu on the KC pages.
- Clients: their own dashboard and email-only sign-in; locked to the default branch; no GitHub links, outside avatars or other people's identities; no deleting single-file entries; invites carry a name.
- Site tools: site dashboard with quick actions, publish status and search health; history pages with the change shown and restore; SEO panel beside the editor; short addresses for editor links.
- Insights: GA4 and Cloudflare figures with 90-day charts, shown only to admins, repo writers and the site's own clients.
- Security: settings, workflows and branch creation need the user's own push access; OTP limits counted before they run and keyed on the real IP; unused OTP endpoints off; email trusted only once verified; uploads limited to safe types; delete and rename judged by the file.
- Operations: uptime check, weekly upstream release check, update banner and version status, box command to add a client editor.
