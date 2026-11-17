import { callout, checkItWorked, chip, figure, steps } from "../parts.ts";

export const title = "Find your way around";
export const group = "core";
export const slug = "core-find-your-way";
// The date this page was last checked against the CMS. A recheck changes this one line.
export const checked = "2026-11-17";
// Stays out of the guide until Rob has read the page and approved it.
export const approved = false;
export const goal = "You will know where to look on the dashboard and in the menu.";
export const time = "About 3 minutes";
export const body = `<p>After you sign in you land on the dashboard, the front page of the CMS. It shows how your site is doing and has buttons for the jobs you do most.</p>
${steps([
  {
    action: `Look at the top of the dashboard for your site's name. Choose ${chip("See live site")} to open your website.`,
    figure: figure({ caption: "The dashboard from the site name down to the list of recent changes." }),
    see: "Your website opens in a new tab.",
    ifNot: "If a pop-up blocker stops the tab, allow pop-ups for the CMS and try again.",
  },
  {
    action: `Find the quick buttons under the heading. Each one starts a job you do often, such as ${chip("Upload a PDF")} or one that begins with ${chip("Add to")}.`,
    see: "A blank form or the upload screen opens when you choose one.",
    ifNot: "Your buttons depend on your site. If one you expect is missing, email Kingsbury Creative.",
  },
  {
    action: `Scroll to ${chip("Visits")} to see how many people came to your site. <a href="core-see-who-visits.html">See who visits</a> explains it.`,
    see: "A short chart of recent visits.",
    ifNot: "If there is no Visits panel, your site doesn't have it switched on. Email Kingsbury Creative.",
  },
  {
    action: `Scroll to ${chip("Recent changes")} to see who changed what, and when.`,
    see: `A list of recent edits with names and dates, and a ${chip("See all changes")} link under it.`,
    ifNot: "If the list says it couldn't load, reload the page.",
  },
  {
    action: "Open the menu on the left. On a phone, choose the menu button at the top left first.",
    figure: figure({ caption: "The left menu with the single pages and the lists of entries." }),
    see: "A list of everything on your site you can change.",
    ifNot: "If the menu is hidden on a wide screen, widen the browser window.",
  },
])}
${callout("note", "The menu holds two kinds of things. A list, such as posts or products, holds many entries you can add and remove. A single page, such as the Home page, appears once. You can change its words but not remove it. Your menu only lists what your site uses, so it may differ from another site's.")}
${checkItWorked(`You can point to the dashboard's ${chip("See live site")} button and to your pages in the left menu.`)}`;
