# Plan: full journey logging for every client

Planned 2026-11-02 for card 106 (Risky). No code here.

## Decision

A first-party journey log in the CMS's own Postgres, plus self-hosted OpenObserve on the OVH box for errors, traces and front-end monitoring, as Rob agreed.

- Self-hosted Sentry needs about 16 GB RAM. The box has 3.8 GB, about 3.0 GB free, 2 vCPUs, 29 GB disk free. It does not fit. Self-hosted PostHog is the same size; PostHog Cloud ships client journeys off KC's servers (PIPEDA). GlitchTip fits but only shows errors, not flows. Umami counts pages, with no user or session.
- Only the first-party log answers "what exactly did this client do" by journey id: the rows carry our user, session and installation.
- OpenObserve memory: unverified. It is one Rust binary with local disk storage; my understanding is a few hundred MB idle, growing with ingest and query cache. Card 13 measures it on the box before card 14 is built. If it holds more than 1 GB, drop it and keep the Postgres log only.

## Journey id

- Format `S7KQ-M4PX`: session part, then page part, four characters each from Crockford base32 (no I, L, O, U), so it reads aloud cleanly.
- Made in `proxy.ts`. The session part lives in a plain `kc_jsid` cookie (not secret, not the auth token), minted when missing. A new page part is minted for each document or RSC navigation, skipping prefetches (`next-router-prefetch` header) and static paths. Both go on the request as `x-kc-journey`.
- Server components read the header. `app/(main)/layout.tsx` passes it to a client footer that shows "Reference S7KQ-M4PX" with a copy button.
- Tied to the auth session by the first logged row after sign-in, which stores both `kc_jsid` and `session.id`.
- Lookup by full id, session part alone, or by date plus client (owner/repo) or user.

## What is logged

One table, `journey_event`: time, journey id, session id, user id, owner/repo, kind, route, name (collection, entry path, field name), result, duration ms. Kinds: page view, collection opened, entry opened, field edited (name only), save and its result, client error, server error, sign-in, sign-out, collaborator invited, added and removed, slow request (over 2 s). Field values, emails, tokens and bodies never go in: every write passes `kc/journey/sanitize.ts`, which drops unknown keys.

## Privacy and Retention

- IP: not stored per row; the `session` table already keeps it.
- Retention: 90 days (Rob confirms in card 02); a daily purge deletes older rows.
- Access: Rob only, behind `requireAdminPage`.
- Clients are told in the privacy notice. No notice exists in this repo; card 02 asks where it lives. Copy goes through the prose skill.

## Flags on the existing plan

- Session replay (Rob's direction) records the screen, which includes field values. That breaks "never field values" unless every input is masked. Card 14 masks all inputs and text by default; Rob decides in card 02 whether replay is wanted at all.
- The brief says "the first card needs no exception". Card 01 needs none; the person card follows it.

## Cards

### 01. Journey id and sanitizer (Small)
- Size: Small
- Role: implementer (Sonnet)
- Risky path: no
- Files:
  - `kc/journey/id.ts`
  - `kc/journey/sanitize.ts`
  - `kc/tests/journey-id.test.ts`
  - `kc/tests/journey-sanitize.test.ts`
- Done-test: `node --test kc/tests/journey-id.test.ts kc/tests/journey-sanitize.test.ts`. Ids match `^[0-9A-HJKMNP-TV-Z]{4}-[0-9A-HJKMNP-TV-Z]{4}$`; parse accepts lower case and maps O to 0, I and L to 1; sanitize drops a `value`, `email`, `token` or unknown key and keeps the allowed ones.

### 02. Rob grants exceptions and decides (waiting on Rob)
- Size: waiting on Rob
- Role: none (Rob)
- Risky path: no
- Files:
  - `.claude/project.md`
- Rob writes into project.md: card 04 may add one migration (`db/migrations/0015_journey_event.sql`) and the table in `db/schema.ts`; card 14 may add the OpenObserve browser SDK to `package.json` and `package-lock.json`. He also decides: retention days, whether session replay is on, where the privacy notice lives, and approves installing OpenObserve on the box. Cards 04 to 12 wait on the migration grant; 13 and 14 on the install and package grants.
- Done-test: `node -e "const t=require('fs').readFileSync('.claude/project.md','utf8');if(!/journey/i.test(t))throw new Error('no exception')"`.

### 03. Proxy mints the journey id (Normal)
- Size: Normal
- Role: implementer (Sonnet)
- Risky path: no (upstream file `proxy.ts`, smallest hook)
- Files:
  - `proxy.ts`
  - `kc/journey/proxy.ts`
  - `kc/tests/journey-proxy.test.ts`
- Done-test: `node --test kc/tests/journey-proxy.test.ts`. A request without `kc_jsid` gets a cookie and an `x-kc-journey` header; one with it keeps the session part; a prefetch and a static path get no new page part.

### 04. journey_event table and writer (Normal)
- Size: Normal
- Role: implementer (Sonnet)
- Risky path: no
- Files:
  - `db/schema.ts`
  - `db/migrations/0015_journey_event.sql`
  - `db/migrations/meta/_journal.json`
  - `kc/journey/store.ts`
  - `kc/tests/journey-store.test.ts`
- Done-test: `node --test kc/tests/journey-store.test.ts`. With a fake db, a write passes through sanitize, a failed insert never throws to the caller, and the row carries journey id, user, session and owner/repo.

### 05. Reference shown in the UI (Small)
- Size: Small
- Role: implementer (Sonnet)
- Risky path: no
- Files:
  - `kc/journey/reference.tsx`
  - `app/(main)/layout.tsx`
  - `kc/tests/journey-reference.test.ts`
- Done-test: `node --test kc/tests/journey-reference.test.ts`. The label formats the header id; no header renders nothing.

### 06. Server events: pages, entries, saves, collaborators (Normal)
- Size: Normal
- Role: implementer (Sonnet)
- Risky path: no
- Files:
  - `kc/journey/events.ts`
  - `app/(main)/[owner]/[repo]/[branch]/layout.tsx`
  - `lib/actions/collaborator.ts`
  - `kc/tests/journey-events.test.ts`
- Done-test: `node --test kc/tests/journey-events.test.ts`. Each helper builds the right kind; the collaborator helpers carry owner/repo and no email; a save result records ok or the error code.

### 07. Sign-in and sign-out events (Risky)
- Size: Risky
- Role: implementer (Opus)
- Risky path: yes (`lib/auth.ts`)
- Files:
  - `lib/auth.ts`
  - `kc/journey/auth-events.ts`
  - `kc/tests/journey-auth-events.test.ts`
- Done-test: `node --test kc/tests/journey-auth-events.test.ts`. A session create hook logs sign-in with session id and no token; delete logs sign-out; a log failure never blocks sign-in.

### 08. Client beacon: field edits, client errors, slow pages (Risky)
- Size: Risky
- Role: implementer (Opus)
- Risky path: yes (`app/api/`)
- Files:
  - `app/api/journey/route.ts`
  - `kc/journey/beacon.ts`
  - `kc/journey/client.ts`
  - `components/entry/entry.tsx`
  - `app/error.tsx`
  - `kc/tests/journey-beacon.test.ts`
- Done-test: `node --test kc/tests/journey-beacon.test.ts`. No session gives 401; a body over 4 KB gives 413; a `value` key is dropped; more than 60 events a minute per session is refused.

### 09. Retention purge (Small)
- Size: Small
- Role: implementer (Sonnet)
- Risky path: no
- Files:
  - `kc/journey/purge.ts`
  - `kc/tests/journey-purge.test.ts`
- Done-test: `node --test kc/tests/journey-purge.test.ts`. Rows older than the window are deleted, newer kept; it runs at most once a day.

### 10. Rob's support view (Normal)
- Size: Normal
- Role: implementer (Sonnet)
- Risky path: no
- Files:
  - `app/(main)/admin/journeys/page.tsx`
  - `kc/journey/query.ts`
  - `kc/tests/journey-query.test.ts`
- Done-test: `node --test kc/tests/journey-query.test.ts`. Lookup by full id, by session part, and by date plus owner/repo or user builds the right filter; a non-admin is redirected by `adminPageGate`.

### 11. Product insight reports (Normal)
- Size: Normal
- Role: implementer (Sonnet)
- Risky path: no
- Files:
  - `kc/journey/reports.ts`
  - `app/(main)/admin/journeys/page.tsx`
  - `kc/tests/journey-reports.test.ts`
- Done-test: `node --test kc/tests/journey-reports.test.ts`. On fixture rows: feature use counts, the step where sessions stop, and median time from first sign-in to first ok save.

### 12. Privacy notice copy (Small)
- Size: Small
- Role: implementer (Sonnet, prose skill)
- Risky path: no
- Files:
  - the notice file Rob names in card 02
- Done-test: `node -e` check that the notice names journey logging and the retention days Rob set.

### 13. Install OpenObserve on the box and measure it (waiting on Rob)
- Size: waiting on Rob
- Role: coordinator with Rob (cards may not ssh)
- Risky path: no
- Files:
  - `D:/Dev/htdocs/kc-cms/PLAN.md` (box notes)
- Done-test: box notes record OpenObserve's resident memory after a day of ingest from `ps -o rss`; under 1 GB to go ahead.

### 14. Wire OpenObserve: server traces and browser monitoring (Risky)
- Size: Risky
- Role: implementer (Opus)
- Risky path: no listed path, Opus because it sends client data and holds an ingest token
- Files:
  - `instrumentation.ts`
  - `kc/observe/config.ts`
  - `package.json`
  - `package-lock.json`
  - `kc/tests/observe-config.test.ts`
- Done-test: `node --test kc/tests/observe-config.test.ts`. Masking is on for all inputs and text, the endpoint is the box only, the journey id is attached, and no token is in client code.

### 15. Security audit of the whole feature
- Size: Risky (audit, Opus)
- Role: security-auditor (Opus)
- Risky path: yes
- Files:
  - every file in cards 03 to 14
- Done-test: `node --test "kc/tests/journey-*.test.ts" kc/tests/observe-config.test.ts` passes, and the audit finds no field value, email, token or IP written to `journey_event` or sent to OpenObserve.
