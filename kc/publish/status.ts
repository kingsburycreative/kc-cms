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
  const ended = latest.latest_stage?.ended_on;
  const at = typeof ended === "string" && !Number.isNaN(Date.parse(ended)) ? ended : latest.created_on!;
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

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"} ago`;

// "just now", "5 minutes ago", "yesterday", "on 3 Oct". Lower case; callers capitalise.
export function timeAgo(iso: string | null | undefined, now: Date): string {
  const t = Date.parse(iso ?? "");
  if (Number.isNaN(t)) return "";
  const diff = Math.max(0, now.getTime() - t);
  if (diff < MINUTE) return "just now";
  if (diff < HOUR) return plural(Math.floor(diff / MINUTE), "minute");
  if (diff < DAY) return plural(Math.floor(diff / HOUR), "hour");
  const days = Math.floor(diff / DAY);
  if (days === 1) return "yesterday";
  if (days < 7) return plural(days, "day");
  if (days < 14) return "last week";
  return `on ${new Date(t).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "America/Toronto" })}`;
}

export type PublishLine = { text: string; busy: boolean; failed: boolean };

// The one line under the site name. Nothing when the state is unknown.
export function publishLine(status: PublishStatus, now: Date): PublishLine | null {
  if (status.state === "published") return { text: `Published ${timeAgo(status.at, now)}`, busy: false, failed: false };
  if (status.state === "publishing") return { text: "Publishing your change...", busy: true, failed: false };
  if (status.state === "failed") {
    return { text: "Your last change didn't publish. Your site still shows the version before it.", busy: false, failed: true };
  }
  return null;
}
