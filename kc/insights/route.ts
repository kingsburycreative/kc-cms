// Server side of the Insights screen: key file, report calls, the one-hour cache
// and card assembly. fetch, the clock and the logger are passed in.
import { readFileSync } from "node:fs";
import { fetchAccessToken, type ServiceAccountKey } from "./token.ts";
import * as reports from "./reports.ts";
import * as cards from "./cards.ts";
import type { RunReportRequest } from "./reports.ts";
import type { RunReportResponse } from "./cards.ts";

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
    cities: cards.topCitiesCard(cities),
    pages: cards.topPagesCard(trimRows(pages)),
    channels: cards.channelsCard(channels),
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
