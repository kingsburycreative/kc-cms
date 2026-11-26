import { and, eq, isNotNull, isNull, or, sql } from "drizzle-orm";
import { nameToApply } from "@/kc/invite-name";
import { emailKeySql, normaliseEmail } from "@/kc/email-normalise";
import { db } from "@/db";
import { collaboratorInviteTable, collaboratorTable, userTable } from "@/db/schema";
import type { User } from "@/types/user";

const normalizeEmail = (email: string) => email.trim().toLowerCase();

// KC (card 112): email comparisons go through kc/email-normalise, so Gmail
// addresses match with or without dots and "+tags".
// An unclaimed invite matches by email only once that email is verified.
const collaboratorMatchesUser = (user: Pick<User, "id" | "email" | "emailVerified">) => {
  if (user.emailVerified !== true) return eq(collaboratorTable.userId, user.id);
  return or(
    eq(collaboratorTable.userId, user.id),
    and(
      isNull(collaboratorTable.userId),
      sql`${emailKeySql(collaboratorTable.email)} = ${normaliseEmail(user.email)}`,
    ),
  );
};

const collaboratorMatchesUserForRepo = (
  user: Pick<User, "id" | "email" | "emailVerified">,
  owner: string,
  repo: string,
) => (
  and(
    collaboratorMatchesUser(user),
    sql`lower(${collaboratorTable.owner}) = lower(${owner})`,
    sql`lower(${collaboratorTable.repo}) = lower(${repo})`,
  )
);

const collaboratorMatchesInvite = (email: string, owner: string, repo: string) => (
  and(
    sql`${emailKeySql(collaboratorTable.email)} = ${normaliseEmail(email)}`,
    sql`lower(${collaboratorTable.owner}) = lower(${owner})`,
    sql`lower(${collaboratorTable.repo}) = lower(${repo})`,
  )
);

const findVerifiedUserByEmail = async (email: string) => {
  return db.query.userTable.findFirst({
    where: and(
      sql`${emailKeySql(userTable.email)} = ${normaliseEmail(email)}`,
      eq(userTable.emailVerified, true),
    ),
  });
};

const bindCollaboratorInvitesToUser = async (user: Pick<User, "id" | "email" | "emailVerified" | "name">) => {
  if (!user.emailVerified) return;

  const invite = await db.query.collaboratorInviteTable.findFirst({
    where: and(
      sql`${emailKeySql(collaboratorInviteTable.email)} = ${normaliseEmail(user.email)}`,
      isNotNull(collaboratorInviteTable.name),
    ),
  });
  const newName = nameToApply(user.name, invite?.name);
  if (newName) {
    await db.update(userTable).set({ name: newName }).where(eq(userTable.id, user.id));
  }

  await db
    .update(collaboratorTable)
    .set({ userId: user.id })
    .where(
      and(
        isNull(collaboratorTable.userId),
        sql`${emailKeySql(collaboratorTable.email)} = ${normaliseEmail(user.email)}`,
      ),
    );

  await db
    .delete(collaboratorInviteTable)
    .where(sql`${emailKeySql(collaboratorInviteTable.email)} = ${normaliseEmail(user.email)}`);
};

// The DB side of kc/invite-gate.ts: is this address a user or a pending invite?
const knownEmailLookups = {
  user: async (email: string) => !!(await db.query.userTable.findFirst({
    where: sql`${emailKeySql(userTable.email)} = ${normaliseEmail(email)}`,
  })),
  pendingCollaborator: async (email: string) => !!(await db.query.collaboratorTable.findFirst({
    where: and(
      isNull(collaboratorTable.userId),
      sql`${emailKeySql(collaboratorTable.email)} = ${normaliseEmail(email)}`,
    ),
  })),
  invite: async (email: string) => !!(await db.query.collaboratorInviteTable.findFirst({
    where: sql`${emailKeySql(collaboratorInviteTable.email)} = ${normaliseEmail(email)}`,
  })),
};

export {
  bindCollaboratorInvitesToUser,
  knownEmailLookups,
  collaboratorMatchesInvite,
  collaboratorMatchesUser,
  collaboratorMatchesUserForRepo,
  findVerifiedUserByEmail,
  normalizeEmail,
};
