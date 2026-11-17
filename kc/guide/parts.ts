// Shared markup for guide pages. Pages call these instead of writing free HTML, so the look
// stays the same everywhere and the one tokens file (tokens.css) is the only place a colour lives.
// Every string argument that is HTML is trusted and written in this repo; plain text is escaped.

export const CONTACT_EMAIL = "hello@kingsburycreative.com";
export const CHECK_HEADING = "Check it worked";

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// "Open Settings!" -> "open-settings". Used for heading anchors.
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/&[a-z]+;|&#\d+;/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function stripTags(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

export type Step = {
  // The one thing to do, as HTML. Name buttons with chip().
  action: string;
  // What the screen shows after the action, as HTML.
  see?: string;
  // One fix if the screen does not match, as HTML.
  ifNot?: string;
  // A figure() for this step.
  figure?: string;
};

// Numbered steps: a big numeral, the action line, then "You will see" and "If not".
export function steps(items: Step[]): string {
  const rows = items
    .map((item, index) => {
      const see = item.see ? `\n<p class="step-see"><span class="step-label">You will see</span> ${item.see}</p>` : "";
      const ifNot = item.ifNot ? `\n<p class="step-ifnot"><span class="step-label">If not</span> ${item.ifNot}</p>` : "";
      const figure = item.figure ? `\n${item.figure}` : "";
      return `<li class="step">
<span class="step-num" aria-hidden="true">${index + 1}</span>
<div class="step-body">
<p class="step-action">${item.action}</p>${figure}${see}${ifNot}
</div>
</li>`;
    })
    .join("\n");
  return `<ol class="steps" role="list">\n${rows}\n</ol>`;
}

// A percentage between 0 and 100, so a typo in a page cannot put anything else in a style attribute.
function pct(value: number): string {
  if (!Number.isFinite(value)) throw new Error(`Not a number: ${value}`);
  return `${Math.min(100, Math.max(0, value))}%`;
}

export type Figure = {
  // File under img/ in the built guide, such as "img/sign-in.png". Left out while the picture is not taken yet.
  src?: string;
  // What the picture shows, for people who cannot see it. Required with src.
  alt?: string;
  caption: string;
  // Width and height of the picture in pixels, so the page does not jump when it loads.
  size?: [number, number];
  // One ring round the control, in percent of the picture.
  ring?: { x: number; y: number; w: number; h: number };
  // A numbered dot at the control, in percent of the picture. Matches the step number.
  dot?: { n: number; x: number; y: number };
};

export function figure(fig: Figure): string {
  const caption = `<figcaption>${escapeHtml(fig.caption)}</figcaption>`;
  if (!fig.src) {
    return `<figure class="figure figure-empty">
<div class="figure-frame">Picture to come</div>
${caption}
</figure>`;
  }
  if (!fig.alt) throw new Error(`Figure ${fig.src} needs alt text`);
  const size = fig.size ? ` width="${Math.round(fig.size[0])}" height="${Math.round(fig.size[1])}"` : "";
  const ring = fig.ring
    ? `<span class="ring" style="left:${pct(fig.ring.x)};top:${pct(fig.ring.y)};width:${pct(fig.ring.w)};height:${pct(fig.ring.h)}"></span>`
    : "";
  const dot = fig.dot
    ? `<span class="dot" style="left:${pct(fig.dot.x)};top:${pct(fig.dot.y)}" aria-hidden="true">${Math.round(fig.dot.n)}</span>`
    : "";
  return `<figure class="figure">
<div class="figure-frame">
<img src="${escapeHtml(fig.src)}" alt="${escapeHtml(fig.alt)}"${size} loading="lazy">${ring}${dot}
</div>
${caption}
</figure>`;
}

export type CalloutKind = "note" | "warning";

// A straight-edged box. A note is a limit or good to know; a warning comes before something that cannot be undone.
export function callout(kind: CalloutKind, html: string): string {
  const title = kind === "warning" ? "Careful" : "Good to know";
  return `<aside class="callout callout-${kind}" role="note">
<p class="callout-title">${title}</p>
<p>${html}</p>
</aside>`;
}

// The name of a button, field or menu item, as it is on screen.
export function chip(label: string): string {
  return `<span class="chip">${escapeHtml(label)}</span>`;
}

// Where to find something: "Menu > Pages > Home page", in the mono face.
export function menuPath(...parts: string[]): string {
  return `<code class="menu-path">${parts.map(escapeHtml).join(" &gt; ")}</code>`;
}

export function checkItWorked(html: string): string {
  return `<section class="check" aria-labelledby="check-it-worked">
<h2 id="check-it-worked">${CHECK_HEADING}</h2>
<p>${html}</p>
</section>`;
}

export function helpBar(): string {
  return `<aside class="help-bar" aria-labelledby="help-bar-title">
<div class="help-bar-inner">
<p class="help-bar-title" id="help-bar-title">Need a hand?</p>
<p>Email Kingsbury Creative. A screenshot of your screen helps.</p>
<a class="help-bar-link" href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>
</div>
</aside>`;
}

export type PageHeader = {
  title: string;
  // One sentence: what you will have done by the end.
  goal?: string;
  // How long it takes, such as "About 2 minutes".
  time?: string;
  // Version stamp text, and the ISO date for the time element.
  stamp: string;
  checked: string;
  // Set on a drafts build for a page Rob has not approved.
  draftLine?: string;
};

export function pageHeader(head: PageHeader): string {
  const draft = head.draftLine ? `<p class="draft">${escapeHtml(head.draftLine)}</p>\n` : "";
  const goal = head.goal ? `\n<p class="goal">${escapeHtml(head.goal)}</p>` : "";
  const time = head.time ? `<span class="meta-time">${escapeHtml(head.time)}</span>` : "";
  const stamp = `<span class="stamp"><time datetime="${escapeHtml(head.checked)}">${escapeHtml(head.stamp)}</time></span>`;
  return `<header class="page-head">
${draft}<h1>${escapeHtml(head.title)}</h1>${goal}
<p class="meta">${time}${stamp}</p>
</header>`;
}

export type Heading = { level: 2 | 3; id: string; text: string };

// Gives every h2 and h3 an id (so the rail and the search can link to it) and lists them.
export function withHeadingIds(html: string): { html: string; headings: Heading[] } {
  const headings: Heading[] = [];
  const used = new Set<string>();
  const out = html.replace(/<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi, (whole, level: string, attrs: string, inner: string) => {
    const text = stripTags(inner);
    const existing = /\sid="([^"]+)"/.exec(attrs);
    let id = existing ? existing[1] : slugify(text) || "section";
    if (!existing) {
      const base = id;
      for (let n = 2; used.has(id); n += 1) id = `${base}-${n}`;
    }
    used.add(id);
    headings.push({ level: Number(level) as 2 | 3, id, text });
    return existing ? whole : `<h${level}${attrs} id="${id}">${inner}</h${level}>`;
  });
  return { html: out, headings };
}
