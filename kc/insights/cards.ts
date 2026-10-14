// Turns GA4 runReport responses into plain card data: numbers and one sentence.

export type RunReportResponse = {
  rows?: { dimensionValues?: { value?: string }[]; metricValues?: { value?: string }[] }[];
};

export type VisitorsCard = { current: number; previous: number; changePercent: number | null; sentence: string };
export type ListCard = { items: { label: string; value: number }[]; sentence: string };
export type EngagementCard = { averageSeconds: number; sentence: string };

const num = (v: string | undefined): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};
const plural = (n: number, word: string) => `${n.toLocaleString("en-US")} ${word}${n === 1 ? "" : "s"}`;

// Two named dateRanges and no dimension: GA4 adds a dateRange dimension per row.
export function visitorsCard(res: RunReportResponse): VisitorsCard {
  let current = 0;
  let previous = 0;
  for (const row of res.rows ?? []) {
    const value = num(row.metricValues?.[0]?.value);
    if (row.dimensionValues?.[0]?.value === "previous") previous += value;
    else current += value;
  }
  if (current === 0 && previous === 0) {
    return { current, previous, changePercent: null, sentence: "No visitors yet in the last 28 days." };
  }
  const head = `${plural(current, "visitor")} in the last 28 days`;
  if (previous === 0) return { current, previous, changePercent: null, sentence: `${head}, new this month.` };
  const changePercent = Math.round(((current - previous) / previous) * 100);
  const trend =
    changePercent === 0 ? "about the same as the month before"
      : `${changePercent > 0 ? "up" : "down"} ${Math.abs(changePercent)}% on the month before`;
  return { current, previous, changePercent, sentence: `${head}, ${trend}.` };
}

function listCard(res: RunReportResponse, empty: string, describe: (top: string) => string): ListCard {
  const items = (res.rows ?? []).map((row) => ({
    label: row.dimensionValues?.[0]?.value ?? "(not set)",
    value: num(row.metricValues?.[0]?.value),
  }));
  return { items, sentence: items.length ? describe(items[0].label) : empty };
}

export const topPagesCard = (res: RunReportResponse) =>
  listCard(res, "No page views yet.", (top) => `Your most visited page is ${top}.`);
export const topCitiesCard = (res: RunReportResponse) =>
  listCard(res, "No visitor locations yet.", (top) => `Most visitors come from ${top}.`);
export const channelsCard = (res: RunReportResponse) =>
  listCard(res, "No traffic sources yet.", (top) => `Most visitors arrive through ${top}.`);

export function engagementCard(res: RunReportResponse): EngagementCard {
  const metrics = res.rows?.[0]?.metricValues;
  const seconds = num(metrics?.[0]?.value);
  const users = num(metrics?.[1]?.value);
  if (users === 0) return { averageSeconds: 0, sentence: "No engagement time yet." };
  const averageSeconds = Math.round(seconds / users);
  const m = Math.floor(averageSeconds / 60);
  const s = averageSeconds % 60;
  const time = m ? `${m} min ${s} s` : `${s} s`;
  return { averageSeconds, sentence: `Visitors spend about ${time} on the site.` };
}
