import { fleschKincaidGrade } from "./readability.ts";

export type Check = { ok: true; message: string } | { ok: false; message: string };

const ok = (message: string): Check => ({ ok: true, message });
const problem = (message: string): Check => ({ ok: false, message });

export const TITLE_MIN = 50;
export const TITLE_MAX = 60;
export const DESCRIPTION_MIN = 120;
export const DESCRIPTION_MAX = 155;

function lengthCheck(text: string, min: number, max: number, what: string): Check {
  const n = text.trim().length;
  if (n === 0) return problem(`There is no ${what} yet.`);
  if (n < min) return problem(`The ${what} is ${n} characters. Add some detail to reach ${min}.`);
  if (n > max) return problem(`The ${what} is ${n} characters. Search results cut it off after ${max}.`);
  return ok(`The ${what} is ${n} characters, a good length.`);
}

export const checkTitle = (title: string): Check => lengthCheck(title, TITLE_MIN, TITLE_MAX, "title");
export const checkDescription = (description: string): Check =>
  lengthCheck(description, DESCRIPTION_MIN, DESCRIPTION_MAX, "search description");

/** What a search result will show: cut at the limit on a word boundary, with an ellipsis. */
export function snippet(text: string, limit: number): string {
  const t = text.trim();
  if (t.length <= limit) return t;
  const cut = t.slice(0, limit);
  const space = cut.lastIndexOf(" ");
  const base = space > 0 && t[limit] !== " " ? cut.slice(0, space) : cut;
  return base.replace(/[\s,.;:!?-]+$/, "") + "…";
}

export function checkH1(body: string): Check {
  if (/^\s{0,3}#(?!#)\s/m.test(body) || /<h1[\s>]/i.test(body)) {
    return problem("The page title already shows as the main heading. Use a smaller heading in the text.");
  }
  return ok("No second main heading in the text.");
}

function headingLevels(body: string): number[] {
  const found: { index: number; level: number }[] = [];
  for (const m of body.matchAll(/^\s{0,3}(#{1,6})\s/gm)) found.push({ index: m.index ?? 0, level: m[1].length });
  for (const m of body.matchAll(/<h([1-6])[\s>]/gi)) found.push({ index: m.index ?? 0, level: Number(m[1]) });
  return found.sort((a, b) => a.index - b.index).map((h) => h.level);
}

export function checkHeadingOrder(body: string): Check {
  const levels = headingLevels(body);
  for (let i = 1; i < levels.length; i++) {
    if (levels[i] > levels[i - 1] + 1) {
      return problem(`A heading jumps from level ${levels[i - 1]} to level ${levels[i]}. Headings should go down one level at a time.`);
    }
  }
  return ok("Headings go down one level at a time.");
}

export function countImagesWithoutAlt(body: string): number {
  let n = 0;
  for (const m of body.matchAll(/!\[([^\]]*)\]\([^)]*\)/g)) if (!m[1].trim()) n++;
  for (const m of body.matchAll(/<img\b[^>]*>/gi)) {
    const alt = m[0].match(/\balt\s*=\s*(?:"([^"]*)"|'([^']*)')/i);
    if (!alt || !(alt[1] ?? alt[2] ?? "").trim()) n++;
  }
  return n;
}

export function checkAltText(body: string): Check {
  const n = countImagesWithoutAlt(body);
  if (n === 0) return ok("Every image has a description.");
  return problem(`${n === 1 ? "One image has" : `${n} images have`} no description. Say what each one shows.`);
}

export function checkAnswerFirst(body: string): Check {
  const blocks = body.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  if (blocks.length === 0) return problem("The page has no text yet.");
  if (/^(#{1,6}\s|<h[1-6][\s>])/i.test(blocks[0])) {
    return problem("The page starts with a heading. Open with a short paragraph that answers the main question.");
  }
  const words = (blocks[0].match(/\S+/g) ?? []).length;
  if (words < 25) return problem(`The opening paragraph is ${words} words. Take it to 25 or more.`);
  if (words > 60) return problem(`The opening paragraph is ${words} words. Trim it to 60 or fewer.`);
  return ok("The page opens with a short, direct answer.");
}

export function checkReadability(body: string): Check {
  const grade = fleschKincaidGrade(body);
  if (grade === null) return problem("There is no text to measure yet.");
  const g = Math.round(grade * 10) / 10;
  if (g > 9) return problem(`Reading grade ${g}. Shorter sentences and plainer words will help.`);
  return ok(`Reading grade ${g}, easy to follow.`);
}

export function runChecks(v: { title: string; description: string; body: string }) {
  return [
    { key: "title", label: "Title", ...checkTitle(v.title) },
    { key: "description", label: "Search description", ...checkDescription(v.description) },
    { key: "answer", label: "Opening answer", ...checkAnswerFirst(v.body) },
    { key: "h1", label: "Main heading", ...checkH1(v.body) },
    { key: "order", label: "Headings", ...checkHeadingOrder(v.body) },
    { key: "alt", label: "Images", ...checkAltText(v.body) },
    { key: "grade", label: "Reading level", ...checkReadability(v.body) },
  ];
}

/** The panel needs top-level fields named title, description and body. */
export function hasSeoFields(fields: unknown): boolean {
  if (!Array.isArray(fields)) return false;
  const names = new Set(fields.map((f) => (f as { name?: unknown })?.name));
  return ["title", "description", "body"].every((n) => names.has(n));
}
