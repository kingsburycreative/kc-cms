import { callout, checkItWorked, chip, figure, steps } from "../parts.ts";

export const title = "Save, and what it does to your live site";
export const group = "core";
export const slug = "core-save-and-live-site";
// The date this page was last checked against the CMS. A recheck changes this one line.
export const checked = "2026-11-17";
// Stays out of the guide until Rob has read the page and approved it.
export const approved = false;
export const goal = "You will save a change and see it on your live website.";
export const time = "About 2 minutes";
export const body = `${callout("warning", "Everything you save goes live on your website about a minute later. There is no separate publish button, so save only when you are happy for people to see it.")}
${steps([
  {
    action: `When your edits are done, choose ${chip("Save")} at the top right of the page.`,
    figure: figure({ caption: "The Save button at the top right of a page being edited." }),
    see: "A short message that the page saved.",
    ifNot: "If a box is red, a message under it says what to fix. The page won't save until every red box is fixed.",
  },
  {
    action: `Choose ${chip("See live site")} on the dashboard, and wait a minute or two.`,
    see: "Your website opens in a new tab.",
    ifNot: "If a pop-up blocker stops the tab, allow pop-ups for the CMS.",
  },
  {
    action: "Open the page you changed and look for your edit.",
    see: "Your new words or picture.",
    ifNot: "If you still see the old version, reload the page in your browser. If it is still old after five minutes, email Kingsbury Creative.",
  },
])}
${callout("note", `Until you choose ${chip("Save")}, nothing changes on the site, and leaving the page loses your edits. If a change has a problem the site can't publish, the last working version stays live. Every save is kept, so you can go back to an earlier one. See <a href="core-undo.html">Undo a change and get an old version back</a>.`)}
${checkItWorked("Your edit shows on the live page after a minute or two.")}`;
