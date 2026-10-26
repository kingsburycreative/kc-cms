import { Suspense } from "react";
import { getInsightsAccess, getRepoReadContext } from "@/lib/api-repo-context";
import { hasGithubIdentity } from "@/lib/authz-shared";
import { insightsPropertyFor } from "@/kc/insights/map";
import type { User } from "@/types/user";
import { Dashboard } from "@/kc/dashboard.tsx";
import { PublishLine, SearchHealthPanel, StaffStrip, TopLists, VersionLine, VisitsPanel } from "@/kc/dashboard-server.tsx";
import { PublishSkeleton, SearchHealthSkeleton, StaffSkeleton, TopListsSkeleton, VersionSkeleton, VisitsSkeleton } from "@/kc/dashboard-skeleton.tsx";

export default async function Page({
  params,
}: {
  params: Promise<{ owner: string; repo: string; branch: string; }>;
}) {
  const { owner, repo, branch: rawBranch } = await params;
  const branch = decodeURIComponent(rawBranch);
  // The repo read check runs before any panel reads repo content.
  let user: User | null = null;
  try {
    user = (await getRepoReadContext({ owner, repo, branch })).user as User;
  } catch {}
  if (!user) return <Dashboard />;
  const hasInsights = insightsPropertyFor(owner, repo) !== null && await getInsightsAccess(user, owner, repo);
  const ref = { owner, repo, branch };

  return (
    <Dashboard
      hasInsights={hasInsights}
      publish={<Suspense fallback={<PublishSkeleton />}><PublishLine {...ref} /></Suspense>}
      visits={<Suspense fallback={<VisitsSkeleton />}><VisitsPanel {...ref} /></Suspense>}
      searchHealth={<Suspense fallback={<SearchHealthSkeleton />}><SearchHealthPanel {...ref} /></Suspense>}
      topLists={<Suspense fallback={<TopListsSkeleton />}><TopLists {...ref} /></Suspense>}
      version={<Suspense fallback={<VersionSkeleton />}><VersionLine user={user} /></Suspense>}
      staffStrip={hasGithubIdentity(user) ? <Suspense fallback={<StaffSkeleton />}><StaffStrip user={user} {...ref} /></Suspense> : null}
    />
  );
}
