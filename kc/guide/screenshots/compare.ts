// Pure helpers for the guide screenshot script (run.mjs): hash the pictures,
// compare two runs, and say which guide pages have a picture that changed.
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

// Picture file name -> sha256 of its bytes.
export type HashMap = Record<string, string>;

export type ManifestEntry = {
  // Slug of the guide page that shows the picture.
  page: string;
  // File name written to kc/guide/img/, width included, e.g. "core-sign-in-375.png".
  picture: string;
  // Path on the demo site, joined to KC_GUIDE_DEMO_URL.
  url: string;
  // Viewport width: 375 or 1280.
  width: number;
  // Plain actions: "goto <path>", "click <selector>", "fill <selector> <text>", "wait <selector>".
  steps: string[];
  // Swap the text of every element a selector matches, just before the capture, so the
  // picture shows plain demo figures instead of KC's own.
  replace?: { selector: string; text: string }[];
  // Selectors whose elements are removed before the capture (a panel with no demo stand-in).
  hide?: string[];
};

// manifest.json: the shots, and the words no picture may show.
export type Manifest = { deny: string[]; shots: ManifestEntry[] };

// The least of a browser document that cleanPage needs, so a test can pass a fake one.
export type MaskNode = { textContent: string | null; remove(): void };
export type MaskDocument = {
  querySelectorAll(selector: string): Iterable<MaskNode>;
  body: { innerText?: string; textContent: string | null };
};

export type PageBody = { slug: string; body: string };

export type Step =
  | { action: "goto"; path: string }
  | { action: "click"; selector: string }
  | { action: "fill"; selector: string; text: string }
  | { action: "wait"; selector: string };

export function hashBytes(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

// Hash every .png in a folder. A folder that does not exist is an empty run.
export function hashFolder(dir: string): HashMap {
  const out: HashMap = {};
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir).sort()) {
    if (!name.toLowerCase().endsWith(".png")) continue;
    out[name] = hashBytes(readFileSync(join(dir, name)));
  }
  return out;
}

export type PictureDiff = { changed: string[]; added: string[]; removed: string[] };

export function diffHashes(before: HashMap, after: HashMap): PictureDiff {
  const changed: string[] = [];
  const added: string[] = [];
  for (const [name, hash] of Object.entries(after)) {
    if (!(name in before)) added.push(name);
    else if (before[name] !== hash) changed.push(name);
  }
  const removed = Object.keys(before).filter((name) => !(name in after));
  return { changed: changed.sort(), added: added.sort(), removed: removed.sort() };
}

// File names of the local pictures a page body shows through <img src>.
export function picturesUsedBy(body: string): string[] {
  const names = new Set<string>();
  for (const tag of body.matchAll(/<img\b[^>]*>/gi)) {
    const src = /\bsrc\s*=\s*(?:"([^"]*)"|'([^']*)')/i.exec(tag[0]);
    const value = src?.[1] ?? src?.[2];
    if (!value || /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(value)) continue;
    const file = value.split(/[?#]/)[0].split("/").pop();
    if (file) names.add(file);
  }
  return [...names].sort();
}

// Pictures a page body uses that the manifest has no entry for, for that page.
export function missingFromManifest(page: PageBody, manifest: ManifestEntry[]): string[] {
  const named = new Set(manifest.map((entry) => entry.picture));
  return picturesUsedBy(page.body).filter((name) => !named.has(name));
}

// Slugs of the guide pages with a picture that changed, was added or was removed.
// A picture belongs to the page the manifest names and to every page body that shows it,
// so a removed picture still finds its page.
export function changedPages(
  before: HashMap,
  after: HashMap,
  manifest: ManifestEntry[],
  pages: PageBody[],
): string[] {
  const owners = new Map<string, Set<string>>();
  const own = (picture: string, slug: string) => {
    owners.set(picture, (owners.get(picture) ?? new Set()).add(slug));
  };
  for (const entry of manifest) own(entry.picture, entry.page);
  for (const page of pages) for (const picture of picturesUsedBy(page.body)) own(picture, page.slug);

  const diff = diffHashes(before, after);
  const slugs = new Set<string>();
  for (const picture of [...diff.changed, ...diff.added, ...diff.removed]) {
    for (const slug of owners.get(picture) ?? []) slugs.add(slug);
  }
  return [...slugs].sort();
}

// Cleans a page for its screenshot and returns the deny words it still shows (case-insensitive),
// so an empty list means the page is safe to capture. run.mjs sends this function's source into
// the page, so it must use nothing from outside itself.
export function cleanPage(
  doc: MaskDocument,
  mask: { replace?: { selector: string; text: string }[]; hide?: string[] },
  deny: string[],
): string[] {
  for (const rule of mask.replace ?? []) {
    for (const node of Array.from(doc.querySelectorAll(rule.selector))) node.textContent = rule.text;
  }
  for (const selector of mask.hide ?? []) {
    for (const node of Array.from(doc.querySelectorAll(selector))) node.remove();
  }
  const visible = (doc.body.innerText ?? doc.body.textContent ?? "").toLowerCase();
  return deny.filter((word) => visible.includes(word.toLowerCase()));
}

export function parseStep(line: string): Step {
  const text = line.trim();
  const [action, ...rest] = text.split(/\s+/);
  const arg = text.slice(action.length).trim();
  if (action === "goto" && arg) return { action, path: arg };
  if ((action === "click" || action === "wait") && arg) return { action, selector: arg };
  if (action === "fill" && rest.length >= 2) {
    // The selector is the first word, so it cannot hold a space; the rest is the text.
    return { action, selector: rest[0], text: arg.slice(rest[0].length).trim() };
  }
  throw new Error(`Bad screenshot step: "${line}"`);
}
