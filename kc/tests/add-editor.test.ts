import { test } from "node:test";
import assert from "node:assert/strict";
import { getTableName } from "drizzle-orm";
import { addEditor, type AddEditorDeps } from "../../scripts/add-editor.mts";
import { addedSubject, inviteSubject } from "../email.ts";

type Row = { table: string; values: Record<string, unknown> };

const fake = (opts: { user?: { id: string }; existing?: { userId: string | null }; installed?: boolean } = {}) => {
  const rows: Row[] = [];
  const deleted: string[] = [];
  const sent: { to: string; subject: string; html: string }[] = [];
  const db = {
    query: { collaboratorTable: { findFirst: async () => opts.existing } },
    insert: (table: any) => ({
      values: (values: Record<string, unknown>) => {
        rows.push({ table: getTableName(table), values });
        return { returning: async () => [values] };
      },
    }),
    delete: (table: any) => ({ where: async () => { deleted.push(getTableName(table)); } }),
  };
  const deps = {
    db,
    findVerifiedUserByEmail: async () => opts.user,
    getRepoInstallation: async (owner: string, repo: string) => {
      if (opts.installed === false) throw new Error("Not Found");
      return {
        installationId: 7,
        installationRepos: [{ id: 42, name: repo, owner: { login: owner } }],
        repoAccess: { repoId: 42, ownerId: 1, ownerLogin: "kingsburycreative", repoName: repo, ownerType: "org" },
      };
    },
    clientNameFor: async () => "Acme",
    renderInvite: async (p: { inviteUrl: string; invitedByName: string }) => `invite ${p.inviteUrl} by ${p.invitedByName}`,
    renderAdded: async (p: { repoUrl: string; invitedByName: string }) => `added ${p.repoUrl} by ${p.invitedByName}`,
    sendEmail: async (m: { to: string; subject: string; html: string }) => { sent.push(m); },
    baseUrl: "https://cms.example.test",
  } as unknown as AddEditorDeps;
  return { deps, rows, deleted, sent };
};

const args = (...extra: string[]) => ["--repo", "kingsburycreative/acme", "--email", "Jane@Example.com", ...extra];

test("a new address gets one invite row, one collaborator row and one invite email", async () => {
  const f = fake();
  const r = await addEditor(args("--name", "Jane Smith"), f.deps);
  assert.equal(r.code, 0);
  const invites = f.rows.filter((row) => row.table === "collaborator_invite");
  assert.equal(invites.length, 1);
  assert.equal(invites[0].values.email, "jane@example.com");
  assert.equal(invites[0].values.name, "Jane Smith");
  const collabs = f.rows.filter((row) => row.table === "collaborator");
  assert.equal(collabs.length, 1);
  assert.equal(collabs[0].values.userId, null);
  assert.equal(collabs[0].values.invitedBy, null);
  assert.equal(f.sent.length, 1);
  assert.equal(f.sent[0].subject, inviteSubject("Acme"));
  assert.match(f.sent[0].html, /by Kingsbury Creative$/);
  const token = invites[0].values.token as string;
  assert.match(f.sent[0].html, new RegExp(`token=${token}`));
  assert.ok(!r.line.includes(token));
  assert.ok(!r.line.includes("sign-in/collaborator"));
});

test("an existing user is added and gets the access email", async () => {
  const f = fake({ user: { id: "u1" } });
  const r = await addEditor(args(), f.deps);
  assert.equal(r.code, 0);
  assert.deepEqual(f.rows.map((row) => row.table), ["collaborator"]);
  assert.equal(f.rows[0].values.userId, "u1");
  assert.equal(f.sent.length, 1);
  assert.equal(f.sent[0].subject, addedSubject("Acme"));
});

test("a repeat run says so, writes nothing and sends nothing", async () => {
  const f = fake({ existing: { userId: null } });
  const r = await addEditor(args(), f.deps);
  assert.equal(r.code, 0);
  assert.match(r.line, /already invited/);
  assert.equal(f.rows.length + f.deleted.length + f.sent.length, 0);
});

const refused = async (argv: string[], opts = {}) => {
  const f = fake(opts);
  const r = await addEditor(argv, f.deps);
  assert.notEqual(r.code, 0);
  assert.equal(f.rows.length + f.deleted.length + f.sent.length, 0);
  return r;
};

test("another owner is refused", async () => {
  await refused(["--repo", "someoneelse/acme", "--email", "jane@example.com"]);
  await refused(["--repo", "acme", "--email", "jane@example.com"]);
});

test("a malformed email is refused", async () => {
  await refused(["--repo", "kingsburycreative/acme", "--email", "not-an-email"]);
  await refused(["--repo", "kingsburycreative/acme", "--email", "a@example.com,b@example.com"]);
});

test("a repo outside the installation is refused", async () => {
  await refused(args(), { installed: false });
});

test("--dry-run writes nothing and sends nothing", async () => {
  const f = fake();
  const r = await addEditor(args("--dry-run"), f.deps);
  assert.equal(r.code, 0);
  assert.match(r.line, /^Dry run: would invite/);
  assert.equal(f.rows.length + f.deleted.length + f.sent.length, 0);
});
