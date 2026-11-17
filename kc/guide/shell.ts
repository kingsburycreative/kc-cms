import { entryPoints, type EntryPoint, type GuidePage } from "./pages.ts";
import { escapeHtml, helpBar, pageHeader, stripTags, withHeadingIds, type Heading } from "./parts.ts";

export { escapeHtml };

const SITE_NAME = "KC CMS guide";
const HOME_TITLE = "Help for editing your website";
const HOME_LEAD = "Short steps for editing your website, with what you should see after each one.";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// "2026-11-17" -> "November 17, 2026". Done by hand so the output never depends on the build machine's locale.
export function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  return `${MONTHS[month - 1]} ${day}, ${year}`;
}

export function stampText(version: string, checked: string): string {
  return `Checked on KC CMS ${version}, ${formatDate(checked)}`;
}

const DOORS: Record<EntryPoint["id"], { title: string; text: string }> = {
  start: { title: "Getting started", text: "Sign in and find your way around." },
  everyday: { title: "Everyday tasks", text: "Change text, add photos, save and see your site." },
  modules: { title: "Modules", text: "Guides for the extra parts of your site." },
};

const HERO_ALT =
  "A linocut print of a desk with a lit lamp, a laptop showing a web page and a coffee mug, beside a window onto a small-town main street.";
const NOT_FOUND_ALT = "A linocut print of two hands holding a phone that shows a website.";

// The sidebar groups are the home page's three doors, in the same order and with the same names.
function navHtml(pages: GuidePage[], currentSlug: string | null): string {
  const groups = entryPoints(pages)
    .filter((entry) => entry.pages.length > 0)
    .map((entry) => {
      const items = entry.pages
        .map((page) => {
          const current = page.slug === currentSlug ? ' aria-current="page"' : "";
          return `<li><a href="${page.slug}.html"${current}>${escapeHtml(page.title)}</a></li>`;
        })
        .join("\n");
      return `<h2>${DOORS[entry.id].title}</h2>\n<ul>\n${items}\n</ul>`;
    })
    .join("\n");
  const search = `<div class="search" data-search hidden>
<label for="guide-search">Search the guide</label>
<input id="guide-search" type="search" autocomplete="off">
<ul class="search-results" aria-live="polite"></ul>
</div>`;
  return `<nav class="side" id="menu" aria-label="Guide pages">
<a class="menu-close" href="#content">Close</a>
${search}
${groups}
</nav>`;
}

function railHtml(headings: Heading[]): string {
  const items = headings.filter((heading) => heading.level === 2);
  if (items.length < 2) return "";
  const links = items.map((heading) => `<li><a href="#${heading.id}">${escapeHtml(heading.text)}</a></li>`).join("\n");
  return `<aside class="rail" aria-label="On this page">
<p class="rail-title">On this page</p>
<ul>
${links}
</ul>
</aside>`;
}

function layout(opts: {
  title: string;
  pages: GuidePage[];
  currentSlug: string | null;
  main: string;
  headings?: Heading[];
  // A band between the header and the page, used by the home page.
  hero?: string;
  frameClass?: string;
}): string {
  return `<!doctype html>
<html lang="en-CA">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${escapeHtml(opts.title)}</title>
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="style.css">
</head>
<body>
<a class="skip" href="#content">Skip to the page</a>
<header class="site-header">
<a class="site-name" href="index.html">${SITE_NAME}</a>
<a class="menu-open" href="#menu">Menu</a>
</header>
${opts.hero ?? ""}
<div class="frame${opts.frameClass ? ` ${opts.frameClass}` : ""}">
${navHtml(opts.pages, opts.currentSlug)}
<main id="content">
${opts.main}
</main>
${railHtml(opts.headings ?? [])}
</div>
${helpBar()}
<script src="search-index.js" defer></script>
<script src="search.js" defer></script>
</body>
</html>
`;
}

export const DRAFT_LINE = "Draft, not yet approved";

// showDraftLine is set only by a drafts build, for pages Rob has not approved yet.
export function renderPage(page: GuidePage, pages: GuidePage[], version: string, showDraftLine = false): string {
  const header = pageHeader({
    title: page.title,
    goal: page.goal,
    time: page.time,
    stamp: stampText(version, page.checked),
    checked: page.checked,
    draftLine: showDraftLine && page.approved === false ? DRAFT_LINE : undefined,
  });
  const { html, headings } = withHeadingIds(page.body);
  return layout({
    title: `${page.title} | ${SITE_NAME}`,
    pages,
    currentSlug: page.slug,
    main: `${header}\n<div class="body">\n${html}\n</div>`,
    headings,
  });
}

function doorHtml(entry: EntryPoint): string {
  const door = DOORS[entry.id];
  // Each row shows the page's title, what it gets done and how long it takes.
  const links = entry.pages
    .map((page) => {
      const goal = page.goal ? `<span class="door-goal">${escapeHtml(page.goal)}</span>` : "";
      const time = page.time ? `<span class="door-time">${escapeHtml(page.time)}</span>` : "";
      return `<li><a class="door-page" href="${page.slug}.html"><span class="door-title">${escapeHtml(page.title)}</span>${goal}${time}</a></li>`;
    })
    .join("\n");
  const list = links ? `<ul>\n${links}\n</ul>` : `<p class="door-empty">No pages here yet.</p>`;
  return `<section class="door" id="${entry.id}" aria-labelledby="door-${entry.id}">
<h2 id="door-${entry.id}">${door.title}</h2>
<p class="door-text">${door.text}</p>
${list}
</section>`;
}

export function renderIndex(pages: GuidePage[], version: string): string {
  const doors = entryPoints(pages).map(doorHtml).join("\n");
  const hero = `<section class="hero" aria-labelledby="home-title">
<div class="hero-inner">
<img class="hero-art" src="img/linocut-workspace.webp" alt="${HERO_ALT}" width="1024" height="1024" fetchpriority="high">
<div class="hero-text">
<h1 id="home-title">${HOME_TITLE}</h1>
<p class="goal">${HOME_LEAD}</p>
<p class="meta"><span class="stamp">Written for KC CMS ${escapeHtml(version)}</span></p>
</div>
</div>
</section>`;
  const main = `<div class="doors">
${doors}
</div>`;
  return layout({ title: SITE_NAME, pages, currentSlug: null, main, hero, frameClass: "frame-home" });
}

export const NOT_FOUND_TITLE = "That page is not here";

// Served by the host for any address that has no page, so it holds the nav and a way home.
export function renderNotFound(pages: GuidePage[]): string {
  const main = `<div class="not-found">
<img class="not-found-art" src="img/linocut-mobile.webp" alt="${NOT_FOUND_ALT}" width="1024" height="1024">
<h1>${NOT_FOUND_TITLE}</h1>
<p class="goal">The link may be old, or the page may have moved. Start again from the guide home.</p>
<a class="button" href="index.html">Back to the guide home</a>
</div>`;
  return layout({ title: `Page not found | ${SITE_NAME}`, pages, currentSlug: null, main });
}

// The data search.js reads: one entry for each page and each of its headings.
export function renderSearchIndex(pages: GuidePage[]): string {
  const entries: { title: string; heading: string; url: string }[] = [];
  for (const page of pages) {
    entries.push({ title: page.title, heading: "", url: `${page.slug}.html` });
    for (const heading of withHeadingIds(page.body).headings) {
      entries.push({ title: page.title, heading: stripTags(heading.text), url: `${page.slug}.html#${heading.id}` });
    }
  }
  // "<" is escaped so a heading can never close the script tag if this is ever inlined.
  const json = JSON.stringify(entries).replace(/</g, "\\u003c");
  return `window.guideSearchIndex = ${json};\n`;
}
