# Card 41: security audit of the dashboard

Opus security-auditor, read-only. No high finding.

- Low, live: kc/dashboard-server.tsx:25 and insights/page.tsx:87 key the series cache on owner/repo as typed; access and the sources lookup ignore case, so changing capitals forces a fresh Cloudflare/GA4 call on the shared token. The Map never evicts (kc/insights/route.ts:53-61). Fix: lowercase in seriesSiteKey, use it on both pages, cap the Map.
- Latent: dashboard-server.tsx:44 checks decodeURIComponent(branch) but :85 reads raw ref.branch; page.tsx:18 and :44 decode a second time. Fix: decode once, pass the same string to the check and getCollectionCache.
- Latent: kc.pagesProject comes from .pages.yml (client-view.ts:10), so once card 43 is wired, push on one repo could read another client's publish state. Fix: hold the Pages project in KC_INSIGHTS_MAP per owner/repo.
- Observation: file paths reach clients (dashboard-server.tsx:106 key, :107 fallback, dashboard.tsx:151). Nothing new exposed; plan's promise fails as written.
- Observation: publish/status.ts:34 passes ended_on unchecked; Date.parse and ISO it.
- Observation, not security: sparkline gets 90 days with range 30 (dashboard-server.tsx:70); its label overstates. Pass slice(days, 30).

Confirmed: no version string or PR link for clients; cache keyed by site (case caveat); branch lock before panels; no token in a log line or prop; deployments call sends only account and project, returns state and time; kc.site cannot inject a non-https href.
Not verified: a live +kctest page payload, Next 16 param decoding, the suite (auditor has no shell; the loop runs it), whether the token reads Pages.
