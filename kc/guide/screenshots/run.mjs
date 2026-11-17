// Takes the guide's screenshots from the demo site: KC_GUIDE_DEMO_URL=<url> node kc/guide/screenshots/run.mjs
// Reads manifest.json, writes the pictures to kc/guide/img/, then prints the guide pages whose
// pictures changed since the last run (hashes kept in hashes.json). This is the only file that
// talks to the demo site; the test suite never runs it.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { changedPages, cleanPage, hashFolder, parseStep } from "./compare.ts";
import { pages } from "../pages.ts";

const here = dirname(fileURLToPath(import.meta.url));
const imgDir = join(here, "..", "img");
const hashesFile = join(here, "hashes.json");
const manifest = JSON.parse(readFileSync(join(here, "manifest.json"), "utf8"));

const base = process.env.KC_GUIDE_DEMO_URL;
if (!base) {
  console.error("Set KC_GUIDE_DEMO_URL to the demo site's address, then run this again.");
  console.error("  PowerShell:  $env:KC_GUIDE_DEMO_URL = 'https://demo.example.com'; node kc/guide/screenshots/run.mjs");
  process.exit(1);
}

const before = JSON.parse(readFileSync(hashesFile, "utf8"));
mkdirSync(imgDir, { recursive: true });

const { chromium } = await import("playwright");
const browser = await chromium.launch();
let failed = false;
try {
  for (const entry of manifest.shots) {
    const context = await browser.newContext({ viewport: { width: entry.width, height: 800 } });
    const tab = await context.newPage();
    await tab.goto(new URL(entry.url, base).href);
    for (const line of entry.steps) {
      const step = parseStep(line);
      if (step.action === "goto") await tab.goto(new URL(step.path, base).href);
      else if (step.action === "click") await tab.click(step.selector);
      else if (step.action === "fill") await tab.fill(step.selector, step.text);
      else await tab.waitForSelector(step.selector);
    }
    // Swap and hide KC's own text, then refuse the shot if a deny word is still on the page.
    // cleanPage's source runs inside the page, so the test suite checks the same code.
    const denied = await tab.evaluate(
      `(${cleanPage.toString()})(document, ${JSON.stringify({ replace: entry.replace, hide: entry.hide })}, ${JSON.stringify(manifest.deny)})`,
    );
    if (denied.length > 0) {
      for (const word of denied) console.error(`Refused ${entry.picture}: the page still shows "${word}"`);
      failed = true;
      await context.close();
      continue;
    }
    await tab.screenshot({ path: join(imgDir, entry.picture), fullPage: true });
    await context.close();
    console.log(`Took ${entry.picture} (${entry.width}px)`);
  }
} finally {
  await browser.close();
}
if (failed) {
  console.error("Some shots were refused, so hashes.json is left as it was.");
  process.exit(1);
}

const after = hashFolder(imgDir);
const changed = changedPages(before, after, manifest.shots, pages);
writeFileSync(hashesFile, JSON.stringify(after, null, 2) + "\n");

if (changed.length === 0) console.log("No guide page has a changed picture.");
else {
  console.log("Guide pages with a changed picture:");
  for (const slug of changed) console.log(`  ${slug}`);
}
