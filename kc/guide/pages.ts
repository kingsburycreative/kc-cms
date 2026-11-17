import * as coreSignIn from "./pages/core-sign-in.ts";
import * as coreFindYourWay from "./pages/core-find-your-way.ts";
import * as coreChangePageText from "./pages/core-change-page-text.ts";
import * as coreAddRemoveEntry from "./pages/core-add-remove-entry.ts";
import * as corePhotosAndFiles from "./pages/core-photos-and-files.ts";
import * as coreFormatText from "./pages/core-format-text.ts";
import * as coreSaveAndLiveSite from "./pages/core-save-and-live-site.ts";
import * as coreUndo from "./pages/core-undo.ts";
import * as coreSeeWhoVisits from "./pages/core-see-who-visits.ts";
import * as coreGettingHelp from "./pages/core-getting-help.ts";
import * as moduleBilingual from "./pages/module-bilingual.ts";
import * as moduleGalleries from "./pages/module-galleries.ts";
import * as moduleReviews from "./pages/module-reviews.ts";
import * as moduleBusinessDetails from "./pages/module-business-details.ts";
import * as modulePublications from "./pages/module-publications.ts";
import * as moduleEvents from "./pages/module-events.ts";
import * as moduleMenu from "./pages/module-menu.ts";
import * as moduleHours from "./pages/module-hours.ts";

export type GuidePage = {
  title: string;
  // "core" for pages every site shares, otherwise the client's name.
  group: string;
  slug: string;
  // ISO date (YYYY-MM-DD) the page was last checked against the CMS.
  checked: string;
  // Trusted HTML, written in this repo.
  body: string;
  // false keeps the page out of the built guide until Rob approves it. Missing counts as approved.
  approved?: boolean;
  // Id of the CMS module a page covers, for module pages.
  moduleId?: string;
  // One sentence: what the reader will have done. Shown under the title.
  goal?: string;
  // How long it takes, such as "About 2 minutes". Shown under the title.
  time?: string;
};

export const pages: GuidePage[] = [
  coreSignIn,
  coreFindYourWay,
  coreChangePageText,
  coreAddRemoveEntry,
  corePhotosAndFiles,
  coreFormatText,
  coreSaveAndLiveSite,
  coreUndo,
  coreSeeWhoVisits,
  coreGettingHelp,
  moduleBilingual,
  moduleGalleries,
  moduleReviews,
  moduleBusinessDetails,
  modulePublications,
  moduleEvents,
  moduleMenu,
  moduleHours,
];

export function approvedPages(list: GuidePage[]): GuidePage[] {
  return list.filter((page) => page.approved !== false);
}

export type PageGroup = { name: string; pages: GuidePage[] };

// Core first, then one group per client, alphabetical. Pages keep their listed order inside a group.
export function groupPages(list: GuidePage[]): PageGroup[] {
  const byName = new Map<string, GuidePage[]>();
  for (const page of list) {
    byName.set(page.group, [...(byName.get(page.group) ?? []), page]);
  }
  const names = [...byName.keys()].sort((a, b) => {
    if (a === "core") return -1;
    if (b === "core") return 1;
    return a.localeCompare(b);
  });
  return names.map((name) => ({ name, pages: byName.get(name) ?? [] }));
}

// The pages a new editor reads first. Everything else in "core" is an everyday task.
export const START_SLUGS = ["core-sign-in", "core-find-your-way", "core-getting-help"];

export type EntryPoint = { id: "start" | "everyday" | "modules"; pages: GuidePage[] };

// The home page's three doors: getting started, everyday tasks, modules.
export function entryPoints(list: GuidePage[]): EntryPoint[] {
  const start = START_SLUGS.map((slug) => list.find((page) => page.slug === slug)).filter(
    (page): page is GuidePage => page !== undefined,
  );
  return [
    { id: "start", pages: start },
    { id: "everyday", pages: list.filter((page) => page.group === "core" && !START_SLUGS.includes(page.slug)) },
    { id: "modules", pages: list.filter((page) => page.group !== "core") },
  ];
}

export function checkPages(list: GuidePage[]): void {
  const seen = new Set<string>();
  for (const page of list) {
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(page.slug) || page.slug === "index") {
      throw new Error(`Bad guide page slug: ${page.slug}`);
    }
    if (seen.has(page.slug)) throw new Error(`Two guide pages share the slug ${page.slug}`);
    seen.add(page.slug);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(page.checked)) {
      throw new Error(`Guide page ${page.slug} needs a checked date as YYYY-MM-DD`);
    }
  }
}
