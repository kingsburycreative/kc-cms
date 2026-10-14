import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  KcSchema,
  clientName,
  dashboardName,
  repoDisplayName,
  viewFor,
  repoHref,
  repoListLabel,
  soleRepoRedirect,
} from "../client-view.ts";

test("repo name falls back to words, capitalised", () => {
  assert.equal(repoDisplayName("henike-tree-service"), "Henike Tree Service");
  assert.equal(clientName(undefined, "henike-tree-service"), "Henike Tree Service");
  assert.equal(clientName({}, "acme"), "Acme");
  assert.equal(dashboardName(null, "henike-tree-service"), "Henike Tree Service Dashboard");
});

test("kc.client overrides the fallback", () => {
  assert.equal(clientName({ client: "Henike Tree" }, "henike-tree-service"), "Henike Tree");
  assert.equal(dashboardName({ client: "Henike Tree" }, "x"), "Henike Tree Dashboard");
  assert.equal(clientName({ client: "  " }, "acme-co"), "Acme Co");
});

test("kc schema accepts client and rejects other keys", () => {
  assert.equal(KcSchema.safeParse({ client: "Acme" }).success, true);
  assert.equal(KcSchema.safeParse({}).success, true);
  assert.equal(KcSchema.safeParse({ client: "Acme", other: 1 }).success, false);
  assert.equal(KcSchema.safeParse({ client: 5 }).success, false);
});

test("config schema wires in the kc piece", () => {
  const src = readFileSync(new URL("../../lib/config-schema.ts", import.meta.url), "utf8");
  assert.match(src, /kc: KcSchema\.optional\(\)/);
});

test("a client sees less than Rob", () => {
  const client = viewFor(true);
  const rob = viewFor(false);
  assert.deepEqual(Object.values(client.sidebar), [false, false, false, false, false]);
  assert.deepEqual(Object.values(rob.sidebar), [true, true, true, true, true]);
  assert.equal(client.home.recentVisits, false);
  assert.equal(rob.home.recentVisits, true);
  assert.equal(client.home.templates, false);
  assert.equal(rob.home.templates, false);
});

test("a client with one unfiltered repo is redirected, nobody else", () => {
  const one = [{ owner: "kc", repo: "henike-tree-service", defaultBranch: "main" }];
  const two = [...one, { owner: "kc", repo: "other" }];
  assert.equal(soleRepoRedirect(true, "", one), "/kc/henike-tree-service/main");
  assert.equal(soleRepoRedirect(true, "  ", one), "/kc/henike-tree-service/main");
  assert.equal(soleRepoRedirect(false, "", one), null);
  assert.equal(soleRepoRedirect(true, "hen", one), null);
  assert.equal(soleRepoRedirect(true, "", two), null);
  assert.equal(soleRepoRedirect(true, "", []), null);
  assert.equal(soleRepoRedirect(true, "", null), null);
  assert.equal(soleRepoRedirect(true, "", [{ owner: "a", repo: "b" }]), "/a/b/");
  assert.equal(repoHref({ owner: "a", repo: "b", defaultBranch: "x/y" }), "/a/b/x%2Fy");
});

test("list label is the dashboard name for a client only", () => {
  assert.equal(repoListLabel(true, "henike-tree-service"), "Henike Tree Service Dashboard");
  assert.equal(repoListLabel(false, "henike-tree-service"), "henike-tree-service");
});
