# Board

## Now

- **dark-primary**: dark mode's primary fails contrast. `#A84F23` is used as
  link text (`text-primary` in `app/(main)/admin/page.tsx` and
  `components/about.tsx`) and measures about 3.2:1 on the dark background.
  In `.dark` only, in `app/globals.css`: `--primary: #D4713F`,
  `--primary-foreground: #1A1714`, `--ring: #D4713F` (KC's own lighter
  terracotta and warm near-black; about 5.3:1 for button text and about 5:1
  as text on the dark background). Add both values to `kc/brand.ts` as
  `BRAND_PRIMARY_DARK` and `BRAND_PRIMARY_FOREGROUND_DARK`. Extend
  `kc/tests/brand.test.ts`: read `.dark`'s `--background` from
  `globals.css`, convert the oklch to sRGB in the test, and require 4.5:1
  for primary on background and foreground on primary, in both `:root` and
  `.dark`. Light mode is right and stays as is.

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
