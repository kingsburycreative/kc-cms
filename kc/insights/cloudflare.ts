// Cloudflare Web Analytics totals for the Insights screen: one GraphQL request
// body and a parser that turns the answer into the same cards GA4 makes.
// Endpoint and auth: https://developers.cloudflare.com/analytics/graphql-api/getting-started/execute-graphql-query/
// Dataset rumPageloadEventsAdaptiveGroups is listed at
// https://developers.cloudflare.com/data-localization/metadata-boundary/graphql-datasets/
// The fields siteTag, date_geq/date_leq, sum.visits, count and dimensions.requestPath
// were not found in Cloudflare's public docs; they follow the dashboard's own
// Web Analytics query and should be checked by introspection before launch:
// https://developers.cloudflare.com/analytics/graphql-api/features/discovery/introspection/
import * as cards from "./cards.ts";

export const CF_GRAPHQL_URL = "https://api.cloudflare.com/client/v4/graphql";
export const CF_TOP_PAGES = 5;

export type CloudflareRequest = { query: string; variables: Record<string, string> };

const QUERY = `query ($accountTag: string!, $siteTag: string!, $start: Date!, $end: Date!, $prevStart: Date!, $prevEnd: Date!) {
  viewer {
    accounts(filter: { accountTag: $accountTag }) {
      current: rumPageloadEventsAdaptiveGroups(limit: 1, filter: { siteTag: $siteTag, date_geq: $start, date_leq: $end }) { count sum { visits } }
      previous: rumPageloadEventsAdaptiveGroups(limit: 1, filter: { siteTag: $siteTag, date_geq: $prevStart, date_leq: $prevEnd }) { count sum { visits } }
      pages: rumPageloadEventsAdaptiveGroups(limit: ${CF_TOP_PAGES}, orderBy: [count_DESC], filter: { siteTag: $siteTag, date_geq: $start, date_leq: $end }) { count dimensions { requestPath } }
    }
  }
}`;

const DAY_MS = 24 * 60 * 60 * 1000;
const isoDay = (ms: number) => new Date(ms).toISOString().slice(0, 10);

// The same windows as GA4's 28daysAgo..yesterday and 56daysAgo..29daysAgo.
export function cloudflareRequest(accountTag: string, siteTag: string, nowMs: number): CloudflareRequest {
  const day = (n: number) => isoDay(nowMs - n * DAY_MS);
  return {
    query: QUERY,
    variables: { accountTag, siteTag, start: day(28), end: day(1), prevStart: day(56), prevEnd: day(29) },
  };
}

type Group = { count?: number; sum?: { visits?: number }; dimensions?: { requestPath?: string } };
export type CloudflareResponse = {
  data?: { viewer?: { accounts?: { current?: Group[]; previous?: Group[]; pages?: Group[] }[] } } | null;
  errors?: unknown[] | null;
};

const visits = (groups: Group[] | undefined) => String((groups ?? []).reduce((n, g) => n + (g.sum?.visits ?? 0), 0));

export function cloudflareCards(res: CloudflareResponse, trim: (path: string) => string = (p) => p) {
  const account = res.data?.viewer?.accounts?.[0];
  const visitors = cards.visitorsCard({
    rows: [
      { dimensionValues: [{ value: "current" }], metricValues: [{ value: visits(account?.current) }] },
      { dimensionValues: [{ value: "previous" }], metricValues: [{ value: visits(account?.previous) }] },
    ],
  });
  const pages = cards.topPagesCard({
    rows: (account?.pages ?? []).map((g) => ({
      dimensionValues: [{ value: g.dimensions?.requestPath === undefined ? undefined : trim(g.dimensions.requestPath) }],
      metricValues: [{ value: String(g.count ?? 0) }],
    })),
  });
  return { visitors, pages };
}
