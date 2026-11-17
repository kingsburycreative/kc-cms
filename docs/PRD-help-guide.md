# PRD: KC CMS help guide

Status: approved to start, 2026-11-17 (Rob). Decisions: docs/adr/0002 to 0004 (0004 supersedes 0001: the guide is a static, not-indexed site at guide.kingsburycreative.com, source in kc/guide/). KC CMS is Rob's own tool for clients for whom WordPress is too much, not a public product. Where this PRD says /help, read the guide site.

## What and why

Clients edit their sites in KC CMS and need help they can read without calling Rob. Today one client has a guide (BeSciWorks, public/guides/besciworks/index.html, 11 sections, 11 screenshots). Others have nothing or a PDF. Henike lost live Services FAQ content through a save on 2026-11-04, so saving and getting a change back must be explained exactly.

Rob, 2026-11-17: "one single guide that covers all the basics per version, PLUS individual modules (besciworks built the papers module, etc)... this doesn't need crazy checks and validations, it's a simple website and some screenshots. We do need to be 100% certain the copy is legible, understandable, and accurate, TIED TO VERSIONS." Marked-up screenshots now, videos later.

## Who reads it

Small-business owners and their staff. Not technical. Often on a phone. They know their own site, not the words "repo", "commit", "collection" or "field".

## What gets built

1. **Core guide.** One guide for everything every client does: sign in, find your way around, change the text on a page, add and remove an entry in a list (posts, events, news), photos and files, formatting text, save and what Save does to the live site, undo a change and get an old version back, see who visits, getting help. Built by splitting the core sections out of the BeSciWorks guide.
2. **Module pages.** One page per thing only some clients have. From the 2026-11-17 inventory of client `.pages.yml` files:
   - BeSciWorks: Papers (journal details, PDF), What Works, Insight Briefs, Weekly.
   - Henike: English and French pairs (blog posts and pages), project photo categories, Google reviews and rating, business details.
   - The Cupboard: Menu, Hours and contact, Events.
   - Chris Adams: News, Platform, Voting information (only if that site is on the CMS; not confirmed).
   Generic shapes (a list of posts, a single page) live in the core guide, not as modules.
3. **Version stamp.** Every page says which CMS version it was checked on, e.g. "Checked on KC CMS 2.1.8+kc.8, 17 Nov 2026".
4. **Where.** Public pages on the CMS site at /help, with a Help link inside the app that opens the core guide plus only that client's modules. See ADR 0001.

## Accuracy, kept simple

- Screenshots come from the real deployed version on the demo site (kc-test-site) set up with a copy of each module's config, never mocked and never a real client's data.
- One script takes every screenshot. Each release re-runs it; a picture that changed sends its page back for a recheck (ADR 0002).
- Copy goes through the prose skill. An agent who has never seen the CMS follows each task once; where it gets stuck, the copy is rewritten. That is a filter only.
- Rob reads every page before it goes live. His read is the sign-off for "understandable and accurate".
- The save and undo page is checked against Henike's real loss first (card 108.01: restore brings it back). The guide describes the CMS as it is. This feature never changes how the CMS behaves (Rob, 2026-11-17: "I just needed a help guide/docs, not changes to the cms itself"); anything the guide work turns up goes on the board for Rob to raise.

## Not in this round

Videos. Per-release archived copies (ADR 0002). Translating the guide to French.

## Done means

- /help live with the core guide and the Henike module pages, each stamped with the version and approved by Rob.
- /guides/besciworks redirects to the new guide (ADR 0003).
- Screenshot script runs from one command and reports which pages' pictures changed.

## Open

- Which repos are actually installed on the kc-cms GitHub App (Chris Adams is under rob-kingsbury, not kingsburycreative).
- Whether every client runs the one deployed CMS (assumed in ADR 0002).
