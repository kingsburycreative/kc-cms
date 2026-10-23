import { type NextRequest } from "next/server";
import { createOctokitInstance } from "@/lib/utils/octokit";
import { getConfig } from "@/lib/config-store";
import { getToken } from "@/lib/token";
import { assertBranchAllowed } from "@/kc/branch-lock-server";
import { contentPaths, mergeSiteFeed } from "@/kc/history/site";
import { createHttpError, toErrorResponse } from "@/lib/api-error";
import { requireApiUserSession } from "@/lib/session-server";

/**
 * Fetches recent saves across every content path of the site.
 *
 * GET /api/[owner]/[repo]/[branch]/history?limit=[n]
 *
 * Requires authentication. Clients get redacted commits and no settings.
 */

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ owner: string, repo: string, branch: string }> }
) {
  try {
    const params = await context.params;
    const sessionResult = await requireApiUserSession();
    if ("response" in sessionResult) return sessionResult.response;
    const user = sessionResult.user;

    const { token, source } = await getToken(user, params.owner, params.repo);
    await assertBranchAllowed(source, token, params.owner, params.repo, params.branch);
    if (!token) throw createHttpError("Token not found", 401);

    const limit = Math.min(Math.max(Number(request.nextUrl.searchParams.get("limit")) || 30, 1), 100);

    const config = await getConfig(params.owner, params.repo, params.branch, {
      getToken: async () => token,
    });
    if (!config) throw createHttpError(`Configuration not found for ${params.owner}/${params.repo}/${params.branch}.`, 404);

    const octokit = createOctokitInstance(token);
    const lists = await Promise.all(contentPaths(config.object).map(async (path) => {
      const response = await octokit.rest.repos.listCommits({
        owner: params.owner,
        repo: params.repo,
        path,
        sha: params.branch,
        per_page: limit,
      });
      return { path, commits: response.data };
    }));

    return Response.json({
      status: "success",
      data: mergeSiteFeed(lists, { limit, source }),
    });
  } catch (error: any) {
    console.error(error);
    return toErrorResponse(error);
  }
}
