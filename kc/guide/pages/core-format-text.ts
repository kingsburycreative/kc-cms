import { callout, checkItWorked, chip, figure, steps } from "../parts.ts";

export const title = "Format text";
export const group = "core";
export const slug = "core-format-text";
// The date this page was last checked against the CMS. A recheck changes this one line.
export const checked = "2026-11-17";
// Stays out of the guide until Rob has read the page and approved it.
export const approved = false;
export const goal = "You will turn plain typing into a heading, a link and a list on your site.";
export const time = "About 3 minutes";
export const body = `<p>Some long text boxes use a few simple symbols for formatting. Type them as shown and the website turns them into headings, links and lists. A box that holds only a line or two takes plain words, and none of this applies.</p>
${steps([
  {
    action: "Open the page or entry and click in a long text box, such as the one labelled Text or Post.",
    figure: figure({ caption: "A long text box with a heading, a link and a list typed in, next to how they look on the site." }),
    see: "A large box with a blinking cursor.",
    ifNot: "If the box is a single line, it takes plain words only. Pick a longer one.",
  },
  {
    action: "Start a new line and type <code>## </code> then your heading, for example <code>## Why this matters</code>. Use <code>### </code> for a smaller heading.",
    see: "The symbols stay in the box. The site shows them as a heading after you save.",
    ifNot: "Leave a blank line before and after the heading, or it may join the paragraph above.",
  },
  {
    action: "Wrap words in two stars for bold, <code>**important words**</code>, or one star for italics, <code>*a book title*</code>.",
    see: "The stars stay in the box until the site shows the styling.",
    ifNot: "Check that the stars touch the words on both sides, with no space inside them.",
  },
  {
    action: "Type a link as <code>[Statistics Canada](https://www.statcan.gc.ca)</code>: the words in square brackets, then the address in round brackets.",
    see: "The whole line stays as you typed it.",
    ifNot: "If the link does not work on the site, check that the address starts with https and that no bracket is missing.",
  },
  {
    action: "Start each line with <code>- </code> for a bulleted list, or <code>1. </code>, <code>2. </code> for a numbered one. Start a line with <code>&gt; </code> for a quotation.",
    see: "One item per line.",
    ifNot: "Leave a blank line before the first item.",
  },
  {
    action: `Choose ${chip("Save")} at the top right.`,
    see: "A message that the page saved.",
    ifNot: "If a box is red, fix it first.",
  },
])}
${callout("note", "Leave a blank line between paragraphs. Pasting from Word works, but bold, italics and links don't carry over. Add them again with the symbols above.")}
${checkItWorked(`After a minute, open the page on your live site. Your heading is large, your link is clickable and your list has bullets or numbers.`)}`;
