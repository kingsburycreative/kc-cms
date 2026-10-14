import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { compareVersions, newerRelease } from "../update/upstream.ts";

const workflow = readFileSync(
  new URL("../../.github/workflows/kc-upstream-sync.yml", import.meta.url),
  "utf8",
).replace(/\r\n/g, "\n");

test("semver compares numerically, not as text", () => {
  assert.ok(compareVersions("2.1.10", "2.1.9") > 0);
  assert.ok(compareVersions("2.2.0", "2.1.99") > 0);
  assert.ok(compareVersions("3.0.0", "2.9.9") > 0);
  assert.ok(compareVersions("2.1.8", "2.1.9") < 0);
});

test("semver accepts a v prefix", () => {
  assert.equal(compareVersions("v2.1.8", "2.1.8"), 0);
  assert.ok(compareVersions("v2.1.9", "2.1.8") > 0);
});

test("a prerelease ranks below its release", () => {
  assert.ok(compareVersions("2.2.0-beta.1", "2.2.0") < 0);
});

test("drafts and prereleases are skipped", () => {
  const releases = [
    { tag_name: "v2.3.0", draft: true },
    { tag_name: "v2.2.0", prerelease: true },
    { tag_name: "v2.4.0-rc.1" },
    { tag_name: "v2.1.8" },
  ];
  assert.equal(newerRelease("2.1.8", releases), null);
});

test("no newer release gives no action", () => {
  assert.equal(newerRelease("2.1.8", [{ tag_name: "v2.1.8" }, { tag_name: "v2.1.7" }]), null);
  assert.equal(newerRelease("2.1.8", []), null);
});

test("a newer release gives the newest tag", () => {
  const releases = [
    { tag_name: "v2.1.9" },
    { tag_name: "v2.1.10" },
    { tag_name: "v2.1.8" },
  ];
  assert.equal(newerRelease("2.1.8", releases), "v2.1.10");
});

test("workflow runs weekly and on demand", () => {
  const cron = /cron:\s*"([^"]+)"/.exec(workflow);
  assert.ok(cron, "schedule cron missing");
  const [min, hour, dom, month, dow] = cron[1].split(/\s+/);
  assert.match(min, /^\d+$/);
  assert.match(hour, /^\d+$/);
  assert.equal(dom, "*");
  assert.equal(month, "*");
  assert.match(dow, /^[0-6]$/);
  assert.match(workflow, /^\s*workflow_dispatch:/m);
  assert.doesNotMatch(workflow, /pull_request_target/);
});

test("workflow permissions are exactly contents and pull-requests write", () => {
  const block = /^permissions:\n((?:[ \t]+.*\n)+)/m.exec(workflow);
  assert.ok(block, "top-level permissions missing");
  const lines = block[1].trim().split("\n").map((l) => l.trim()).sort();
  assert.deepEqual(lines, ["contents: write", "pull-requests: write"]);
  assert.equal(workflow.match(/permissions:/g)?.length, 1, "no job-level permissions");
});

test("workflow pushes upstream/<tag> and guards an open PR", () => {
  assert.match(workflow, /branch="upstream\/\$TAG"/);
  assert.match(workflow, /gh pr list --state open[^\n]*--head "\$branch"/);
  assert.match(workflow, /if \[ "\$open" != "0" \]; then[\s\S]*?exit 0/);
  assert.match(workflow, /gh pr create --base main --head "\$branch"/);
  assert.doesNotMatch(workflow, /run:[^\n]*\$\{\{/, "no expressions inline in run");
});
