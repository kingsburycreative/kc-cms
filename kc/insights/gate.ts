// Who may see Insights: an admin, a GitHub-login user with push on the repo,
// or an email-login collaborator of that exact repo. Nobody else.
export type InsightsGateInput = {
  isAdmin: boolean;
  loginType: "github" | "email";
  permissions?: { push?: boolean } | null;
  isCollaborator: boolean;
};

export function canSeeInsights({ isAdmin, loginType, permissions, isCollaborator }: InsightsGateInput): boolean {
  if (isAdmin) return true;
  if (loginType === "github") return permissions?.push === true;
  return isCollaborator;
}
