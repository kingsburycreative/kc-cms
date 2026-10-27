// Server fetch of a site's Cloudflare Pages deployments. Any failure gives
// "unknown" and one fixed warn line with no URL, header or token. Never throws.
import { publishStatus, type PublishStatus } from "./status.ts";

type FetchLike = (
  url: string,
  init?: { headers?: Record<string, string>; next?: { revalidate: number } },
) => Promise<{ ok: boolean; status?: number; json: () => Promise<unknown> }>;

export type PublishTarget = {
  accountId?: string | null;
  token?: string | null;
  project?: string | null;
};

const PROJECT_NAME = /^[a-z0-9-]+$/;

export async function fetchPublishStatus(
  target: PublishTarget,
  fetchImpl?: FetchLike,
  warn: (line: string) => void = (line) => console.warn(line),
): Promise<PublishStatus> {
  const { accountId, token, project } = target;
  if (!accountId || !token || !project) return { state: "unknown" };
  if (!PROJECT_NAME.test(project)) return { state: "unknown" };

  const fetchFn = fetchImpl ?? (fetch as unknown as FetchLike);
  const url =
    "https://api.cloudflare.com/client/v4/accounts/" +
    encodeURIComponent(accountId) +
    "/pages/projects/" +
    encodeURIComponent(project) +
    "/deployments";

  let body: unknown;
  try {
    const res = await fetchFn(url, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 30 },
    });
    if (!res.ok) {
      const code = Number.isInteger(res.status) ? ` (HTTP ${res.status})` : "";
      warn(`publish status unknown: deployments request failed${code}`);
      return { state: "unknown" };
    }
    body = await res.json();
  } catch {
    warn("publish status unknown: deployments request failed");
    return { state: "unknown" };
  }
  const result = (body as { result?: unknown } | null)?.result;
  if (!Array.isArray(result)) {
    warn("publish status unknown: deployments response malformed");
    return { state: "unknown" };
  }
  return publishStatus(result, new Date());
}
