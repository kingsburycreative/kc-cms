import { callout, checkItWorked, chip, figure, steps } from "../parts.ts";

export const title = "Change the text on a page";
export const group = "core";
export const slug = "core-change-page-text";
// The date this page was last checked against the CMS. A recheck changes this one line.
export const checked = "2026-11-17";
// Stays out of the guide until Rob has read the page and approved it.
export const approved = false;
export const goal = "You will change the wording on a page of your site.";
export const time = "About 2 minutes";
export const body = `${steps([
  {
    action: `Choose the page in the menu on the left, for example ${chip("Home (English)")}.`,
    see: "The page opens with a labelled box for each part, in the same order as on the site.",
    ifNot: "If you can't see the page, its group in the menu may be closed. Choose the group name to open it.",
  },
  {
    action: "Click in the box for the part you want to change. The label above each box says which part it controls.",
    figure: figure({ caption: "A page open for editing, with its labelled boxes running top to bottom." }),
    see: "A blinking cursor in the box.",
    ifNot: "If the box is greyed out and won't take typing, email Kingsbury Creative.",
  },
  {
    action: "Type your new words over the old ones.",
    see: `The text changes in the box. The ${chip("Save")} button becomes available.`,
    ifNot: `If a box turns red, a message under it says what to fix. ${chip("Save")} won't work until it is fixed.`,
  },
  {
    action: `Choose ${chip("Save")} at the top right.`,
    see: "A short message that the page saved.",
    ifNot: "If nothing happens, scroll up and look for a red box.",
  },
])}
${callout("note", `Your change goes live about a minute after you save. <a href="core-save-and-live-site.html">Save, and what it does to your live site</a> has the details. A page title and description are what people see in a browser tab and in Google results, so change them with care.`)}
${checkItWorked(`Choose ${chip("See live site")} on the dashboard, wait a minute, open the page and look for your new words. If you still see the old ones, reload the page.`)}`;
