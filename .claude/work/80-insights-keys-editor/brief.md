# 80. Staff editor for a site's analytics IDs (Risky)

## Objective
KC staff set a site's analytics IDs (`ga` GA4 property ID, `cf` Cloudflare Web Analytics site tag, `pages` Pages project) from the staff strip in the CMS instead of editing `/srv/kc-cms/shared/insights.json` on the box. Henike is the first live test.

## Read first
- .claude/project.md (Never list, risky paths, the insights-keys-editor exception: one new migration plus the matching table in `db/schema.ts`)
- The insights-keys-editor entry in kc/BOARD.md (the spec; follow it exactly)
- kc/insights/map.ts (`gaId`, `siteTag`, `pagesProject`, `loadInsightsMap`, `insightsSourcesFor`) and its callers: kc/dashboard-server.tsx, `app/(main)/[owner]/[repo]/[branch]/insights/page.tsx`, `layout.tsx`, `page.tsx`
- kc/dashboard-server.tsx `StaffStrip` (line ~311) and `hasGithubIdentity` (line ~255)
- lib/token.ts (`getUserToken`), db/schema.ts, db/migrations/0013_invite_name.sql and meta/_journal.json
- kc/register/customizations.json and its test

## Build
- Table: new `db/migrations/0014_*.sql`, its `meta/0014_snapshot.json` and `_journal.json` entry, and the pgTable in `db/schema.ts`. Keyed by lower-cased `owner/repo`; columns for ga, cf, pages (nullable), updated_at, updated_by. IDs only, never a key or token.
- Reader: table first, file fallback, so sites in insights.json keep working. If callers must become async, change them with the smallest edit.
- Write path: a server action or route under KC code. Validate each ID with the existing rules (export them, do not copy). Refuse with 403 unless the signed-in user has a GitHub identity AND GitHub says they have admin permission on that repo, checked server-side on every write with their user token. An email (client) user is refused. Never trust a client-sent flag.
- Form in `StaffStrip`: shows current IDs, saves, says plainly what was saved or which ID was wrong. Mobile first, no JS needed for the base form if practical. Copy through the `prose` skill, then `avoid-ai-writing` and `humanizer`; UI through `avoid-ai-design` (Skill tool). If the Skill tool refuses, stop and say so in result.md. List each piece of copy in result.md.
- Any upstream file touched gets a claim in `kc/register/customizations.json`, named in result.md.

## Files you may touch
- `kc/insights/map.ts`, new files under `kc/insights/`
- `kc/dashboard-server.tsx`
- `app/(main)/[owner]/[repo]/[branch]/insights/page.tsx` (only if the reader goes async)
- `app/(main)/[owner]/[repo]/[branch]/layout.tsx` (only if the reader goes async)
- `app/(main)/[owner]/[repo]/[branch]/page.tsx` (only if the reader goes async)
- `db/schema.ts`
- `db/migrations/0014_insights_keys.sql`
- `db/migrations/meta/0014_snapshot.json`
- `db/migrations/meta/_journal.json`
- `kc/register/customizations.json`
- `kc/tests/insights-keys.test.ts` (new), existing tests under `kc/tests/` only to follow a signature change
- `.claude/work/80-insights-keys-editor/result.md`, `progress.md`

## Done-test
New `kc/tests/insights-keys.test.ts` (fixtures and fakes only, no network, no real DB): table row wins over the file; no row falls back to the file; each of ga, cf, pages refuses a bad value; a GitHub user without admin is refused 403; an email client user is refused; an admin saves and the next read returns the saved IDs; owner/repo is lower-cased on write and read.

Mutation check through the runner: drop the admin check (a test fails); make the reader skip the table (a test fails); restore both.

At the end, each exit 0 on the final tree:
- `node C:\Users\roban\.claude\bin\project-test.cjs kc/tests/insights-keys.test.ts`
- the register test and dashboard tests through the same runner
- `npx tsc --noEmit`, `npx eslint kc`

## Boundaries
No commit, no push, no npm install, no package.json edits, no network in tests, never read `.env` or secrets, no deploy.

## Progress
Keep `progress.md` beside this file from your first step, one line per step that changes a file or finishes a unit of work: done, files, next, anything half-written. Already there? You are resuming: read it and check the disk against it first.
