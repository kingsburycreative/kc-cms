// Server side of the Insights screen: key file, report calls, the one-hour cache
// and card assembly. fetch, the clock and the logger are passed in.
import { readFileSync } from "node:fs";
import { fetchAccessToken, type ServiceAccountKey } from "./token.ts";
import * as reports from "./reports.ts";
import * as cards from "./cards.ts";
import type { RunReportRequest } from "./reports.ts";
import type { RunReportResponse } from "./cards.ts";
import {
  CF_GRAPHQL_URL,
  cloudflareCards,
  cloudflareRequest,
  cloudflareSeries,
  cloudflareSeriesRequest,
  type CloudflareResponse,
  type CloudflareSeriesResponse,
} from "./cloudflare.ts";
import { ga4Day, zeroFilled, type Series } from "./series.ts";

type Fetch = (url: string, init: { method: string; headers: Record<string, string>; body: string }) => Promise<{
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
}>;

export type InsightsCards = {
  visitors: cards.VisitorsCard;
  cities: cards.ListCard;
  pages: cards.ListCard;
  channels: cards.ListCard;
  engagement: cards.EngagementCard;
};
export type InsightsResult = { ok: true; cards: InsightsCards } | { ok: false; message: string };

export const TTL_MS = 60 * 60 * 1000;
export const PAGE_PATH_MAX = 80;
export const LOAD_FAILED = "Insights couldn't load right now";

export const trimPagePath = (path: string, max = PAGE_PATH_MAX) =>
  path.length > max ? `${path.slice(0, max - 1)}…` : path;

export function readKey(path: string | undefined, read = (p: string) => readFileSync(p, "utf8")): ServiceAccountKey | null {
  if (!path) return null;
  try {
    const key = JSON.parse(read(path)) as Partial<ServiceAccountKey>;
    if (typeof key.client_email !== "string" || typeof key.private_key !== "string") return null;
    return { client_email: key.client_email, private_key: key.private_key };
  } catch {
    return null;
  }
}

export function createCache<T>(now: () => number = Date.now) {
  const entries = new Map<string, { value: T; expiresAt: number }>();
  return async (id: string, load: () => Promise<T>): Promise<T> => {
    const hit = entries.get(id);
    if (hit && hit.expiresAt > now()) return hit.value;
    const value = await load();
    entries.set(id, { value, expiresAt: now() + TTL_MS });
    return value;
  };
}

class GoogleError extends Error {
  status: number;
  constructor(status: number) {
    super(`status ${status}`);
    this.status = status;
  }
}

async function runReport(fetchFn: Fetch, propertyId: string, token: string, body: RunReportRequest) {
  const res = await fetchFn(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new GoogleError(res.status);
  return (await res.json()) as RunReportResponse;
}

const trimRows = (res: RunReportResponse): RunReportResponse => ({
  rows: res.rows?.map((row) => ({
    ...row,
    dimensionValues: row.dimensionValues?.map((d) => ({ value: d.value === undefined ? undefined : trimPagePath(d.value) })),
  })),
});

async function buildCards(key: ServiceAccountKey, propertyId: string, fetchFn: Fetch, now: () => number) {
  // Wrap fetch so a failed token call is reported by its status like a report call.
  let lastStatus = 0;
  const tracked: Fetch = async (url, init) => {
    const res = await fetchFn(url, init);
    lastStatus = res.status;
    return res;
  };
  let token: string;
  try {
    token = (await fetchAccessToken(key, tracked, now)).accessToken;
  } catch {
    throw new GoogleError(lastStatus);
  }
  const run = (body: RunReportRequest) => runReport(fetchFn, propertyId, token, body);
  const [visitors, cities, pages, channels, engagement] = await Promise.all([
    run(reports.visitorsReport()),
    run(reports.topCitiesReport()),
    run(reports.topPagesReport()),
    run(reports.channelsReport()),
    run(reports.engagementReport()),
  ]);
  return {
    visitors: cards.visitorsCard(visitors),
    cities: cards.topCitiesCard(trimRows(cities)),
    pages: cards.topPagesCard(trimRows(pages)),
    channels: cards.channelsCard(trimRows(channels)),
    engagement: cards.engagementCard(engagement),
  };
}

export type LoadOptions = {
  propertyId: string;
  key: ServiceAccountKey | null;
  fetchFn: Fetch;
  cache: ReturnType<typeof createCache<InsightsCards>>;
  now?: () => number;
  log?: (line: string) => void;
};

export async function loadInsights(opts: LoadOptions): Promise<InsightsResult> {
  const { propertyId, key, fetchFn, cache, now = Date.now, log = console.error } = opts;
  if (!key) return { ok: false, message: LOAD_FAILED };
  try {
    return { ok: true, cards: await cache(propertyId, () => buildCards(key, propertyId, fetchFn, now)) };
  } catch (error) {
    // One line, the status code only: no body, no URL, no token.
    const status = error instanceof GoogleError && error.status ? error.status : "unknown";
    log(`Insights: Google request failed with status ${status}`);
    return { ok: false, message: LOAD_FAILED };
  }
}

export const defaultCache = createCache<InsightsCards>();

// Cloudflare totals beside GA4 detail. Totals come from Cloudflare when it
// answers; the GA4 detail cards are shown under the consent label then.
export type CloudflareTotals = { visitors: cards.VisitorsCard; pages: cards.ListCard };
export type SiteInsights =
  | {
      ok: true;
      totalsFrom: "cloudflare" | "ga4";
      visitors: cards.VisitorsCard;
      pages: cards.ListCard;
      detail: { cities: cards.ListCard; channels: cards.ListCard; engagement: cards.EngagementCard } | null;
    }
  | { ok: false; message: string };

export type CloudflareOptions = {
  siteTag: string;
  accountId: string | undefined;
  token: string | undefined;
  cache: ReturnType<typeof createCache<CloudflareTotals>>;
};

async function loadCloudflare(cf: CloudflareOptions, fetchFn: Fetch, now: () => number, log: (line: string) => void) {
  const { siteTag, accountId, token, cache } = cf;
  if (!accountId || !token) return null;
  try {
    return await cache(siteTag, async () => {
      const res = await fetchFn(CF_GRAPHQL_URL, {
        method: "POST",
        headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
        body: JSON.stringify(cloudflareRequest(accountId, siteTag, now())),
      });
      if (!res.ok) throw new GoogleError(res.status);
      const data = (await res.json()) as CloudflareResponse;
      // GraphQL reports query errors inside a 200.
      if (data.errors?.length || !data.data) throw new GoogleError(res.status);
      return cloudflareCards(data, trimPagePath);
    });
  } catch (error) {
    // One line, the status code only: no body, no URL, no token.
    const status = error instanceof GoogleError && error.status ? error.status : "unknown";
    log(`Insights: Cloudflare request failed with status ${status}`);
    return null;
  }
}

export type SiteLoadOptions = Omit<LoadOptions, "propertyId"> & {
  propertyId: string | null | undefined;
  cloudflare: CloudflareOptions | null;
};

export async function loadSiteInsights(opts: SiteLoadOptions): Promise<SiteInsights> {
  const { propertyId, cloudflare, now = Date.now, log = console.error } = opts;
  const [ga, cf] = await Promise.all([
    propertyId ? loadInsights({ ...opts, propertyId, now, log }) : null,
    cloudflare ? loadCloudflare(cloudflare, opts.fetchFn, now, log) : null,
  ]);
  const detail = ga?.ok
    ? { cities: ga.cards.cities, channels: ga.cards.channels, engagement: ga.cards.engagement }
    : null;
  if (cf) return { ok: true, totalsFrom: "cloudflare", visitors: cf.visitors, pages: cf.pages, detail };
  if (ga?.ok) return { ok: true, totalsFrom: "ga4", visitors: ga.cards.visitors, pages: ga.cards.pages, detail };
  return { ok: false, message: LOAD_FAILED };
}

export const defaultCloudflareCache = createCache<CloudflareTotals>();

// The chart history: Cloudflare first, GA4 when Cloudflare is missing or fails,
// null when neither answers. Cached for an hour per site; a failure is not cached.
export type SeriesOptions = {
  site: string;
  propertyId: string | null | undefined;
  key: ServiceAccountKey | null;
  cloudflare: Omit<CloudflareOptions, "cache"> | null;
  fetchFn: Fetch;
  cache: ReturnType<typeof createCache<Series>>;
  now?: () => number;
  log?: (line: string) => void;
};

async function cloudflareSeriesFor(cf: Omit<CloudflareOptions, "cache">, fetchFn: Fetch, nowMs: number, log: (line: string) => void) {
  const { siteTag, accountId, token } = cf;
  if (!accountId || !token) return null;
  try {
    const res = await fetchFn(CF_GRAPHQL_URL, {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify(cloudflareSeriesRequest(accountId, siteTag, nowMs)),
    });
    if (!res.ok) throw new GoogleError(res.status);
    const data = (await res.json()) as CloudflareSeriesResponse;
    if (data.errors?.length || !data.data) throw new GoogleError(res.status);
    return cloudflareSeries(data, nowMs);
  } catch (error) {
    // One line, the status code only: no body, no URL, no token.
    const status = error instanceof GoogleError && error.status ? error.status : "unknown";
    log(`Insights: Cloudflare series request failed with status ${status}`);
    return null;
  }
}

async function ga4Series(key: ServiceAccountKey, propertyId: string, fetchFn: Fetch, now: () => number) {
  const token = (await fetchAccessToken(key, fetchFn, now)).accessToken;
  const res = await runReport(fetchFn, propertyId, token, reports.dailyReport());
  const rows = (res.rows ?? []).flatMap((row) => {
    const day = ga4Day(row.dimensionValues?.[0]?.value);
    if (!day) return [];
    return [{ day, visits: Number(row.metricValues?.[0]?.value) || 0, views: Number(row.metricValues?.[1]?.value) || 0 }];
  });
  return zeroFilled(now(), rows);
}

export async function loadSeries(opts: SeriesOptions): Promise<Series | null> {
  const { site, propertyId, key, cloudflare, fetchFn, cache, now = Date.now, log = console.error } = opts;
  try {
    return await cache(site, async (): Promise<Series> => {
      const cf = cloudflare ? await cloudflareSeriesFor(cloudflare, fetchFn, now(), log) : null;
      if (cf) return { from: "cloudflare", days: cf };
      if (propertyId && key) return { from: "ga4", days: await ga4Series(key, propertyId, fetchFn, now) };
      throw new Error("no source");
    });
  } catch (error) {
    if (error instanceof GoogleError) log(`Insights: Google series request failed with status ${error.status}`);
    return null;
  }
}

export const defaultSeriesCache = createCache<Series>();
