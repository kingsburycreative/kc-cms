import { createHttpError } from "@/lib/api-error";
import { hasAdminAccess } from "@/lib/admin";
import { createOctokitInstance } from "@/lib/utils/octokit";
import { canSeeInsights } from "@/kc/insights/gate";
import { getConfig } from "@/lib/config-store";
import { getGithubId } from "@/lib/github-account";
import { checkRepoAccess } from "@/lib/github-cache-permissions";
import { requireApiUserSession } from "@/lib/session-server";
import { getToken } from "@/lib/token";
import type { Config } from "@/types/config";
import type { User } from "@/types/user";

type RepoRef = {
  owner: string;
  repo: string;
  branch: string;
};

type RepoReadContext = {
  user: User;
  token: string;
  config: Config;
};

const getRepoReadContext = async ({ owner, repo, branch }: RepoRef): Promise<RepoReadContext> => {
  const sessionResult = await requireApiUserSession();
  if ("response" in sessionResult) {
    throw createHttpError("Not signed in.", sessionResult.response?.status ?? 401);
  }

  const user = sessionResult.user as User;
  const { token, source } = await getToken(user, owner, repo);
  if (!token) throw createHttpError("Token not found", 401);

  const githubId = await getGithubId(user.id);
  if (githubId && source === "user") {
    const hasAccess = await checkRepoAccess(token, owner, repo, githubId);
    if (!hasAccess) throw createHttpError(`No access to repository ${owner}/${repo}.`, 403);
  }

  const config = await getConfig(owner, repo, branch, {
    getToken: async () => token,
  });
  if (!config) throw createHttpError(`Configuration not found for ${owner}/${repo}/${branch}.`, 404);

  return { user, token, config };
};

// KC: Insights is narrower than repo read. checkRepoAccess caches a boolean only,
// so push permission costs one repos.get call here.
const getInsightsAccess = async (user: User, owner: string, repo: string): Promise<boolean> => {
  if (hasAdminAccess(user)) return true;
  try {
    const { token, source } = await getToken(user, owner, repo);
    const githubId = await getGithubId(user.id);
    if (githubId && source === "user") {
      const { data } = await createOctokitInstance(token).rest.repos.get({ owner, repo });
      return canSeeInsights({ isAdmin: false, loginType: "github", permissions: data.permissions, isCollaborator: false });
    }
    return canSeeInsights({ isAdmin: false, loginType: githubId ? "github" : "email", isCollaborator: source === "installation" });
  } catch {
    return false;
  }
};

export { getRepoReadContext, getInsightsAccess };
