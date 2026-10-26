# 48. Publish status from Cloudflare Pages (Risky)

## Objective
Board card 43 (`.claude/work/39-plan-dashboard/plan.md` card 43). A pure model that turns a site's Cloudflare Pages deployments into published, publishing, failed or unknown, plus a server fetch that never throws, and the `kc.pagesProject` config key that names the project.

## Read first
- `D:\Dev\htdocs\kc-cms-app\.claude\project.md` (relative `.ts` imports in `kc/`, Never list: no network in tests, never read or print a secret)
- Card 43 and Flag 8 in `.claude/work/39-plan-dashboard/plan.md` (the spec)
- `kc/update/status.ts`, `kc/update/status-fetch.ts` and their test (the same shape: pure model, fetch with `revalidate`, one fixed warn line, never throws)
- `kc/insights/cloudflare.ts` and `kc/dashboard-server.tsx` line ~62 (the token is `process.env.CLOUDFLARE_ANALYTICS_TOKEN`, the account `process.env.KC_CF_ACCOUNT_ID`)
- `kc/client-view.ts` (`KcSchema`, strict; `site` and `actions` were added the same way)

## Start here
- `kc/publish/status.ts`: `publishStatus(deployments, now)` gives `{state: "published", at}`, `{state: "publishing"}`, `{state: "failed", at}` or `{state: "unknown"}`. Only the latest production deployment counts (`environment: "production"`); previews ignored. Map the latest stage status: success gives published, active/queued/idle gives publishing, failure/canceled gives failed. Return only state and time, nothing else from the deployment (no commit message, author, URL).
- `kc/publish/status-fetch.ts`: `fetchPublishStatus({accountId, token, project}, fetchImpl?)` calling `GET https://api.cloudflare.com/client/v4/accounts/{account}/pages/projects/{project}/deployments` with `next: { revalidate: 30 }`. Missing account, token or project gives unknown with no call. Any non-OK status, throw or bad JSON gives unknown and one fixed warn line holding no URL, header or token. Encode the project and account path segments; refuse a project that is not `[a-z0-9-]+`.
- `kc/client-view.ts`: add optional `pagesProject` to `KcSchema` (string, the same pattern).
- Rendering it on the dashboard is not this card; build no UI.

## Files you may touch
- `D:\Dev\htdocs\kc-cms-app\kc\publish\status.ts` (new)
- `D:\Dev\htdocs\kc-cms-app\kc\publish\status-fetch.ts` (new)
- `D:\Dev\htdocs\kc-cms-app\kc\client-view.ts`
- `D:\Dev\htdocs\kc-cms-app\kc\tests\publish-status.test.ts` (new)
- `D:\Dev\htdocs\kc-cms-app\kc\tests\fixtures\deployments\` (new, hand-written JSON, no real data)
- `D:\Dev\htdocs\kc-cms-app\.claude\work\48-publish-status\result.md` and `progress.md` (new)

## Done-test
`node C:\Users\roban\.claude\bin\project-test.cjs kc/tests/publish-status.test.ts` passes, then `npx tsc --noEmit && npx eslint kc` exit 0. Asserts from fixtures: latest production success gives published with its time; active or queued gives publishing; failure gives failed; a newer preview is ignored; a 403, a thrown fetch and bad JSON each give unknown and log exactly one line with no token or URL; the result holds only state and time; a bad project name makes no call; `KcSchema` accepts `pagesProject`; no real network call (inject the fetch).

Mutation check, through the runner: let a preview count and name the failing preview test; make a failed fetch return published and name the failing failure tests; restore and run green.

## Boundaries
No commit, no push, no install, no network in tests, nothing outward. No `package.json`, lock file or `db/migrations/` change; no upstream file. Never read or print a secret or `.env`. No client-facing copy is written in this card (the warn line is a server log). Keep `progress.md` beside this brief, updated after each step that changes a file: done so far, files touched, next step, anything half-written.

## Report
`result.md` beside this file, under 200 words: files changed, tests added, the mutation result naming the failing tests, what was not done (no UI; token scope for Pages read is unverified).
