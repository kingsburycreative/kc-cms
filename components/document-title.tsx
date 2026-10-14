"use client";

import { useEffect } from "react";
import { BRAND_NAME } from "@/kc/brand";
import { useConfig } from "@/contexts/config-context";
import { useUser } from "@/contexts/user-context";
import { hasGithubIdentity } from "@/lib/authz-shared";
import { dashboardName } from "@/kc/client-view";

const APP_TITLE = BRAND_NAME;

export const formatDocumentTitle = (title?: string | null) =>
  title ? `${title} | ${APP_TITLE}` : APP_TITLE;

export const formatRepoBranchTitle = (
  title: string,
  owner: string,
  repo: string,
  branch?: string,
) => {
  const repoRef = `${owner}/${repo}${branch ? `@${branch}` : ""}`;
  return `${title} | ${repoRef}`;
};

export function DocumentTitle({
  title,
}: {
  title?: string | null;
}) {
  const { user } = useUser();
  // Outside a repo there is no config provider; useConfig throws there.
  let config = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    config = useConfig().config;
  } catch {}
  const clientTitle =
    config && !hasGithubIdentity(user)
      ? dashboardName((config.object as any)?.kc, config.repo)
      : null;

  useEffect(() => {
    document.title = clientTitle ?? formatDocumentTitle(title);
  }, [title, clientTitle]);

  return null;
}
