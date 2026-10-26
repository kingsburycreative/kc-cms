// Daily history for the Insights charts: one 90-day list of Toronto days,
// zero-filled, that the 7, 30 and 90 day ranges are slices of.

export const RANGES = [7, 30, 90] as const;
export type Range = (typeof RANGES)[number];
export const SERIES_DAYS = 90;
export const TIME_ZONE = "America/Toronto";

export type SeriesPoint = { day: string; visits: number; views: number };
export type Series = { from: "cloudflare" | "ga4"; days: SeriesPoint[] };

const DAY_MS = 24 * 60 * 60 * 1000;
const dayFormat = new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit" });

// The Toronto calendar day, YYYY-MM-DD, an instant falls on.
export function torontoDay(instant: number | string): string {
  const parts = Object.fromEntries(dayFormat.formatToParts(new Date(instant)).map((p) => [p.type, p.value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}

// The last SERIES_DAYS Toronto days, oldest first, ending today. Noon UTC
// keeps the step clear of daylight-time edges.
export function seriesDays(nowMs: number): string[] {
  const today = Date.parse(`${torontoDay(nowMs)}T12:00:00Z`);
  return Array.from({ length: SERIES_DAYS }, (_, i) => new Date(today - (SERIES_DAYS - 1 - i) * DAY_MS).toISOString().slice(0, 10));
}

// Adds rows onto the day list; days with no rows stay at zero, rows outside it are dropped.
export function zeroFilled(nowMs: number, rows: SeriesPoint[]): SeriesPoint[] {
  const byDay = new Map(seriesDays(nowMs).map((day) => [day, { day, visits: 0, views: 0 }]));
  for (const r of rows) {
    const point = byDay.get(r.day);
    if (point) {
      point.visits += r.visits;
      point.views += r.views;
    }
  }
  return [...byDay.values()];
}

export const slice = (days: SeriesPoint[], range: Range) => days.slice(-range);

// GA4's date dimension is YYYYMMDD in the property's own time zone.
export function ga4Day(value: string | undefined): string | null {
  const m = /^(\d{4})(\d{2})(\d{2})$/.exec(value ?? "");
  return m ? `${m[1]}-${m[2]}-${m[3]}` : null;
}
