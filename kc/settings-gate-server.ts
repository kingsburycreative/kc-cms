// Server side of the settings gate. Push is checked with the user's own GitHub
// token (requireGithubRepoWriteAccess); a missing or failing token is a denial.
import type { User } from "@/types/user";
import { hasGithubIdentity } from "@/lib/authz-shared";
import { requireGithubRepoWriteAccess } from "@/lib/authz-server";
import { createHttpError } from "@/lib/api-error";
import { pushDenial } from "./settings-gate.ts";

export async function requireOwnRepoPush(
  user: Pick<User, "id" | "githubUsername">,
  owner: string,
  repo: string,
  identityMessage: string,
): Promise<void> {
  const githubIdentity = hasGithubIdentity(user);
  let push = false;
  if (githubIdentity) {
    try {
      await requireGithubRepoWriteAccess(user, owner, repo, identityMessage);
      push = true;
    } catch {
      push = false;
    }
  }

  const denial = pushDenial({ githubIdentity, push });
  if (denial === "identity") throw createHttpError(identityMessage, 403);
  if (denial === "push") throw createHttpError(`You do not have write access to "${owner}/${repo}".`, 403);
}
