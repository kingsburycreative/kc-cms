// Server fetch of a site's /reviews-status.json. The URL comes from kc.site,
// which the client can edit, so only a public https hostname is fetched, at
// its origin plus a fixed path, with no redirects, a timeout and a size cap.
// Any failure gives "unknown" and one fixed warn line with no URL. Never throws.
// The default fetch goes through safeLookup: every resolved address is checked
// against the special-purpose ranges and the socket gets that exact address,
// so a name pointing inside, or rebinding between checks, is refused.
import { request } from "node:https";
import { isIP } from "node:net";
import { Readable } from "node:stream";
import { createSafeLookup } from "./safe-lookup.ts";
import { createCache } from "../insights/route.ts";
import { reviewsLine, validateReviewsStatus, type ReviewsLine, type ReviewsStatus } from "./status.ts";

export type ReviewsFetchLike = (
  url: string,
  init: { signal: AbortSignal; redirect: "error"; headers: Record<string, string> },
) => Promise<{
  ok: boolean;
  headers?: { get: (name: string) => string | null };
  body?: ReadableStream<Uint8Array> | null;
}>;

export const REVIEWS_PATH = "/reviews-status.json";
export const MAX_BYTES = 16 * 1024;
export const TIMEOUT_MS = 5000;
export const WARN_LINE = "reviews status unknown: request failed";

const BLOCKED_SUFFIX = /(^|\.)(localhost|local|internal)$/;

// The origin to fetch, or null when the host is not a public https name.
export function reviewsUrl(site: string | null | undefined): string | null {
  if (typeof site !== "string") return null;
  let url: URL;
  try {
    url = new URL(site.trim());
  } catch {
    return null;
  }
  if (url.protocol !== "https:" || url.port) return null;
  const host = url.hostname.toLowerCase().replace(/\.$/, "");
  if (host.startsWith("[") || isIP(host)) return null;
  if (!host.includes(".") || BLOCKED_SUFFIX.test(host)) return null;
  // Every label numeric reads as an IPv4 form like 127.1 or 0x7f.1.
  if (host.split(".").every((l) => /^(0x[0-9a-f]*|\d+)$/.test(l))) return null;
  return url.origin + REVIEWS_PATH;
}

async function readCapped(res: Awaited<ReturnType<ReviewsFetchLike>>): Promise<string> {
  const declared = Number(res.headers?.get("content-length") ?? "");
  if (Number.isFinite(declared) && declared > MAX_BYTES) throw new Error("too large");
  if (!res.body) throw new Error("no body");
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_BYTES) {
      await reader.cancel().catch(() => {});
      throw new Error("too large");
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks).toString("utf8");
}

const safeLookup = createSafeLookup();

// node:https with the pinned lookup. A 3xx is not followed and is not ok.
export const httpsFetch: ReviewsFetchLike = (url, init) =>
  new Promise((resolve, reject) => {
    const req = request(
      url,
      { method: "GET", headers: init.headers, signal: init.signal, lookup: safeLookup as any, agent: false },
      (res) => {
        const code = res.statusCode ?? 0;
        resolve({
          ok: code >= 200 && code < 300,
          headers: { get: (n) => { const v = res.headers[n.toLowerCase()]; return typeof v === "string" ? v : null; } },
          body: Readable.toWeb(res) as unknown as ReadableStream<Uint8Array>,
        });
      },
    );
    req.on("error", reject);
    req.end();
  });

const defaultCache = createCache<ReviewsStatus>();

export async function fetchReviewsStatus(
  site: string | null | undefined,
  opts: {
    fetchImpl?: ReviewsFetchLike;
    cache?: ReturnType<typeof createCache<ReviewsStatus>>;
    now?: () => Date;
    warn?: (line: string) => void;
    timeoutMs?: number;
  } = {},
): Promise<ReviewsLine> {
  const { cache = defaultCache, now = () => new Date(), warn = (line) => console.warn(line), timeoutMs = TIMEOUT_MS } = opts;
  const url = reviewsUrl(site);
  if (!url) return { state: "unknown" };
  const fetchFn = opts.fetchImpl ?? httpsFetch;
  try {
    // Keyed by origin: a failure throws inside load, so it is not cached.
    const status = await cache(url, async () => {
      const signal = AbortSignal.timeout(timeoutMs);
      // The race ends the wait even when a fetch ignores the signal.
      const aborted = new Promise<never>((_, reject) =>
        signal.addEventListener("abort", () => reject(new Error("timeout")), { once: true }),
      );
      aborted.catch(() => {});
      const load = async () => {
        const res = await fetchFn(url, { signal, redirect: "error", headers: { accept: "application/json" } });
        if (!res.ok) throw new Error("status");
        const valid = validateReviewsStatus(JSON.parse(await readCapped(res)), now());
        if (!valid) throw new Error("malformed");
        return valid;
      };
      return Promise.race([load(), aborted]);
    });
    return reviewsLine(status, now());
  } catch {
    warn(WARN_LINE);
    return { state: "unknown" };
  }
}
