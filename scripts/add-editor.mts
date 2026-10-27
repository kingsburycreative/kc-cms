// Add a client editor to one site without a web session: what the Invite
// button does on /<owner>/<repo>/collaborators, run on the box as root.
//   node --import tsx scripts/add-editor.mts --repo kingsburycreative/<repo> --email <address> [--name "<Full Name>"] [--dry-run]
// Prints one line. Never prints the invite link, a token or an env value.

import { parseArgs } from "node:util";
import { pathToFileURL } from "node:url";
import { and, eq, sql } from "drizzle-orm";
import { collaboratorTable } from "../db/schema.ts";
import { addedSubject, inviteSubject } from "../kc/email.ts";
import { cleanInviteName } from "../kc/invite-name.ts";
import {
  createCollaboratorInviteUrl,
  isRepoInInstallation,
  parseInviteEmails,
} from "../lib/actions/collaborator-invite.ts";
import type { db as Db } from "@/db";

const OWNER = "kingsburycreative";
const INVITED_BY = "Kingsbury Creative";

type RepoAccess = {
  repoId: number;
  ownerId: number;
  ownerLogin: string;
  repoName: string;
  ownerType: string;
};

type EmailProps = { email: string; repoName: string; invitedByName: string };

export type AddEditorDeps = {
  db: Pick<typeof Db, "delete" | "insert"> & {
    query: { collaboratorTable: Pick<typeof Db.query.collaboratorTable, "findFirst"> };
  };
  findVerifiedUserByEmail: (email: string) => Promise<{ id: string } | undefined>;
  // Through the GitHub App's own credentials, never a user token.
  getRepoInstallation: (owner: string, repo: string) => Promise<{
    repoAccess: RepoAccess;
    installationId: number;
    installationRepos: { id?: number; name?: string; owner?: { login?: string } | null }[];
  }>;
  clientNameFor: (owner: string, repo: string) => Promise<string>;
  renderInvite: (props: EmailProps & { inviteUrl: string }) => Promise<string>;
  renderAdded: (props: EmailProps & { repoUrl: string }) => Promise<string>;
  sendEmail: (input: { to: string; subject: string; html: string }) => Promise<unknown>;
  baseUrl: string;
};

const fail = (line: string) => ({ code: 1, line });

export const addEditor = async (argv: string[], deps: AddEditorDeps) => {
  let values;
  try {
    ({ values } = parseArgs({
      args: argv,
      options: {
        repo: { type: "string" },
        email: { type: "string" },
        name: { type: "string" },
        "dry-run": { type: "boolean", default: false },
      },
      strict: true,
    }));
  } catch (error: any) {
    return fail(`Usage: --repo ${OWNER}/<repo> --email <address> [--name "<Full Name>"] [--dry-run]. ${error.message}`);
  }

  const [owner, repo, ...rest] = (values.repo ?? "").trim().split("/");
  if (owner?.toLowerCase() !== OWNER || !repo || rest.length > 0) {
    return fail(`Refused: --repo must be ${OWNER}/<repo>.`);
  }

  const emails = parseInviteEmails(values.email ?? null);
  if (!emails.success || emails.data.length !== 1) return fail("Refused: --email must be one valid address.");
  const email = emails.data[0];

  let name: string | null;
  try {
    name = cleanInviteName(values.name);
  } catch (error: any) {
    return fail(`Refused: ${error.message}`);
  }

  let installation;
  try {
    installation = await deps.getRepoInstallation(owner, repo);
  } catch {
    return fail(`Refused: ${owner}/${repo} is not in the GitHub App installation.`);
  }
  const { repoAccess, installationId, installationRepos } = installation;
  if (!isRepoInInstallation(installationRepos, repoAccess.repoId, owner, repo)) {
    return fail(`Refused: ${owner}/${repo} is not in the GitHub App installation.`);
  }

  const existing = await deps.db.query.collaboratorTable.findFirst({
    where: and(
      eq(collaboratorTable.ownerId, repoAccess.ownerId),
      eq(collaboratorTable.repoId, repoAccess.repoId),
      sql`lower(${collaboratorTable.email}) = lower(${email})`,
    ),
  });
  if (existing) {
    return { code: 0, line: `${email} is already ${existing.userId ? "an editor" : "invited"} on ${owner}/${repo}. Nothing sent.` };
  }

  const user = await deps.findVerifiedUserByEmail(email);
  const dryRun = values["dry-run"] === true;
  if (dryRun) {
    return {
      code: 0,
      line: user
        ? `Dry run: would add ${email} to ${owner}/${repo} and send the access email.`
        : `Dry run: would invite ${email} to ${owner}/${repo} and send the invite email.`,
    };
  }

  const client = await deps.clientNameFor(owner, repo);
  try {
    if (!user) {
      const inviteUrl = await createCollaboratorInviteUrl(deps.db, { email, owner, repo, baseUrl: deps.baseUrl, name });
      const html = await deps.renderInvite({ inviteUrl, repoName: client, email, invitedByName: INVITED_BY });
      await deps.sendEmail({ to: email, subject: inviteSubject(client), html });
    } else {
      const repoUrl = new URL(`/${owner}/${repo}`, deps.baseUrl).toString();
      const html = await deps.renderAdded({ repoUrl, repoName: client, email, invitedByName: INVITED_BY });
      await deps.sendEmail({ to: email, subject: addedSubject(client), html });
    }
  } catch (error: any) {
    return fail(`Failed to email ${email}: ${error.message}`);
  }

  await deps.db.insert(collaboratorTable).values({
    type: repoAccess.ownerType,
    installationId,
    ownerId: repoAccess.ownerId,
    repoId: repoAccess.repoId,
    owner: repoAccess.ownerLogin,
    repo: repoAccess.repoName,
    email,
    userId: user?.id ?? null,
    invitedBy: null,
  });

  return {
    code: 0,
    line: user ? `Added ${email} to ${owner}/${repo}; access email sent.` : `Invited ${email} to ${owner}/${repo}; invite email sent.`,
  };
};

// The real wiring. Loaded only when run, so the tests need no database or tsx.
const realDeps = async (): Promise<AddEditorDeps> => {
  const { App } = await import("@octokit/app");
  const { render } = await import("@react-email/render");
  const { db } = await import("../db/index.ts");
  const { findVerifiedUserByEmail } = await import("../lib/collaborator-access.ts");
  const { clientNameFor } = await import("../lib/actions/collaborator-invite.ts");
  const { sendEmail } = await import("../lib/mailer.ts");
  const { getBaseUrl } = await import("../lib/base-url.ts");
  const { InviteEmailTemplate } = await import("../components/email/invite.tsx");
  const { CollaboratorAddedEmailTemplate } = await import("../components/email/collaborator-added.tsx");

  return {
    db,
    findVerifiedUserByEmail,
    getRepoInstallation: async (owner, repo) => {
      const app = new App({ appId: process.env.GITHUB_APP_ID!, privateKey: process.env.GITHUB_APP_PRIVATE_KEY! });
      const { data: installation } = await app.octokit.request("GET /repos/{owner}/{repo}/installation", { owner, repo });
      const octokit = await app.getInstallationOctokit(installation.id);
      const { data: r } = await octokit.request("GET /repos/{owner}/{repo}", { owner, repo });
      const installationRepos = [];
      for (let page = 1; ; page += 1) {
        const { data } = await octokit.request("GET /installation/repositories", { per_page: 100, page });
        installationRepos.push(...data.repositories);
        if (data.repositories.length < 100) break;
      }
      return {
        installationId: installation.id,
        installationRepos,
        repoAccess: {
          repoId: r.id,
          ownerId: r.owner.id,
          ownerLogin: r.owner.login,
          repoName: r.name,
          ownerType: r.owner.type === "User" ? "user" : "org",
        },
      };
    },
    clientNameFor,
    renderInvite: (props) => render(InviteEmailTemplate(props)),
    renderAdded: (props) => render(CollaboratorAddedEmailTemplate(props)),
    sendEmail,
    baseUrl: getBaseUrl(),
  };
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  let result;
  try {
    result = await addEditor(process.argv.slice(2), await realDeps());
  } catch (error: any) {
    result = fail(`Failed: ${error.message}`);
  }
  console.log(result.line);
  process.exit(result.code);
}
