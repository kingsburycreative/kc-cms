// A site's /reviews-status.json, checked, and the source-line key the
// dashboard draws from it. Pure: no fetch, no clock but the one passed in.

export type ReviewsSource = "typed" | "hidden" | "live";

export type ReviewsStatus = {
  source: ReviewsSource;
  rating: number;
  count: number;
  asOf: string;
  error?: string;
};

export type ReviewsLine =
  | { state: "unknown" }
  | { state: "known"; key: "reviews-typed" | "reviews-hidden" | "reviews-live"; stale: boolean };

const SOURCES: readonly string[] = ["typed", "hidden", "live"];
const KEYS = new Set(["source", "rating", "count", "asOf", "error"]);
const ISO_DATE = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})?)?$/;
export const STALE_MONTHS = 6;

// Exactly {source, rating, count, asOf, error?}; anything else is null.
export function validateReviewsStatus(body: unknown, now: Date): ReviewsStatus | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  const o = body as Record<string, unknown>;
  if (Object.keys(o).some((k) => !KEYS.has(k))) return null;
  const { source, rating, count, asOf, error } = o;
  if (typeof source !== "string" || !SOURCES.includes(source)) return null;
  if (typeof rating !== "number" || !Number.isFinite(rating) || rating < 0 || rating > 5) return null;
  if (typeof count !== "number" || !Number.isInteger(count) || count < 0) return null;
  if (typeof asOf !== "string" || !ISO_DATE.test(asOf)) return null;
  const at = Date.parse(asOf);
  if (Number.isNaN(at) || at > now.getTime()) return null;
  if (error !== undefined && typeof error !== "string") return null;
  const out: ReviewsStatus = { source: source as ReviewsSource, rating, count, asOf };
  if (error !== undefined) out.error = error;
  return out;
}

// Stale only for typed figures older than STALE_MONTHS before now.
export function reviewsLine(status: ReviewsStatus | null, now: Date): ReviewsLine {
  if (!status) return { state: "unknown" };
  const cutoff = new Date(now.getTime());
  cutoff.setUTCMonth(cutoff.getUTCMonth() - STALE_MONTHS);
  const stale = status.source === "typed" && Date.parse(status.asOf) < cutoff.getTime();
  return { state: "known", key: `reviews-${status.source}`, stale };
}
