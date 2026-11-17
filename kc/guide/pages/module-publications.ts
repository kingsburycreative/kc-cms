import { callout, checkItWorked, chip, figure, steps } from "../parts.ts";

export const title = "Papers, research summaries and weekly posts";
export const group = "modules";
export const slug = "module-publications";
export const moduleId = "publications";
// The date this page was last checked against the CMS. A recheck changes this one line.
export const checked = "2026-11-17";
// Stays out of the guide until Rob has read the page and approved it.
export const approved = false;
export const goal = "You will publish a weekly post or a paper with its PDF.";
export const time = "About 10 minutes";
export const body = `<p>If your site shares research, it has up to four lists in the menu: ${chip("Weekly")}, ${chip("What Works")}, ${chip("Insight Briefs")} and ${chip("Papers")}. The first three are written posts. A paper has citation details and a PDF to download. Each one gets its own page on the site.</p>
<h2>Add a weekly post</h2>
<p>The steps are the same for What Works and Insight Briefs. Only the list you open changes.</p>
${steps([
  {
    action: `Open ${chip("Weekly")} in the menu and choose ${chip("Add an entry")}.`,
    see: "A blank post form.",
    ifNot: "If the menu has no such list, your site doesn't use this module. Email Kingsbury Creative.",
  },
  {
    action: `Type the ${chip("Title")}. It becomes the heading of the post and part of its web address.`,
    see: "The title in the box.",
    ifNot: "The title is required. If it is red, fill it in.",
  },
  {
    action: `Write the ${chip("Description (120 to 155 characters)")}, the short summary a search engine shows under your link.`,
    figure: figure({ caption: "The new weekly post form with the description box showing its length message." }),
    see: "Your summary in the box.",
    ifNot: "If the box turns red, the summary is too short or too long. Aim for 120 to 155 characters.",
  },
  {
    action: `Check the ${chip("Date")}. Under ${chip("Authors")}, choose ${chip("Add an item")} and type each author's name.`,
    see: "One line per author.",
    ifNot: "At least one author is required.",
  },
  {
    action: `Write or paste the post into the ${chip("Text")} box, then choose ${chip("Save")}.`,
    see: "A message that the post saved.",
    ifNot: "If a box is red, fix it first.",
  },
])}
${callout("note", `If you correct a post that is already live, change the ${chip("Updated")} date too, so readers can see it was revised. ${chip("References")} adds a list at the end of the post. ${chip("Abbreviations")} lets you spell out a short form once, and the site shows the full name when a reader hovers over it.`)}
<h2>Add a paper and its PDF</h2>
${steps([
  {
    action: `Open ${chip("Papers")} in the menu and choose ${chip("Add an entry")}.`,
    see: "A blank paper form.",
    ifNot: "If the menu has no Papers, your site doesn't use this module. Email Kingsbury Creative.",
  },
  {
    action: `Type the ${chip("Title")}. Under ${chip("Authors, in order")}, choose ${chip("Add an item")} and fill in ${chip("Given names")} and ${chip("Family name")} for each author.`,
    see: `One group of boxes per author. ${chip("Affiliation")} and ${chip("ORCID (like 0000-0002-1825-0097)")} are optional.`,
    ifNot: "If the ORCID box turns red, use the format in its label.",
  },
  {
    action: `Choose the ${chip("Type")} and the ${chip("Status")}.`,
    see: "Both boxes show your choices.",
    ifNot: `Every type except a preprint needs ${chip("Journal, publisher or series (needed for every type but preprint)")} filled in.`,
  },
  {
    action: "Fill in the citation details you have: volume, issue, pages, link, ISBN, ISSN and keywords. Leave the rest empty.",
    see: "Your details in their boxes.",
    ifNot: "A link must start with https.",
  },
  {
    action: `Paste the ${chip("Abstract")}.`,
    see: "The abstract in the box.",
    ifNot: "The abstract is required.",
  },
  {
    action: `Under ${chip("PDF (25 MB at most)")}, choose ${chip("Upload")} and pick the file.`,
    figure: figure({ caption: "The paper form with the journal details filled in and the PDF file name showing." }),
    see: "The file name appears in the box.",
    ifNot: `The file must be a PDF of 25 MB or less. To use a PDF you uploaded earlier, choose ${chip("Select")} instead.`,
  },
  {
    action: `Add the ${chip("DOI")} if the paper has one, then choose ${chip("Save")}.`,
    see: "A message that the paper saved.",
    ifNot: "If a box is red, fix it first.",
  },
])}
${callout("note", "The file is renamed when it uploads. Study Summary 2026 Final.PDF becomes study-summary-2026-final.pdf. That is on purpose, so the download link works everywhere.")}
<h2>Fix a mistake or remove a post</h2>
<p>To fix a mistake, open the post or paper, change the box and choose ${chip("Save")}. To remove one, open it, choose the three dots at the top right, then ${chip("Delete")}, and confirm. A deleted paper leaves its PDF in Media. Delete the file there as well if you want it gone.</p>
${callout("warning", `Don't use ${chip("Rename")} on anything already live. It changes the page's web address, and links people saved stop working. To change a title, edit the ${chip("Title")} box.`)}
${figure({ caption: "The three-dot menu on a paper with Delete visible." })}
${checkItWorked("After a minute, open the post or paper on your live site. The title, authors and, for a paper, the PDF download all work.")}`;
