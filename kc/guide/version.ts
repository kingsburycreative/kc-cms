import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(fileURLToPath(new URL(".", import.meta.url)), "..", "..");

// The KC CMS version, read from package.json each time the guide is built.
export function readVersion(packageJsonPath: string = join(repoRoot, "package.json")): string {
  const pkg = JSON.parse(readFileSync(packageJsonPath, "utf8")) as { version?: unknown };
  if (typeof pkg.version !== "string" || pkg.version === "") {
    throw new Error(`No version in ${packageJsonPath}`);
  }
  return pkg.version;
}
