# 106. Plan: full journey logging for every client (Risky)

## Objective
One file exists, `.claude/work/106-plan-journey-logging/plan.md`: the ordered build cards that give the CMS full journey logging, each with its done-test (a command), its files, its size and its role. It also records the tool choice with reasons, the journey id design, what is logged, privacy and retention, Rob's support view and the product-insight reports. No code, no migration, no install, no deploy.

## Read first
- D:/Dev/htdocs/kc-cms-app/CLAUDE.md and D:/Dev/htdocs/kc-cms-app/.claude/project.md (upstream-file rule, Never list, Risky paths, copy rule)
- C:/Users/roban/.claude/pm/traps.md
- D:/Dev/htdocs/kc-cms-app/.claude/work/105-create-on-conflict-error/plan.md (plan layout to copy) and D:/Dev/htdocs/kc-cms-app/.claude/work/102-plan-stem-admin-redirect/plan.md
- D:/Dev/htdocs/kc-cms-app/db/schema.ts (session, collaborator, collaborator_invite, insights_keys tables), D:/Dev/htdocs/kc-cms-app/proxy.ts, D:/Dev/htdocs/kc-cms-app/lib/auth.ts, D:/Dev/htdocs/kc-cms-app/kc/redact.ts, D:/Dev/htdocs/kc-cms-app/kc/dashboard-visits.ts, D:/Dev/htdocs/kc-cms-app/kc/insights/
- D:/Dev/htdocs/kc-cms-app/lib/actions/collaborator.ts (invite, add, remove), D:/Dev/htdocs/kc-cms-app/app/error.tsx, D:/Dev/htdocs/kc-cms-app/components/entry/entry.tsx (saves), D:/Dev/htdocs/kc-cms-app/app/(main)/admin and kc/admin-gate.ts (Rob-only gate)
- D:/Dev/htdocs/kc-cms/PLAN.md and the box notes there (the OVH box)

## Context
Rob, 2026-11-02, verbatim, the spec:

> "I want *full* logging of journey for any client so we can track entire flows, not just errors and fails. Every page should have a unique identifier for that session so we can ask for that number (or the date of the issue for reference) and track down EXACTLY what flow did what. This is for us as much as anyone else so we can improve the cms product. If that means installing Sentry or an oss equivalent on our OVH box, I'm here for it."

Facts checked by the briefer on 2026-11-02:
- The CMS keeps only the `session` table (created, updated, expiry, IP, user agent). No activity or audit table. No record of invite or collaborator-added times (`collaborator` has no timestamps; `collaborator_invite` has createdAt only). Page views exist only in nginx logs, with no user id.
- The OVH box (51.222.6.173, read over ssh, read-only): 3.8 GB RAM total, about 3.0 GB available, 2 GB swap, 2 vCPUs, disk 38 GB with 29 GB free. Running: next-server (about 256 MB), Postgres 18, nginx. Self-hosted Sentry needs about 16 GB and does not fit; say so in the plan with these numbers. Re-read them over `ssh -i ~/.ssh/kc_cms_ovh ubuntu@51.222.6.173` with `free -m`, `nproc`, `df -h /` only if you need fresher figures. Read-only commands, nothing else.
- Stack: Next.js 16 app, `proxy.ts` (not middleware.ts) runs on every request, Postgres via drizzle, no `instrumentation.ts` yet.
- project.md forbids touching `package.json`, `package-lock.json` and `db/migrations/` without a written exception from Rob. A first-party log table needs a migration; a client SDK or collector needs a dependency. The plan must put a "Rob grants exception" step ahead of the first card that needs one, as card insights-keys-editor had (project.md, 2026-10-27), and say which cards depend on it.
- Every card touching `lib/auth.ts`, `lib/crypto.ts`, `lib/token.ts` or `app/api/` is Risky: Opus plus a `security-auditor` pass. Mark each card with its size.

## What the plan must cover
1. Tool choice with reasons, one recommendation: self-hosted Sentry, or an open-source equivalent (GlitchTip, PostHog or Umami for product analytics, OpenTelemetry), or a first-party journey log in the CMS's own Postgres. Weigh each against the box's RAM, CPU and disk, the PIPEDA position (data stays on KC's box), and whether it can answer "what exactly did this client do" by journey id.
2. Journey id: a short, human-readable reference per page view (session part plus per-page part, readable aloud, unambiguous characters), shown in the UI (footer or help menu) and searchable by that id, or by date and client. State where it is made (proxy.ts), how it reaches client components, and how it ties to the session.
3. What is logged: route and page views, collection and entry opened, field edits (field names only, never values or PII), saves and their result, client and server errors, sign-in and sign-out, collaborator invited, added and removed with timestamps, slow requests. Every row tagged with installation (owner/repo), user and session.
4. Privacy and retention: no field values, no secrets, no tokens, no email bodies in any row; IP handling; a retention window with a purge job; clients told in the privacy notice (copy goes through the prose skill per project.md); access limited to Rob (admin gate).
5. Rob's support view: per installation, per user, a session timeline, filters, lookup by journey id.
6. Product insight: which features are used, where people stop, time to first save.

## Start here
Read by the briefer, not run yet. Open db/schema.ts:26-37 and 79-120, proxy.ts:15-60, kc/admin-gate.ts, kc/redact.ts. The plan layout to copy is the 105 plan.md. Verify every file path and function you cite exists (Glob/Grep) before writing it into a card. Done-test for this card: `node -e "const t=require('fs').readFileSync('.claude/work/106-plan-journey-logging/plan.md','utf8');for(const k of ['## Decision','## Cards','Done-test','Files','Size','Retention','Journey id']){if(!t.includes(k))throw new Error('missing '+k)}"` run from D:/Dev/htdocs/kc-cms-app.

## Files you may touch
- `.claude/work/106-plan-journey-logging/plan.md` (new, the only output)
- `.claude/work/106-plan-journey-logging/progress.md`

## Done-test
plan.md exists and each card in it has: id, title, size (Small, Normal or Risky), role, Risky-path yes or no, files (exact paths), and a done-test command a stranger can run. The cards are ordered so each builds on the last, the first needs no exception, and the exception cards say what Rob must grant. The command in Start here passes. Not a code card: no mutation check, no screenshots.

## Boundaries
No commit, no push, no install, no migration, no code, nothing outward, no deploy. Read-only ssh to the box only for free, nproc and df. Never read or print a secret, a .env, or /root/kc-cms-secrets; project.md's Never list applies. Do not write a card that logs field values.

## Progress
Keep `progress.md` beside this file from your first step, one line per step that changes a file or finishes a unit of work: done, files, next, anything half-written. Already there? You are resuming: read it and check the disk against it first.

## Report
Write `result.md` beside this file, under 200 words: the tool recommended and why, the card count and order, what Rob must grant, and anything not decided.

## Rob's direction (2026-11-02)

Rob agreed: a first-party journey log in the CMS's own Postgres (page reference ids, the full flow per session), paired with self-hosted OpenObserve on the same OVH box for errors, traces and front-end monitoring with session replay. Self-hosted PostHog (about 16 GB) and Sentry don't fit the 3.8 GB box, and PostHog Cloud sends client journeys off our servers. Plan around that pairing; check OpenObserve's real memory use against the box before committing to it.
