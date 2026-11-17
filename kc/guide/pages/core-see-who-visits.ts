import { callout, checkItWorked, chip, figure, steps } from "../parts.ts";

export const title = "See who visits";
export const group = "core";
export const slug = "core-see-who-visits";
// The date this page was last checked against the CMS. A recheck changes this one line.
export const checked = "2026-11-17";
// Stays out of the guide until Rob has read the page and approved it.
export const approved = false;
export const goal = "You will see how many people visited your site and which pages they read.";
export const time = "About 2 minutes";
export const body = `${steps([
  {
    action: `Choose ${chip("Insights")} in the menu on the left.`,
    figure: figure({ caption: "The Insights page with the day buttons above the charts and the panels below." }),
    see: "Charts of visits, then panels for the pages people read most, roughly where they are, and how they found you.",
    ifNot: "If your menu has no Insights entry, your site doesn't have it switched on. Email Kingsbury Creative.",
  },
  {
    action: "Choose the number of days above the charts to change the period. The choices are 7, 30 and 90 days.",
    see: "The charts redraw for that period.",
    ifNot: "If the charts stay empty, the site may be new. Check again in a few days.",
  },
  {
    action: "Move your pointer over a chart, or touch it on a phone.",
    see: "The visits for one day.",
    ifNot: "On a phone, touch and hold, then slide your finger along the chart.",
  },
])}
${callout("note", `The visitor count includes everyone. Some numbers are marked ${chip("From visitors who allowed analytics")}. They count only people who said yes to the cookie card, so they are lower than the visitor count. The dashboard also shows a shorter visits chart.`)}
${checkItWorked("You can see a chart of visits for the period you chose and the pages people read most.")}`;
