# 0004: The guide is a static site at guide.kingsburycreative.com, not indexed

Date: 2026-11-17. Supersedes 0001. Decided by: Rob ("this isn't a public product... the docs can and should live somewhere at kingsburycreative.com, perhaps under a subdomain, but I'd leave that up to you. It doesn't need to be indexed... linking it from the kc-cms login page and dashboard could be a good idea"); the subdomain and the source location chosen by the PM.

## Context

KC CMS is Rob's own tool for clients for whom WordPress is too much, not a public product. 0001 put the guide inside the CMS app at /help. Rob wants it under kingsburycreative.com and kept out of search. The kingsburycreative.com site repo has no tests yet, bilingual and SEO rules for marketing pages, and a manual deploy; the guide is none of those things.

## Decision

- The guide's source (pages, images, screenshot script, builder) lives in this repo under `kc/guide/`, next to the code it describes, so the version stamp is read straight from package.json.
- `node kc/guide/build.ts` builds plain static HTML into `kc/guide/out/`, uploaded to https://guide.kingsburycreative.com on the WHC hosting that serves kingsburycreative.com.
- Not indexed: a robots noindex meta tag on every page, `robots.txt` disallowing everything, and an `X-Robots-Tag: noindex, nofollow` header. No sitemap, no links from the marketing site.
- Linked from the CMS sign-in page ("How to use the CMS") and from the dashboard, where the link lists the core guide plus only that client's modules.
- English only.

## Consequences

- The CMS app gains no public route; nothing in it changes but two links.
- The guide stays reachable for someone who cannot sign in.
- Hosting the subdomain is a one-time cPanel step for Rob; each approved change after that is a PM upload.
- /guides/besciworks redirects to the guide site once it is approved (0003, target updated).
