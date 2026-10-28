import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import { reviewsLine } from "../reviews/status.ts";

// dashboard-server.tsx cannot be loaded by the runner, so the copy block is cut out and run.
const server = readFileSync(new URL("../dashboard-server.tsx", import.meta.url), "utf8");
const layout = readFileSync(new URL("../dashboard.tsx", import.meta.url), "utf8");
const block = server.slice(server.indexOf("// reviews-copy-start"), server.indexOf("// reviews-copy-end")).replace(/export /g, "");
const { REVIEWS_COPY, REVIEWS_STALE, reviewsText } = new Function(`${stripTypeScriptTypes(block)}; return { REVIEWS_COPY, REVIEWS_STALE, reviewsText };`)();

const now = new Date("2026-10-28T00:00:00Z");
const status = (source: string, asOf: string) => ({ source, rating: 4.8, count: 30, asOf }) as any;

test("an unknown status draws nothing", () => {
  assert.equal(reviewsText({ state: "unknown" }), null);
  assert.equal(reviewsText(reviewsLine(null, now)), null);
});

test("no kc.site draws nothing, before any fetch", () => {
  const body = server.slice(server.indexOf("export async function ReviewsLine"), server.indexOf("export async function StaffStrip"));
  assert.ok(body.indexOf("if (!site) return null") < body.indexOf("fetchReviewsStatus("));
});

test("each source key maps to its own copy", () => {
  for (const source of ["typed", "hidden", "live"]) {
    const line = reviewsLine(status(source, "2026-10-01"), now);
    if (source === "typed") continue;
    assert.equal(reviewsText(line), REVIEWS_COPY[`reviews-${source}`]);
  }
  assert.match(REVIEWS_COPY["reviews-typed"], /typed in by hand/);
  assert.match(REVIEWS_COPY["reviews-hidden"], /isn't showing/);
  assert.match(REVIEWS_COPY["reviews-live"], /set to follow/);
});

test("the stale nudge shows only when stale is true", () => {
  const stale = reviewsText(reviewsLine(status("typed", "2025-01-01"), now));
  const fresh = reviewsText(reviewsLine(status("typed", "2026-10-01"), now));
  assert.ok(stale.endsWith(REVIEWS_STALE));
  assert.ok(!fresh.includes(REVIEWS_STALE));
  assert.ok(!reviewsText(reviewsLine(status("hidden", "2020-01-01"), now)).includes(REVIEWS_STALE));
});

const typed = (rating: number, count: number, asOf: string, extra: object = {}) =>
  ({ source: "typed", rating, count, asOf, ...extra }) as any;

test("a typed status gives the stars, count and date", () => {
  const text = reviewsText(reviewsLine(typed(5, 24, "2026-10-12"), now));
  assert.ok(text.includes("5 stars"));
  assert.ok(text.includes("24 reviews"));
  assert.ok(text.includes("Oct 12"));
  assert.ok(text.includes("typed in by hand"));
});

test("the rating is plain, and one review is singular", () => {
  assert.ok(reviewsText(reviewsLine(typed(4.8, 30, "2026-10-12"), now)).includes("4.8 stars"));
  assert.ok(!reviewsText(reviewsLine(typed(5, 30, "2026-10-12"), now)).includes("5.0"));
  assert.ok(reviewsText(reviewsLine(typed(5, 1, "2026-10-12"), now)).includes("1 review,"));
});

test("a remote error string is never shown", () => {
  const line = reviewsLine(typed(5, 24, "2026-10-12", { error: "SECRET-ERR" }), now);
  assert.ok(!JSON.stringify(line).includes("SECRET-ERR"));
  assert.ok(!reviewsText(line).includes("SECRET-ERR"));
});

test("hidden and live text are unchanged, and a stale typed figure still nudges", () => {
  assert.equal(reviewsText(reviewsLine(status("hidden", "2026-10-01"), now)), REVIEWS_COPY["reviews-hidden"]);
  assert.equal(reviewsText(reviewsLine(status("live", "2026-10-01"), now)), REVIEWS_COPY["reviews-live"]);
  const stale = reviewsText(reviewsLine(typed(5, 24, "2025-01-01"), now));
  assert.ok(stale.includes("24 reviews") && stale.endsWith(REVIEWS_STALE));
});

test("ReviewsSkeleton uses kc-shimmer and page.tsx wires the line", () => {
  const skeleton = readFileSync(new URL("../dashboard-skeleton.tsx", import.meta.url), "utf8");
  const body = skeleton.slice(skeleton.indexOf("export function ReviewsSkeleton"), skeleton.indexOf("export function StaffSkeleton"));
  assert.match(body, /BLOCK/);
  assert.match(skeleton, /const BLOCK = "[^"]*kc-shimmer/);
  const page = readFileSync(new URL("../../app/(main)/[owner]/[repo]/[branch]/page.tsx", import.meta.url), "utf8");
  assert.match(page, /reviews=\{<Suspense fallback=\{<ReviewsSkeleton \/>\}><ReviewsLine \{\.\.\.ref\} \/><\/Suspense>\}/);
});

test("it is one plain muted line, server-rendered, with no raw HTML", () => {
  assert.doesNotMatch(server + layout, /dangerouslySetInnerHTML/);
  assert.match(server, /<p className=\{`text-sm text-muted-foreground \$\{FADE\}`\}>\{text\}<\/p>/);
  assert.match(layout, /\{reviews\}/);
});
