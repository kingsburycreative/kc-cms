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

## 2.1.8+kc.8 (2026-10-29)

- Dashboard: a visits chart with no visits yet labels its axis 0 and 1 instead of "1 1 1 0 0", and every chart's axis counts in whole steps with no label repeated.
- Dashboard: the visits chart fills the width of its card and shows the last date in full.
- Header: on a phone the page title wraps onto its own line instead of being cut off next to "See live site".

## 2.1.8+kc.7 (2026-10-28)

- Dashboard: the reviews line shows the typed rating itself, for example "5 stars from 24 reviews, typed in by hand on Oct 12."
- Loading: opening a site shows a shimmering outline of the page instead of a lone spinner; it holds still for people who turn motion off.

## 2.1.8+kc.6 (2026-10-28)

- Dashboard: a line says where the site's review rating comes from, read from the live site's `/reviews-status.json`, and asks for a check when a typed rating is over six months old.
- Security: that check only connects to public addresses; a site address that resolves inside our network is refused.
- Copy: plainer wording on the staff messages for analytics IDs.

## 2.1.8+kc.5 (2026-10-28)

- Fix: after a save, changing a field back to its earlier value counts as a change, so Save works without a page reload.
- Fix: JSON files keep their newline at the end after a save.

## 2.1.8+kc.4 (2026-10-28)

- Fix: after saving analytics IDs the form keeps the saved values and the staff strip shows them at once; before, a second click on Save cleared every ID.
- Dashboard: a site without analytics shows one setup note instead of four, and the header names the missing live site; visit tiles sit two across on a phone; loading placeholders shimmer, and hold still for people who turn motion off.
- Look: cooler greys, new radius, shadow and focus-ring settings, chart colours that suit the brand, and a page header that puts its action under the title on a phone.

## 2.1.8+kc.3 (2026-10-28)

- Media: deleting a file is refused while anything still uses it, checked across every path in `.pages.yml` (single files, collections and their subfolders) and the site's code under `src/`.
- Insights: KC staff with admin rights on a repo set its GA4, Cloudflare and Pages IDs from the staff strip; an ID already used by another site is refused.
- Dashboard: a Dashboard link heads the sidebar; quick actions are buttons; Media, Insights and the live-site link stay in place with a "not set up yet" note; empty panels say whether analytics is not connected yet or could not load.

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
