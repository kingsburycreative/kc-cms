import { groupPages, type GuidePage } from "./pages.ts";

const SITE_NAME = "KC CMS guide";
const INDEX_LEAD = "Step-by-step help for editing your website with KC CMS.";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// "2026-11-17" -> "November 17, 2026". Done by hand so the output never depends on the build machine's locale.
export function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  return `${MONTHS[month - 1]} ${day}, ${year}`;
}

export function stampText(version: string, checked: string): string {
  return `Checked on KC CMS ${version}, ${formatDate(checked)}`;
}

function groupLabel(name: string): string {
  return name === "core" ? "Every site" : name;
}

function navHtml(pages: GuidePage[], currentSlug: string | null): string {
  const groups = groupPages(pages)
    .map((group) => {
      const items = group.pages
        .map((page) => {
          const current = page.slug === currentSlug ? ' aria-current="page"' : "";
          return `<li><a href="${page.slug}.html"${current}>${escapeHtml(page.title)}</a></li>`;
        })
        .join("\n");
      return `<h2>${escapeHtml(groupLabel(group.name))}</h2>\n<ul>\n${items}\n</ul>`;
    })
    .join("\n");
  return `<nav aria-label="Guide pages">\n${groups}\n</nav>`;
}

function layout(opts: {
  title: string;
  pages: GuidePage[];
  currentSlug: string | null;
  main: string;
}): string {
  return `<!doctype html>
<html lang="en-CA">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${escapeHtml(opts.title)}</title>
<link rel="stylesheet" href="style.css">
</head>
<body>
<a class="skip" href="#content">Skip to the page</a>
<header class="site-header">
<a class="site-name" href="index.html">${SITE_NAME}</a>
</header>
<div class="frame">
${navHtml(opts.pages, opts.currentSlug)}
<main id="content">
${opts.main}
</main>
</div>
</body>
</html>
`;
}

export function renderPage(page: GuidePage, pages: GuidePage[], version: string): string {
  const main = `<h1>${escapeHtml(page.title)}</h1>
${page.body}
<p class="stamp"><time datetime="${page.checked}">${escapeHtml(stampText(version, page.checked))}</time></p>`;
  return layout({
    title: `${page.title} | ${SITE_NAME}`,
    pages,
    currentSlug: page.slug,
    main,
  });
}

export function renderIndex(pages: GuidePage[], version: string): string {
  const main = `<h1>${SITE_NAME}</h1>
<p class="lead">${INDEX_LEAD}</p>
<p class="stamp">Written for KC CMS ${escapeHtml(version)}</p>`;
  return layout({ title: SITE_NAME, pages, currentSlug: null, main });
}
