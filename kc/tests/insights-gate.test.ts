import { test } from "node:test";
import assert from "node:assert/strict";
import { canSeeInsights } from "../insights/gate.ts";

test("an admin sees Insights whatever else is true", () => {
  assert.equal(canSeeInsights({ isAdmin: true, loginType: "email", isCollaborator: false }), true);
  assert.equal(canSeeInsights({ isAdmin: true, loginType: "github", permissions: { push: false }, isCollaborator: false }), true);
});

test("a GitHub user with push sees Insights", () => {
  assert.equal(canSeeInsights({ isAdmin: false, loginType: "github", permissions: { push: true }, isCollaborator: false }), true);
});

test("a read-only GitHub user is denied, even as a collaborator row", () => {
  assert.equal(canSeeInsights({ isAdmin: false, loginType: "github", permissions: { push: false }, isCollaborator: false }), false);
  assert.equal(canSeeInsights({ isAdmin: false, loginType: "github", permissions: null, isCollaborator: false }), false);
  assert.equal(canSeeInsights({ isAdmin: false, loginType: "github", isCollaborator: true }), false);
});

test("an email collaborator of the repo sees Insights", () => {
  assert.equal(canSeeInsights({ isAdmin: false, loginType: "email", isCollaborator: true }), true);
});

test("a stranger is denied", () => {
  assert.equal(canSeeInsights({ isAdmin: false, loginType: "email", isCollaborator: false }), false);
  assert.equal(canSeeInsights({ isAdmin: false, loginType: "email", permissions: { push: true }, isCollaborator: false }), false);
});
