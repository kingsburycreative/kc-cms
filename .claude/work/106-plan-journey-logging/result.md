# 106 result

Tool: a first-party journey log in the CMS's Postgres, plus self-hosted OpenObserve for errors and traces. Sentry and PostHog need about 16 GB and the box has 3.8 GB. Only our own table can answer "what did this client do" by reference id. OpenObserve's memory use is unverified (a few hundred MB idle, I believe). Card 13 measures it, and anything over 1 GB drops it.

15 cards. In order: id and sanitizer, Rob's grants, proxy mints the id, table and writer, reference shown in the footer, server events, sign-in and sign-out (Risky), client beacon (Risky), purge, Rob's support view, insight reports, privacy notice, the OpenObserve install (Rob), OpenObserve wiring, then the security audit.

Rob must grant: one migration (0015_journey_event) for card 04, and the OpenObserve browser SDK in package.json for card 14. He must also approve the box install.

Not decided: retention (90 days proposed), whether session replay is on (it records field values unless every input is masked), and where the privacy notice lives (not in this repo). I could not run the done-test command because I had no Bash.
