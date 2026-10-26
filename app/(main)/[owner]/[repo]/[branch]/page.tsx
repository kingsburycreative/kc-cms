import { Suspense } from "react";
import { getInsightsAccess, getRepoReadContext } from "@/lib/api-repo-context";
import { insightsPropertyFor } from "@/kc/insights/map";
import type { User } from "@/types/user";
import { Dashboard } from "@/kc/dashboard.tsx";
import { SearchHealthPanel, VersionLine, VisitsPanel } from "@/kc/dashboard-server.tsx";
import { SearchHealthSkeleton, VersionSkeleton, VisitsSkeleton } from "@/kc/dashboard-skeleton.tsx";

export default async function Page({
  params,
}: {
  params: Promise<{ owner: string; repo: string; branch: string; }>;
}) {
  const { owner, repo, branch } = await params;
  // The repo read check runs before any panel reads repo content.
  let user: User | null = null;
  try {
    user = (await getRepoReadContext({ owner, repo, branch: decodeURIComponent(branch) })).user as User;
  } catch {}
  if (!user) return <Dashboard />;
  const hasInsights = insightsPropertyFor(owner, repo) !== null && await getInsightsAccess(user, owner, repo);
  const ref = { owner, repo, branch };

  return (
    <Dashboard
      hasInsights={hasInsights}
      visits={<Suspense fallback={<VisitsSkeleton />}><VisitsPanel {...ref} /></Suspense>}
      searchHealth={<Suspense fallback={<SearchHealthSkeleton />}><SearchHealthPanel {...ref} /></Suspense>}
      version={<Suspense fallback={<VersionSkeleton />}><VersionLine user={user} /></Suspense>}
    />
  );
}