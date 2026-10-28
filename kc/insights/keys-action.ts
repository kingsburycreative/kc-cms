"use server";
// The staff strip's save. The signed-in user comes from the session cookie and
// admin comes from GitHub with their token, on every call.
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getUserToken } from "@/lib/token";
import { createOctokitInstance } from "@/lib/utils/octokit";
import { hasAdminAccess } from "@/lib/admin";
import { fileReposUsing, saveInsightsKeys, type KeysField, type SaveResult } from "./keys.ts";
import { saveInsightsKeysRow, tableReposUsing } from "./keys-db.ts";
import { loadInsightsMap } from "./map.ts";

const reposUsing = async (field: KeysField, value: string) => [
  ...(await tableReposUsing(field, value)),
  ...fileReposUsing(loadInsightsMap(process.env.KC_INSIGHTS_MAP), field, value),
];

const isRepoAdmin = async (token: string, owner: string, repo: string) => {
  const { data } = await createOctokitInstance(token).rest.repos.get({ owner, repo });
  return data.permissions?.admin === true;
};

export async function saveInsightsKeysAction(_prev: SaveResult | null, form: FormData): Promise<SaveResult> {
  const session = await auth.api.getSession({ headers: await headers() }).catch(() => null);
  const text = (name: string) => String(form.get(name) ?? "");
  return saveInsightsKeys(
    { owner: text("owner"), repo: text("repo"), ga: text("ga"), cf: text("cf"), pages: text("pages") },
    {
      user: (session?.user as { id: string; githubUsername?: string | null } | undefined) ?? null,
      isStaff: () => hasAdminAccess(session?.user),
      userToken: getUserToken,
      isAdmin: isRepoAdmin,
      reposUsing,
      save: saveInsightsKeysRow,
    },
  );
}
