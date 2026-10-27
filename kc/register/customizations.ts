// Register of the fork's own customizations of Pages CMS. Each entry names the
// files a customization lives in, globs to watch and the tests that prove it.
// The register test and the PR guard read this to name what a diff touches.

import { readFileSync } from "node:fs";

export type Customization = {
  id: string;
  title: string;
  files: string[];
  watch: string[];
  tests: string[];
};

export type Register = {
  upstreamBase: string;
  entries: Customization[];
};

const path = new URL("./customizations.json", import.meta.url);

export function loadRegister(): Register {
  return JSON.parse(readFileSync(path, "utf8")) as Register;
}

// Glob to regex: `**` crosses folders, `*` does not. Everything else, brackets
// included, is literal, since the route folders are named like `[owner]`.
export function globToRegExp(glob: string): RegExp {
  let out = "";
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i];
    if (c === "*" && glob[i + 1] === "*") {
      out += ".*";
      i++;
    } else if (c === "*") {
      out += "[^/]*";
    } else {
      out += c.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
    }
  }
  return new RegExp(`^${out}$`);
}

export function claimsOf(file: string, entries: Customization[]): string[] {
  return entries
    .filter((e) => e.files.includes(file) || e.watch.some((g) => globToRegExp(g).test(file)))
    .map((e) => e.id);
}

export function unclaimed(files: string[], entries: Customization[]): string[] {
  return files.filter((f) => claimsOf(f, entries).length === 0);
}
