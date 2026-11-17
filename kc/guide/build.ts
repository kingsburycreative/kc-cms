// Builds the guide into plain static HTML: node kc/guide/build.ts [outDir] [--drafts]
// Default outDir is kc/guide/out/. The build empties it first.
// --drafts also builds the unapproved pages, each marked "Draft, not yet approved".
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { approvedPages, checkPages, pages as allPages, type GuidePage } from "./pages.ts";
import { renderIndex, renderPage } from "./shell.ts";
import { readVersion } from "./version.ts";

const guideDir = dirname(fileURLToPath(import.meta.url));
const defaultOut = join(guideDir, "out");

const ROBOTS_TXT = "User-agent: *\nDisallow: /\n";
const HTACCESS = `<IfModule mod_headers.c>
Header set X-Robots-Tag "noindex, nofollow"
</IfModule>
`;

export type BuildOptions = {
  // Build and list unapproved pages too, each marked as a draft. For previews only.
  drafts?: boolean;
};

export function build(
  outDir: string = defaultOut,
  allListed: GuidePage[] = allPages,
  options: BuildOptions = {},
): void {
  const out = resolve(outDir);
  // Emptying a folder that holds the guide's own source would delete it.
  if ((guideDir + sep).startsWith(out + sep)) {
    throw new Error(`Refusing to empty ${out}: it holds the guide source`);
  }
  checkPages(allListed);
  // Unapproved pages are neither built nor listed in the nav, unless this is a drafts build.
  const drafts = options.drafts === true;
  const pages = drafts ? allListed : approvedPages(allListed);
  const version = readVersion();

  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });

  writeFileSync(join(out, "index.html"), renderIndex(pages, version));
  for (const page of pages) {
    writeFileSync(join(out, `${page.slug}.html`), renderPage(page, pages, version, drafts));
  }
  cpSync(join(guideDir, "style.css"), join(out, "style.css"));
  const imgDir = join(guideDir, "img");
  if (existsSync(imgDir)) cpSync(imgDir, join(out, "img"), { recursive: true });

  writeFileSync(join(out, "robots.txt"), ROBOTS_TXT);
  writeFileSync(join(out, ".htaccess"), HTACCESS);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const args = process.argv.slice(2);
  const drafts = args.includes("--drafts");
  const target = args.find((arg) => arg !== "--drafts") ?? defaultOut;
  build(target, allPages, { drafts });
  console.log(`Guide built into ${resolve(target)}${drafts ? " (with drafts)" : ""}`);
}
