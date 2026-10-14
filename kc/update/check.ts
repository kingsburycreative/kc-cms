// CLI: node kc/update/check.ts <releases.json>
// Prints the newer upstream tag, or nothing when the fork is current.
import { readFileSync } from "node:fs";
import { newerRelease, type Release } from "./upstream.ts";

const pkg = JSON.parse(readFileSync(new URL("../../package.json", import.meta.url), "utf8"));
const releases: Release[] = JSON.parse(readFileSync(process.argv[2], "utf8"));
const tag = newerRelease(pkg.version, releases);
if (tag) process.stdout.write(tag + "\n");
