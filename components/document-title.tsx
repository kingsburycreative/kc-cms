"use client";

import { useEffect } from "react";
import { BRAND_NAME } from "@/kc/brand";
import { useOptionalConfig } from "@/contexts/config-context";
import { useUser } from "@/contexts/user-context";
import { hasGithubIdentity } from "@/lib/authz-shared";
import { documentTitleFor } from "@/kc/client-view";

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
  const config = useOptionalConfig();
  const clientTitle = documentTitleFor({ config, isClient: !hasGithubIdentity(user) });

  useEffect(() => {
    document.title = clientTitle ?? formatDocumentTitle(title);
  }, [title, clientTitle]);

  return null;
}
