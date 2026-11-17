import { callout, checkItWorked, chip, figure, steps } from "../parts.ts";

export const title = "Bilingual pages and posts";
export const group = "modules";
export const slug = "module-bilingual";
export const moduleId = "bilingual";
// The date this page was last checked against the CMS. A recheck changes this one line.
export const checked = "2026-11-17";
// Stays out of the guide until Rob has read the page and approved it.
export const approved = false;
export const goal = "You will add a post in English and its French version, linked together.";
export const time = "About 8 minutes";
export const body = `<p>If your site is in English and French, every page and post has two versions. The French version is linked to the English one by file name, so the site knows which two belong together.</p>
${steps([
  {
    action: `Open ${chip("Blog posts (English)")} in the menu and choose ${chip("Add an entry")}.`,
    see: "A blank post form.",
    ifNot: "If the menu has no such entry, your site doesn't use this module. Email Kingsbury Creative.",
  },
  {
    action: `Fill in ${chip("Title")}, ${chip("Description")}, ${chip("Publish date")}, ${chip("Image")}, ${chip("Image description")} and ${chip("Post")}.`,
    see: "Each box filled in, with no red box left.",
    ifNot: "Image description can't start with image of or photo of. Describe what the picture shows.",
  },
  {
    action: `Choose ${chip("Save")}.`,
    see: "The English post saved and shown in the list.",
    ifNot: "If a box is red, fix it first.",
  },
  {
    action: `Open ${chip("Blog posts (French)")} in the menu and choose ${chip("Add an entry")}.`,
    see: `A blank form that starts with ${chip("English post")}.`,
    ifNot: "Open the French list, not the English one.",
  },
  {
    action: `In ${chip("English post")}, search for the English title and pick it.`,
    figure: figure({ caption: "The French post form with the English post picker open and one title chosen." }),
    see: "The English title shows in the box.",
    ifNot: "If the title doesn't appear, check that the English post was saved.",
  },
  {
    action: `Write the French ${chip("Title")}, ${chip("Description")} and ${chip("Post")}, then choose ${chip("Save")}.`,
    see: "The French post saved and shown in its list.",
    ifNot: "If the CMS refuses to save, that English post already has a French version. Open that one and edit it instead.",
  },
])}
${callout("note", "The French post takes its file name from the English one. That is the link, so don't rename either file afterwards. Each English post can have only one French version. Changing the English title doesn't change the French one, so update both when the meaning changes.")}
<h2>Pages with two versions</h2>
<p>Pages such as the contact page are listed twice, once for each language, for example ${chip("Contact page (English)")} and ${chip("Contact page (French)")}. Open each one and edit it. They have the same boxes.</p>
${figure({ caption: "The menu showing the English and French versions of the contact page side by side." })}
${checkItWorked("Open both posts on your live site after a minute. Each shows in its own language. The French post matches the English one.")}`;
