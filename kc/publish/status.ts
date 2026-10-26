// Turns a site's Cloudflare Pages deployments into one publish state. Pure: no I/O.
// Only the latest production deployment counts; previews are ignored. The result
// carries the state and a time, nothing else from the deployment.

export type Deployment = {
  environment?: string;
  created_on?: string;
  latest_stage?: { status?: string; ended_on?: string | null };
};

export type PublishStatus =
  | { state: "published"; at: string }
  | { state: "publishing" }
  | { state: "failed"; at: string }
  | { state: "unknown" };

export function publishStatus(deployments: unknown, now: Date): PublishStatus {
  if (!Array.isArray(deployments)) return { state: "unknown" };
  let latest: Deployment | null = null;
  let latestTime = -Infinity;
  for (const d of deployments as Deployment[]) {
    if (!d || d.environment !== "production" || typeof d.created_on !== "string") continue;
    const t = Date.parse(d.created_on);
    // A deployment dated after `now` is clock skew or junk; skip it.
    if (Number.isNaN(t) || t > now.getTime()) continue;
    if (t > latestTime) {
      latest = d;
      latestTime = t;
    }
  }
  if (!latest) return { state: "unknown" };

  const status = latest.latest_stage?.status;
  const at = latest.latest_stage?.ended_on || latest.created_on!;
  switch (status) {
    case "success":
      return { state: "published", at };
    case "active":
    case "queued":
    case "idle":
      return { state: "publishing" };
    case "failure":
    case "canceled":
      return { state: "failed", at };
    default:
      return { state: "unknown" };
  }
}
