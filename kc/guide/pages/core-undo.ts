import { callout, checkItWorked, chip, figure, steps } from "../parts.ts";

export const title = "Undo a change and get an old version back";
export const group = "core";
export const slug = "core-undo";
// The date this page was last checked against the CMS. A recheck changes this one line.
export const checked = "2026-11-17";
// Stays out of the guide until Rob has read the page and approved it.
export const approved = false;
export const goal = "You will put an earlier version of a page or entry back on your site.";
export const time = "About 3 minutes";
export const body = `<p>Every save is kept, so nothing you change is lost for good.</p>
${steps([
  {
    action: "Open the page or entry you want to put back.",
    see: "Its form, with the Save button at the top right.",
    ifNot: "Choose it in the menu first.",
  },
  {
    action: "Choose the clock button at the top right, next to Save.",
    figure: figure({ caption: "The clock button open on a page, showing recent changes and a See all changes link." }),
    see: `A short list of the latest changes with who made them, and ${chip("See all changes")} at the bottom.`,
    ifNot: "If the clock button is greyed out, this page has no saved history yet.",
  },
  {
    action: `Choose the change you want to go back to. If it isn't in the short list, choose ${chip("See all changes")}.`,
    see: "The change opens and shows the wording as it was then.",
    ifNot: "If you can't find it, scroll the full list. The newest changes are at the top.",
  },
  {
    action: `Choose ${chip("Restore this version")}.`,
    figure: figure({ caption: "An earlier version of a page, with Restore this version at the top." }),
    see: "The editor opens with the older wording filled in. It is not saved yet.",
    ifNot: "If the link is missing, that change can't be restored from here. Email Kingsbury Creative.",
  },
  {
    action: `Read what the editor shows, then choose ${chip("Save")}.`,
    see: "A message that the page saved. It goes live again about a minute later.",
    ifNot: "If a section of the old version is missing from the editor, don't save. Email us first.",
  },
])}
${callout("warning", "A restore brings back the old version of the whole page or entry, so other edits made since then go back too. It only brings back the parts your site's setup knows about. Saving a page without a missing section removes that section from the live site.")}
${checkItWorked(`Open the page on your live site after a minute. It shows the older wording. The ${chip("Recent changes")} list on the dashboard now shows your save. Need help? See <a href="core-getting-help.html">Getting help</a>.`)}`;
