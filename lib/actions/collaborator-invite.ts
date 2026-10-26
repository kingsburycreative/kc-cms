// Invite logic shared by the collaborator action and scripts/add-editor.mts.
// Relative imports only, so plain Node (and the tests) can load it.

import { randomBytes } from "crypto";
import { and, sql } from "drizzle-orm";
import { z } from "zod";
import { collaboratorInviteTable } from "../../db/schema.ts";
import { clientName } from "../../kc/client-view.ts";
import type { db as Db } from "@/db";

type InviteDb = Pick<typeof Db, "delete" | "insert">;

// The site's kc.client name, falling back to the repo name made readable.
const clientNameFor = async (owner: string, repo: string) => {
  try {
    const { getConfig } = await import("@/lib/config-store");
    const config = await getConfig(owner, repo, "main", { bootstrapOnMiss: false });
    const kc = (config?.object as { kc?: { client?: string } } | null | undefined)?.kc;
    return clientName(kc, repo);
  } catch {
    return clientName(null, repo);
  }
};

const parseInviteEmails = (raw: FormDataEntryValue | null) => {
  const value = typeof raw === "string" ? raw : "";
  const parts = value
    .split(/[\n,]+/)
    .map((part) => part.trim())
    .filter(Boolean);

  const unique = Array.from(new Set(parts.map((email) => email.toLowerCase())));
  return z.array(z.string().email()).safeParse(unique);
};

const isRepoInInstallation = (
  installationRepos: { id?: number; name?: string; owner?: { login?: string } | null }[],
  repoId: number,
  owner: string,
  repo: string,
) => installationRepos.some((installationRepo) =>
  installationRepo.id === repoId ||
  (
    installationRepo.owner?.login?.toLowerCase() === owner.toLowerCase() &&
    installationRepo.name?.toLowerCase() === repo.toLowerCase()
  )
);

const generateInviteToken = () => {
  const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const bytes = randomBytes(32);
  let token = "";

  for (let i = 0; i < 32; i += 1) {
    token += alphabet[bytes[i] % alphabet.length];
  }

  return token;
};

const createCollaboratorInviteUrl = async (db: InviteDb, {
  email,
  owner,
  repo,
  baseUrl,
  name = null,
}: {
  email: string;
  owner: string;
  repo: string;
  baseUrl: string;
  name?: string | null;
}) => {
  const token = generateInviteToken();
  const expiresAt = new Date(
    Date.now() + ((Number(process.env.COLLABORATOR_INVITE_LINK_EXPIRES_IN) || 86400) * 1000),
  );

  await db
    .delete(collaboratorInviteTable)
    .where(
      and(
        sql`lower(${collaboratorInviteTable.email}) = lower(${email})`,
        sql`lower(${collaboratorInviteTable.owner}) = lower(${owner})`,
        sql`lower(${collaboratorInviteTable.repo}) = lower(${repo})`,
      ),
    );

  await db.insert(collaboratorInviteTable).values({
    token,
    email,
    owner,
    repo,
    name,
    expiresAt,
  });

  const inviteUrl = new URL("/sign-in/collaborator", baseUrl);
  inviteUrl.searchParams.set("token", token);

  return inviteUrl.toString();
};

export { clientNameFor, createCollaboratorInviteUrl, isRepoInInstallation, parseInviteEmails };
