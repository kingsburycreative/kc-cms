import { callout, checkItWorked, chip, figure, menuPath, steps } from "../parts.ts";

export const title = "Add and remove an entry in a list";
export const group = "core";
export const slug = "core-add-remove-entry";
// The date this page was last checked against the CMS. A recheck changes this one line.
export const checked = "2026-11-17";
// Stays out of the guide until Rob has read the page and approved it.
export const approved = false;
export const goal = "You will add a new item to a list on your site, and know how to remove one.";
export const time = "About 3 minutes";
export const body = `<p>Some parts of your site are lists, such as posts, products or team members. Each item in a list is an entry, and each entry usually gets its own page on the site.</p>
<h2>Add an entry</h2>
${steps([
  {
    action: "Choose the list in the menu on the left.",
    see: "The list of entries already there, newest first in most lists.",
    ifNot: "If the list is not in the menu, your site doesn't have it. Email Kingsbury Creative.",
  },
  {
    action: `Choose ${chip("Add an entry")} at the top right.`,
    figure: figure({ caption: "A new blank entry with its boxes and the Save button at the top right." }),
    see: "A blank form with a labelled box for each part.",
    ifNot: "If the button is missing, you are on a single page rather than a list. Go back to the menu.",
  },
  {
    action: "Fill in the boxes. Start with the title and any box marked as required.",
    see: "Your words in each box.",
    ifNot: "If a box turns red, a message under it says what to fix.",
  },
  {
    action: `Choose ${chip("Save")}.`,
    see: "The entry opens as saved, and it appears in the list.",
    ifNot: "Nothing saves until every red box is fixed. Scroll up and check.",
  },
])}
<h2>Remove an entry</h2>
${callout("warning", "Deleting an entry takes its page off your website about a minute after you confirm. Any picture or file you attached stays in Media.")}
${steps([
  {
    action: "Open the entry from the list.",
    see: "The entry's form.",
    ifNot: "Choose the list in the menu first, then the entry's title.",
  },
  {
    action: "Choose the three dots at the top right, then choose Delete.",
    figure: figure({ caption: "An entry with the three-dot menu open, showing Rename and Delete." }),
    see: `A menu with ${chip("Rename")} and ${chip("Delete")}, then a box asking you to confirm.`,
    ifNot: "If the three dots are missing, deleting is switched off for this entry. Email Kingsbury Creative.",
  },
  {
    action: `Choose ${chip("Delete")} in the box to confirm.`,
    see: "The entry is gone from the list.",
    ifNot: "If it is still there, reload the list.",
  },
])}
${callout("note", `Avoid ${chip("Rename")} on anything already on your site. It changes the page's web address, so saved links stop working. To change a title, edit the title box instead. To remove a leftover picture, see <a href="core-photos-and-files.html">Photos and files</a>.`)}
${checkItWorked(`Open the list again from ${menuPath("Menu", "your list")}. A new entry is in it, or a deleted one is gone. After a minute the live site matches. If you deleted by accident, email us (see <a href="core-getting-help.html">Getting help</a>) and we can bring it back.`)}`;
