import { getServerSession } from "@/lib/session-server";
import { insightsPropertyFor } from "@/kc/insights/map";
import { getInsightsAccess } from "@/lib/api-repo-context";
import { Dashboard } from "@/kc/dashboard.tsx";

export default async function Page({
  params,
}: {
  params: Promise<{ owner: string; repo: string; branch: string; }>;
}) {
  const { owner, repo } = await params;
  const session = await getServerSession();
  const user = session?.user;
  const hasInsights = !!user && insightsPropertyFor(owner, repo) !== null && await getInsightsAccess(user, owner, repo);

  return <Dashboard hasInsights={hasInsights} />;
}
