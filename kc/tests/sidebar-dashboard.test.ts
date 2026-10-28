import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { isDashboardActive } from "../sidebar-dashboard.ts";

const src = readFileSync(new URL("../../components/repo/repo-sidebar.tsx", import.meta.url), "utf8");

test("current on the exact root, with or without a trailing slash", () => {
  assert.equal(isDashboardActive("/o/r/main", "/o/r/main"), true);
  assert.equal(isDashboardActive("/o/r/main/", "/o/r/main"), true);
});

test("not current on child pages", () => {
  assert.equal(isDashboardActive("/o/r/main/media/x", "/o/r/main"), false);
  assert.equal(isDashboardActive("/o/r/main/collection/weekly", "/o/r/main"), false);
});

test("Dashboard item comes first, before Media and Content, via shortHref", () => {
  const dash = src.indexOf('key="Dashboard"');
  assert.ok(dash > 0, "Dashboard item missing");
  assert.ok(dash < src.indexOf('renderNavigationGroup("Content"'));
  assert.ok(dash < src.indexOf('renderNavigationGroup("Media"'));
  assert.match(src, /dashboardHref\s*=\s*config\s*\?\s*shortHref\(`\/\$\{config\.owner\}\/\$\{config\.repo\}\/\$\{encodeURIComponent\(config\.branch\)\}`\)/);
  assert.match(src, /<span>Dashboard<\/span>/);
  assert.match(src, /aria-current=\{isDashboardActive\(/);
});
