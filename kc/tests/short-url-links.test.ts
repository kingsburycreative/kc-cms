import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";

const ROOT = new URL("../../", import.meta.url);
const DIRS = ["components", "fields", "kc", "app/(main)"];
const EXTRA_FILES = ["lib/actions/collaborator.ts"];
const SKIP_DIRS = new Set(["kc/tests", "node_modules"]);

// A page link template: `/${...owner...}/${...repo...}
const PAGE_LINK = /`\/\$\{[^}]*owner[^}]*\}\/\$\{[^}]*repo[^}]*\}/;

// Each entry is tested against "<file>:<line text>". Every entry must match at
// least one scanned line, so a stale entry fails.
const ALLOWLIST: { match: RegExp; reason: string }[] = [
  { match: /\/api\//, reason: "API calls, not pages" },
  { match: /github\.com/, reason: "links to GitHub itself" },
  { match: /raw\.githubusercontent\.com/, reason: "raw file URLs on GitHub" },
  { match: /^lib\/actions\/collaborator\.ts:/, reason: "invite email builds a full path; the 308 covers it (plan flag 6)" },
  {
    match: /^kc\/dashboard\.ts:\s*const base = `/,
    reason: "base is only used through link(), which wraps every path in shortHref",
  },
];

function walk(dir: string, out: string[]) {
  for (const e of readdirSync(new URL(`${dir}/`, ROOT), { withFileTypes: true })) {
    const rel = `${dir}/${e.name}`;
    if (e.isDirectory()) {
      if (!SKIP_DIRS.has(rel)) walk(rel, out);
    } else if (/\.tsx?$/.test(e.name)) {
      out.push(rel);
    }
  }
}

function files(): string[] {
  const out: string[] = [];
  for (const d of DIRS) walk(d, out);
  return [...out, ...EXTRA_FILES];
}

const read = (f: string) => readFileSync(new URL(f, ROOT), "utf8");

test("every in-app page link template is wrapped in shortHref or allowlisted", () => {
  const unwrapped: string[] = [];
  let seen = 0;
  for (const file of files()) {
    const lines = read(file).split(/\r?\n/);
    lines.forEach((line, i) => {
      if (!PAGE_LINK.test(line)) return;
      seen++;
      // The statement can open on one of the two lines above the template.
      const statement = lines.slice(Math.max(0, i - 2), i + 1).join("\n");
      if (statement.includes("shortHref(")) return;
      if (ALLOWLIST.some((a) => a.match.test(`${file}:${line}`))) return;
      unwrapped.push(`${file}:${i + 1}: ${line.trim()}`);
    });
  }
  assert.ok(seen > 0, "scanner found no page links at all");
  assert.deepEqual(unwrapped, [], "unwrapped page links");
});

test("every allowlist entry still matches a line", () => {
  const all = files().flatMap((f) => read(f).split(/\r?\n/).map((l) => `${f}:${l}`));
  for (const a of ALLOWLIST) {
    assert.ok(all.some((l) => a.match.test(l)), `stale allowlist entry: ${a.match} (${a.reason})`);
  }
});
