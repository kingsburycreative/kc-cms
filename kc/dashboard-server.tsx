// Async server panels for the dashboard. Each one re-runs the repo read check
// itself, so no token, account id or key path is ever passed in as a prop.
// Every panel draws its heading; only PublishLine and StaffStrip may draw nothing.
import { getInsightsAccess, getRepoReadContext } from "@/lib/api-repo-context";
import { getCollectionCache } from "@/lib/github-cache-file";
import { createOctokitInstance } from "@/lib/utils/octokit";
import { parse } from "@/lib/serialization";
import { hasGithubIdentity } from "@/lib/authz-shared";
import type { ReactNode } from "react";
import type { User } from "@/types/user";
import { insightsSourcesFor } from "./insights/map.ts";
import { InsightsKeysForm } from "./insights/keys-form.tsx";
import { defaultCache, defaultCloudflareCache, defaultSeriesCache, loadSeries, loadSiteInsights, readKey, seriesSiteKey } from "./insights/route.ts";
import type { Series, SeriesPoint } from "./insights/series.ts";
import { DashboardVisits } from "./insights/chart.tsx";
import { siteHealth } from "./seo/site.ts";
import { getVersionStatus } from "./update/status-fetch.ts";
import type { VersionStatus } from "./update/status.ts";
import { fetchPublishStatus } from "./publish/status-fetch.ts";
import { publishLine } from "./publish/status.ts";
import { healthEntries, pageName } from "./dashboard.ts";
import { shortHref } from "./short-url.ts";
import { COULD_NOT_LOAD, NOT_SET_UP, STAFF_LINK_HREF, STAFF_LINK_TEXT, panelState, type PanelState } from "./panel-state.ts";
import { rangeChange, weekSummary } from "./dashboard-visits.ts";
import { STAT_GRID, StatTile } from "./stat-tile.tsx";

export const VISITS_FALLBACK = "Visit numbers aren't available right now.";
export const NO_PAGES = "No pages to check yet.";
const FIX_LIMIT = { client: 3, staff: 5 };
// Crossfade from the skeleton, once; still under reduced motion.
const FADE = "motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300";
const PANEL = `rounded-lg border p-4 ${FADE}`;
const H2 = "text-base font-semibold";

type RepoRef = { owner: string; repo: string; branch: string };

export { seriesSiteKey };

// Clients learn only whether an update exists; staff also get the tag.
export function versionFor(status: VersionStatus, isStaff: boolean): VersionStatus {
  return isStaff ? status : { state: status.state } as VersionStatus;
}

export function versionText(status: VersionStatus): string {
  if (status.state === "current") return "Your CMS is up to date.";
  if (status.state === "unknown") return "Couldn't check the CMS version.";
  return "tag" in status && status.tag ? `Pages CMS ${status.tag} is out.` : "A CMS update is available.";
}

export function visitsView(series: Series | null) {
  return series ? { ok: true as const, days: series.days, sentence: weekSummary(series.days).sentence } : { ok: false as const, sentence: VISITS_FALLBACK };
}

// The branch arrives decoded from page.tsx, once.
async function readUser({ owner, repo, branch }: RepoRef) {
  try {
    return await getRepoReadContext({ owner, repo, branch });
  } catch {
    return null;
  }
}

const cloudflareEnv = (siteTag: string) => ({
  siteTag,
  accountId: process.env.KC_CF_ACCOUNT_ID,
  token: process.env.CLOUDFLARE_ANALYTICS_TOKEN,
});

function StaffLink() {
  return <a href={STAFF_LINK_HREF} className="mt-1 inline-flex min-h-11 items-center text-sm underline underline-offset-4">{STAFF_LINK_TEXT}</a>;
}

export function duration(seconds: number): string {
  const s = Math.round(seconds);
  return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`;
}

export function StatTiles({ days, engagementSeconds, state }: { days: SeriesPoint[] | null; engagementSeconds: number | null; state?: PanelState }) {
  const visits = days ? rangeChange(days, 30, "visits") : null;
  const views = days ? rangeChange(days, 30, "views") : null;
  const recent = days?.slice(-30);
  return (
    <section aria-labelledby="kpis-h" className={FADE}>
      <h2 id="kpis-h" className="sr-only">Last 30 days compared with the 30 before</h2>
      <ul className={STAT_GRID}>
        <StatTile label="Visitors" value={visits ? visits.last : null} change={visits?.change} spark={recent?.map((d) => d.visits)} state={state} />
        <StatTile label="Pages viewed" value={views ? views.last : null} change={views?.change} spark={recent?.map((d) => d.views)} state={state} />
        <StatTile label="Time on site" value={engagementSeconds ? duration(engagementSeconds) : null} state={state} />
      </ul>
      <p className="mt-2 text-xs text-muted-foreground">Last 30 days against the 30 before.</p>
    </section>
  );
}

export async function VisitsPanel(ref: RepoRef) {
  // getInsightsAccess runs before the map is read or anything is fetched.
  const ctx = await readUser(ref);
  const allowed = !!ctx && (await getInsightsAccess(ctx.user, ref.owner, ref.repo));
  const sources = allowed ? await insightsSourcesFor(ref.owner, ref.repo) : null;
  const key = readKey(process.env.KC_GA4_KEY_FILE);
  const [series, site] = sources
    ? await Promise.all([
        loadSeries({
          site: seriesSiteKey(ref.owner, ref.repo),
          propertyId: sources.ga,
          key,
          fetchFn: fetch,
          cache: defaultSeriesCache,
          cloudflare: sources.cf ? cloudflareEnv(sources.cf) : null,
        }).catch(() => null),
        loadSiteInsights({
          propertyId: sources.ga,
          key,
          fetchFn: fetch,
          cache: defaultCache,
          cloudflare: sources.cf ? { ...cloudflareEnv(sources.cf), cache: defaultCloudflareCache } : null,
        }).catch(() => null),
      ])
    : [null, null];
  const view = visitsView(series);
  const state = panelState({ configured: !!sources, ok: view.ok, staff: !!ctx && hasGithubIdentity(ctx.user as User) });
  const engagement = site?.ok ? site.detail?.engagement.averageSeconds ?? null : null;
  // No analytics IDs: one banner in the Visits panel's place, and no tiles.
  if (state.kind === "not-set-up") {
    return (
      <section aria-labelledby="visits-h" className={PANEL}>
        <h2 id="visits-h" className={H2}>Visits</h2>
        <p className="mt-2 text-sm text-muted-foreground">{NOT_SET_UP}</p>
        {state.staffLink && <StaffLink />}
      </section>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-4 @[900px]:grid-cols-3">
      <section aria-labelledby="visits-h" className={`${PANEL} @[900px]:col-span-2`}>
        <h2 id="visits-h" className={H2}>Visits</h2>
        {view.ok ? <div className="mt-3"><DashboardVisits days={view.days} insightsHref={shortHref(`/${ref.owner}/${ref.repo}/${encodeURIComponent(ref.branch)}/insights`)} /></div> : (
          <p className="mt-2 text-sm text-muted-foreground">{COULD_NOT_LOAD}</p>
        )}
      </section>
      <StatTiles days={view.ok ? view.days : null} engagementSeconds={engagement} state={state} />
    </div>
  );
}

// sub is the muted text after the label: a page's path when its name is known.
function Bars({ items, unit }: { items: { label: string; value: number; sub?: string }[]; unit: "count" | "share" }) {
  const top = Math.max(...items.map((i) => i.value), 1);
  const sum = items.reduce((t, i) => t + i.value, 0) || 1;
  return (
    <ul className="mt-3 space-y-2">
      {items.map((item, i) => (
        <li key={`${item.label}-${i}`} className="relative overflow-hidden rounded px-2 py-1.5 text-sm">
          <span
            aria-hidden="true"
            className="absolute inset-y-0 left-0 rounded bg-primary/10 motion-safe:animate-in motion-safe:slide-in-from-left-full motion-safe:fill-mode-backwards motion-safe:duration-700"
            style={{ width: `${Math.round((item.value / top) * 100)}%`, animationDelay: `${i * 80}ms` }}
          />
          <span className="relative flex justify-between gap-4">
            <span className="truncate">
              {item.label}
              {item.sub && <span className="ml-2 text-muted-foreground">{item.sub}</span>}
            </span>
            <span className="tabular-nums">{unit === "share" ? `${Math.round((item.value / sum) * 100)}%` : item.value.toLocaleString("en-US")}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

export async function TopLists(ref: RepoRef) {
  const ctx = await readUser(ref);
  const allowed = !!ctx && (await getInsightsAccess(ctx.user, ref.owner, ref.repo));
  const sources = allowed ? await insightsSourcesFor(ref.owner, ref.repo) : null;
  const site = sources
    ? await loadSiteInsights({
        propertyId: sources.ga,
        key: readKey(process.env.KC_GA4_KEY_FILE),
        fetchFn: fetch,
        cache: defaultCache,
        cloudflare: sources.cf ? { ...cloudflareEnv(sources.cf), cache: defaultCloudflareCache } : null,
      }).catch(() => null)
    : null;
  // The site's own page list, from the config already read: a name when the CMS knows it, else the bare path.
  const pages = site?.ok
    ? site.pages.items.slice(0, 5).map((item) => {
        const name = pageName(item.label, ctx?.config.object);
        return name ? { ...item, label: name, sub: item.label } : item;
      })
    : [];
  const towns = site?.ok ? site.detail?.cities.items.slice(0, 5) ?? [] : [];
  return (
    <div className="grid grid-cols-1 gap-4 @[700px]:grid-cols-2">
      <section aria-labelledby="pages-h" className={PANEL}>
        <h2 id="pages-h" className={H2}>Most viewed pages</h2>
        {pages.length ? <Bars items={pages} unit="count" /> : <p className="mt-2 text-sm text-muted-foreground">No page views to show yet.</p>}
      </section>
      <section aria-labelledby="towns-h" className={PANEL}>
        <h2 id="towns-h" className={H2}>Where visitors come from</h2>
        {towns.length ? <Bars items={towns} unit="share" /> : <p className="mt-2 text-sm text-muted-foreground">No towns to show yet.</p>}
      </section>
    </div>
  );
}

function Ring({ passing, checked }: { passing: number; checked: number }) {
  const share = checked ? (passing / checked) * 100 : 0;
  return (
    <svg viewBox="0 0 100 100" role="img" aria-label={`${passing} of ${checked} pages pass`} className="size-28 shrink-0">
      <style>{"@keyframes kc-ring{from{stroke-dashoffset:100}}"}</style>
      <circle cx="50" cy="50" r="42" fill="none" strokeWidth="10" className="stroke-muted" />
      <circle
        cx="50"
        cy="50"
        r="42"
        fill="none"
        strokeWidth="10"
        pathLength={100}
        strokeDasharray="100"
        strokeDashoffset={100 - share}
        strokeLinecap="round"
        transform="rotate(-90 50 50)"
        className="stroke-primary motion-safe:animate-[kc-ring_900ms_ease-out]"
      />
      <text x="50" y="50" textAnchor="middle" className="fill-current text-xl font-semibold">{passing}/{checked}</text>
      <text x="50" y="66" textAnchor="middle" className="fill-current text-[9px]">pages pass</text>
    </svg>
  );
}

export async function SearchHealthPanel(ref: RepoRef) {
  const ctx = await readUser(ref);
  const content = ((ctx?.config.object as { content?: unknown })?.content ?? []) as any[];
  // Same read path as the file route: the repo token, after the read check above.
  const entries = ctx
    ? await healthEntries(content, {
        collection: (schema) => getCollectionCache(ref.owner, ref.repo, ref.branch, schema.path!, ctx.token, schema.view?.node?.filename) as Promise<any[]>,
        file: async (schema) => {
          const { data } = await createOctokitInstance(ctx.token).rest.repos.getContent({ owner: ref.owner, repo: ref.repo, path: schema.path!, ref: ref.branch });
          return !Array.isArray(data) && data.type === "file" ? Buffer.from(data.content, "base64").toString() : null;
        },
        parse: (text, schema) => parse(text, { format: schema.format as any, delimiters: schema.delimiters as any }),
      })
    : [];
  const staff = !!ctx && hasGithubIdentity(ctx.user as User);
  const health = siteHealth(entries, staff ? FIX_LIMIT.staff : FIX_LIMIT.client);
  return (
    <section aria-labelledby="health-h" className={PANEL}>
      <h2 id="health-h" className={H2}>Search health</h2>
      {health.checked === 0
        ? <p className="mt-2 text-sm text-muted-foreground">{NO_PAGES}</p>
        : (
          <>
            <div className="mt-3 flex items-center gap-4">
              <Ring passing={health.passing} checked={health.checked} />
              <p className="text-sm">{health.fix.length ? "Some pages need a fix for Google." : "Every checked page passes."}</p>
            </div>
            {health.fix.length > 0 && (
              <>
                <h3 className="mt-4 text-sm font-medium">Fix these next</h3>
                <ul className="mt-1 space-y-2 text-sm">
                  {health.fix.map((item) => (
                    <li key={item.path}>
                      <span className="font-medium">{item.title || item.path}</span>
                      <span className="block text-muted-foreground">{item.firstProblem}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
            {health.passing > 0 && (
              <details className="mt-3 text-sm">
                <summary className="flex min-h-11 cursor-pointer items-center">{health.passing} {health.passing === 1 ? "page passes" : "pages pass"}</summary>
              </details>
            )}
          </>
        )}
    </section>
  );
}

export async function PublishLine(ref: RepoRef) {
  const sources = (await readUser(ref)) ? await insightsSourcesFor(ref.owner, ref.repo) : null;
  if (!sources?.pages) return null;
  const status = await fetchPublishStatus({
    accountId: process.env.KC_CF_ACCOUNT_ID,
    token: process.env.KC_CF_PAGES_TOKEN || process.env.CLOUDFLARE_ANALYTICS_TOKEN,
    project: sources.pages,
  });
  // Only the state and its time become text; nothing else from Cloudflare is rendered.
  const line = publishLine(status, new Date());
  if (!line) return null;
  return (
    <p role="status" className={`flex items-center gap-2 text-sm ${line.failed ? "text-destructive" : "text-muted-foreground"} ${FADE}`}>
      {line.busy && <span aria-hidden="true" className="size-2 rounded-full bg-primary motion-safe:animate-pulse" />}
      {line.text}
    </p>
  );
}

export async function StaffStrip({ user, ...ref }: RepoRef & { user: User }) {
  if (!hasGithubIdentity(user)) return null;
  const [status, sources] = [await getVersionStatus(), await insightsSourcesFor(ref.owner, ref.repo)];
  const rows: [string, ReactNode][] = [
    ["Version", versionText(status)],
    ["Repository", <a key="repo" className="inline-flex min-h-11 items-center underline-offset-4 hover:underline" href={`https://github.com/${ref.owner}/${ref.repo}`}>{ref.owner}/{ref.repo}</a>],
    ["Google Analytics", sources?.ga ? `Property ${sources.ga}` : "Not set up"],
    ["Cloudflare", [sources?.cf && `Site ${sources.cf}`, sources?.pages && `Pages ${sources.pages}`].filter(Boolean).join(", ") || "Not set up"],
  ];
  return (
    <aside id="analytics-ids" aria-labelledby="staff-h" className={`rounded-lg border border-dashed p-4 text-sm ${FADE}`}>
      <h2 id="staff-h" className={H2}>Staff only</h2>
      <dl className="mt-2 grid gap-1 @[600px]:grid-cols-2">
        {rows.map(([term, value]) => (
          <div key={term} className="flex flex-wrap items-baseline gap-x-2">
            <dt className="text-muted-foreground">{term}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <InsightsKeysForm owner={ref.owner} repo={ref.repo} sources={sources} />
    </aside>
  );
}

export async function VersionLine({ user }: { user: User }) {
  const status = versionFor(await getVersionStatus(), hasGithubIdentity(user));
  return <p className={`text-sm text-muted-foreground ${FADE}`}>{versionText(status)}</p>;
}
