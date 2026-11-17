import { callout, checkItWorked, chip, figure, steps } from "../parts.ts";

export const title = "Photos and files";
export const group = "core";
export const slug = "core-photos-and-files";
// The date this page was last checked against the CMS. A recheck changes this one line.
export const checked = "2026-11-17";
// Stays out of the guide until Rob has read the page and approved it.
export const approved = false;
export const goal = "You will add a picture or a PDF to a page, and remove one you no longer need.";
export const time = "About 3 minutes";
export const body = `<p>A picture or a file, such as a PDF, belongs to a box on a page or an entry. You add it from that box.</p>
<h2>Add a new file</h2>
${steps([
  {
    action: "Open the page or entry and find the box for the picture or file.",
    figure: figure({ caption: "A picture box with the Upload and Select buttons." }),
    see: `The box shows two buttons, ${chip("Upload")} and ${chip("Select")}.`,
    ifNot: "If the box has no buttons, it already holds the most it can take. Remove the current file first.",
  },
  {
    action: `Choose ${chip("Upload")} and pick the file from your computer.`,
    see: "The file's name appears in the box. On a picture box, a small preview shows too.",
    ifNot: "If the upload fails, check the file type. A picture box takes images and a PDF box takes PDFs only.",
  },
  {
    action: `Choose ${chip("Save")} at the top right.`,
    see: "A message that the page saved.",
    ifNot: "If a box is red, fix it first.",
  },
])}
${callout("note", "The CMS renames the file when it uploads. Summer Sale Final.JPG becomes summer-sale-final.jpg. That is on purpose, so the link to it works everywhere.")}
<h2>Use a file you already uploaded</h2>
${steps([
  {
    action: `In the same box, choose ${chip("Select")} and pick the file from the list.`,
    see: "A box titled Select images with your uploaded files in it.",
    ifNot: "If the file is not in the list, use Upload instead.",
  },
])}
<h2>Remove a file</h2>
${steps([
  {
    action: `Choose ${chip("Media")} in the menu, then the three dots next to the file.`,
    figure: figure({ caption: "The Media screen with files listed and the three-dot menu open next to one." }),
    see: `A menu with ${chip("Delete")}.`,
    ifNot: "If you can't find the file, scroll the list. Files are in the folder their page uses.",
  },
  {
    action: `Choose ${chip("Delete")} and confirm.`,
    see: "The file leaves the list.",
    ifNot: "If the file is still on a page, remove it from that page's box and save.",
  },
])}
${callout("warning", "Deleting an entry does not delete its files. Delete a file in Media yourself when you no longer need it.")}
${checkItWorked(`The file's name shows in its box after you save, and after a minute the picture or download link works on your live site.`)}`;
