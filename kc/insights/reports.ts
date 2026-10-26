// GA4 Data API runReport request bodies for the Insights cards.
// Every dimension and metric name below was checked against
// https://developers.google.com/analytics/devguides/reporting/data/v1/api-schema

export type RunReportRequest = {
  dateRanges: { startDate: string; endDate: string; name?: string }[];
  dimensions?: { name: string }[];
  metrics: { name: string }[];
  orderBys?: { metric: { metricName: string }; desc: boolean }[];
  limit?: number;
};

// Visitors are activeUsers, the count GA4's own reports call "Users".
// https://developers.google.com/analytics/devguides/reporting/data/v1/api-schema
export const VISITORS = "activeUsers";
// https://developers.google.com/analytics/devguides/reporting/data/v1/api-schema
export const CHANNEL = "sessionDefaultChannelGroup";
// Total engaged seconds; divided by activeUsers it is GA4's "average engagement time".
// https://developers.google.com/analytics/devguides/reporting/data/v1/api-schema
export const ENGAGEMENT = "userEngagementDuration";

const LAST_28 = { startDate: "28daysAgo", endDate: "yesterday", name: "current" };
const PREVIOUS_28 = { startDate: "56daysAgo", endDate: "29daysAgo", name: "previous" };

function topBy(dimension: string, limit: number): RunReportRequest {
  return {
    dateRanges: [LAST_28],
    dimensions: [{ name: dimension }],
    metrics: [{ name: VISITORS }],
    orderBys: [{ metric: { metricName: VISITORS }, desc: true }],
    limit,
  };
}

export const visitorsReport = (): RunReportRequest => ({
  dateRanges: [LAST_28, PREVIOUS_28],
  metrics: [{ name: VISITORS }],
});
export const topPagesReport = (): RunReportRequest => topBy("pagePath", 5);
export const topCitiesReport = (): RunReportRequest => topBy("city", 5);
export const channelsReport = (): RunReportRequest => topBy(CHANNEL, 10);
// Daily history for the charts: dimension date (YYYYMMDD), metrics sessions
// and screenPageViews, the last 90 days including today.
// https://developers.google.com/analytics/devguides/reporting/data/v1/api-schema
export const DAILY_VISITS = "sessions";
export const DAILY_VIEWS = "screenPageViews";
export const dailyReport = (): RunReportRequest => ({
  dateRanges: [{ startDate: "89daysAgo", endDate: "today" }],
  dimensions: [{ name: "date" }],
  metrics: [{ name: DAILY_VISITS }, { name: DAILY_VIEWS }],
  limit: 100,
});
export const engagementReport = (): RunReportRequest => ({
  dateRanges: [LAST_28],
  metrics: [{ name: ENGAGEMENT }, { name: VISITORS }],
});
