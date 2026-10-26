// Async server panels for the dashboard. Each one re-runs the repo read check
// itself, so no token, account id or key path is ever passed in as a prop.
import { getInsightsAccess, getRepoReadContext } from "@/lib/api-repo-context";
import { getCollectionCache } from "@/lib/github-cache-file";
import { parse } from "@/lib/serialization";
import { hasGithubIdentity } from "@/lib/authz-shared";
import type { User } from "@/types/user";
import { insightsSourcesFor } from "./insights/map.ts";
import { defaultSeriesCache, loadSeries, readKey } from "./insights/route.ts";
import type { Series } from "./insights/series.ts";
import { MetricChart } from "./insights/chart.tsx";
import { seoTargets, siteHealth, type SiteEntry } from "./seo/site.ts";
import { getVersionStatus } from "./update/status-fetch.ts";
import type { VersionStatus } from "./update/status.ts";
import { weekSummary } from "./dashboard-visits.ts";

export const VISITS_FALLBACK = "Visit numbers aren't available right now.";
const FIX_LIMIT = 5;
// Crossfade from the skeleton, once; still under reduced motion.
const FADE = "motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300";

type RepoRef = { owner: string; repo: string; branch: string };

// The series cache is shared by everyone who can see a site, so its key is the site.
export const seriesSiteKey = (owner: string, repo: string) => `${owner}/${repo}`;

// Clients learn only whether an update exists; staff also get the tag.
export function versionFor(status: VersionStatus, isStaff: boolean): VersionStatus {
  return isStaff ? status : { state: status.state } as VersionStatus;
}

export function versionText(status: VersionStatus): string {
  if (status.state === "current") return "The CMS is up to date.";
  if (status.state === "unknown") return "Couldn't check the CMS version.";
  return "tag" in status && status.tag ? `Pages CMS ${status.tag} is out.` : "A CMS update is available.";
}

export function visitsView(series: Series | null) {
  return series ? { ok: true as const, days: series.days, sentence: weekSummary(series.days).sentence } : { ok: false as const, sentence: VISITS_FALLBACK };
}

async function readUser({ owner, repo, branch }: RepoRef) {
  try {
    return await getRepoReadContext({ owner, repo, branch: decodeURIComponent(branch) });
  } catch {
    return null;
  }
}

export async function VisitsPanel(ref: RepoRef) {
  const ctx = await readUser(ref);
  if (!ctx || !(await getInsightsAccess(ctx.user, ref.owner, ref.repo))) return null;
  const sources = insightsSourcesFor(ref.owner, ref.repo);
  if (!sources) return null;
  const series = await loadSeries({
    site: seriesSiteKey(ref.owner, ref.repo),
    propertyId: sources.ga,
    key: readKey(process.env.KC_GA4_KEY_FILE),
    fetchFn: fetch,
    cache: defaultSeriesCache,
    cloudflare: sources.cf
      ? { siteTag: sources.cf, accountId: process.env.KC_CF_ACCOUNT_ID, token: process.env.CLOUDFLARE_ANALYTICS_TOKEN }
      : null,
  }).catch(() => null);
  const view = visitsView(series);
  return (
    <section className={`rounded-lg border p-4 ${FADE}`}>
      <h2 className="text-sm font-medium text-muted-foreground">Visits</h2>
      <p className="mt-2">{view.sentence}</p>
      {view.ok && <MetricChart days={view.days} metric="visits" range={30} compact />}
    </section>
  );
}

export async function SearchHealthPanel(ref: RepoRef) {
  const ctx = await readUser(ref);
  if (!ctx) return null;
  const content = ((ctx.config.object as { content?: unknown })?.content ?? []) as any[];
  const entries: SiteEntry[] = [];
  for (const schema of content) {
    if (schema?.type !== "collection" || typeof schema.path !== "string") continue;
    const targets = seoTargets(schema.fields);
    if (!targets.title || !targets.description) continue;
    try {
      const files = await getCollectionCache(ref.owner, ref.repo, ref.branch, schema.path, ctx.token, schema.view?.node?.filename);
      for (const file of files as any[]) {
        if (file.type !== "file" || typeof file.content !== "string") continue;
        try {
          const values = parse(file.content, { format: schema.format, delimiters: schema.delimiters });
          entries.push({ name: schema.name, path: file.path, values });
        } catch {}
      }
    } catch {}
  }
  const health = siteHealth(entries, FIX_LIMIT);
  if (health.checked === 0) return null;
  return (
    <section className={`rounded-lg border p-4 ${FADE}`}>
      <h2 className="text-sm font-medium text-muted-foreground">Search health</h2>
      <p className="mt-2">{health.passing} of {health.checked} pages pass the search checks</p>
      {health.fix.length > 0 && (
        <>
          <h3 className="mt-3 text-sm font-medium">Fix these next</h3>
          <ul className="mt-1 space-y-1 text-sm">
            {health.fix.map((item) => (
              <li key={item.path}>
                <span className="font-medium">{item.title || item.path}</span>
                <span className="block text-muted-foreground">{item.firstProblem}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

export async function VersionLine({ user }: { user: User }) {
  const status = versionFor(await getVersionStatus(), hasGithubIdentity(user));
  return <p className={`text-sm text-muted-foreground ${FADE}`}>{versionText(status)}</p>;
}
