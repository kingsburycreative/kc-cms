import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { builtinModules } from "node:module";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// The browser bundle cannot hold a Node built-in. `next build` fails on
// `node:net` pulled in through the sign-in page (card 113), and the suite never
// builds, so this walks the static import graph instead.

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const EXTENSIONS = ["", ".ts", ".tsx", ".js", ".mjs", "/index.ts", "/index.tsx", "/index.js"];
const BUILTINS = new Set(builtinModules.map((m) => m.replace(/^node:/, "")));

// A module spec, with the `import type` and `export type` forms left out (erased at build).
const SPEC = /(?:^|[\n;])\s*(?:import|export)\s+(?!type\b)(?:[^"';]*?\sfrom\s*)?["']([^"']+)["']|\bimport\(\s*["']([^"']+)["']\s*\)|\brequire\(\s*["']([^"']+)["']\s*\)/g;

function specsOf(source: string): string[] {
  const out: string[] = [];
  for (const m of source.matchAll(SPEC)) out.push(m[1] ?? m[2] ?? m[3]);
  return out;
}

function isBuiltin(spec: string): boolean {
  return spec.startsWith("node:") || BUILTINS.has(spec.split("/")[0]);
}

function resolveLocal(spec: string, from: string): string | null {
  let base: string;
  if (spec.startsWith("@/")) base = join(ROOT, spec.slice(2));
  else if (spec.startsWith(".")) base = resolve(dirname(from), spec);
  else return null;
  for (const ext of EXTENSIONS) {
    const p = base + ext;
    if (existsSync(p) && statSync(p).isFile()) return p;
  }
  return null;
}

function clientModulesUnder(dir: string): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "tests" || entry.name === "node_modules") continue;
      found.push(...clientModulesUnder(p));
    } else if (/\.(ts|tsx)$/.test(entry.name) && /^\s*["']use client["']/.test(readFileSync(p, "utf8"))) {
      found.push(p);
    }
  }
  return found;
}

// Every file reachable from the roots, mapped to the chain that reached it.
function walk(roots: string[]): Map<string, string[]> {
  const seen = new Map<string, string[]>();
  const queue = roots.map((r) => ({ file: r, chain: [r] }));
  while (queue.length) {
    const { file, chain } = queue.shift()!;
    if (seen.has(file)) continue;
    seen.set(file, chain);
    const source = readFileSync(file, "utf8");
    // A client module imports a server action as a reference; its body never reaches the browser.
    if (/^\s*["']use server["']/.test(source)) continue;
    for (const spec of specsOf(source)) {
      const next = resolveLocal(spec, file);
      if (next) queue.push({ file: next, chain: [...chain, next] });
    }
  }
  return seen;
}

function builtinImports(files: Map<string, string[]>): string[] {
  const bad: string[] = [];
  for (const [file, chain] of files) {
    const source = readFileSync(file, "utf8");
    if (/^\s*["']use server["']/.test(source)) continue;
    for (const spec of specsOf(source)) {
      if (isBuiltin(spec)) {
        bad.push(`${spec} in ${relative(ROOT, file)} (via ${chain.map((c) => relative(ROOT, c)).join(" -> ")})`);
      }
    }
  }
  return bad;
}

test("the walker finds the sign-in page's own imports", () => {
  const files = walk([join(ROOT, "components", "sign-in.tsx")]);
  const names = [...files.keys()].map((f) => relative(ROOT, f).replaceAll("\\", "/"));
  assert.ok(names.includes("kc/sign-in-error.ts"));
  assert.ok(names.includes("kc/invite-code.ts"));
});

test("the sign-in page's bundle reaches no Node built-in", () => {
  const files = walk([join(ROOT, "components", "sign-in.tsx")]);
  assert.deepEqual(builtinImports(files), []);
});

test("every use-client module under kc/ and components/ reaches no Node built-in", () => {
  const roots = [...clientModulesUnder(join(ROOT, "kc")), ...clientModulesUnder(join(ROOT, "components"))];
  assert.ok(roots.length > 0);
  assert.deepEqual(builtinImports(walk(roots)), []);
});
