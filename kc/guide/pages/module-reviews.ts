import { callout, checkItWorked, chip, figure, steps } from "../parts.ts";

export const title = "Reviews and rating";
export const group = "modules";
export const slug = "module-reviews";
export const moduleId = "reviews";
// The date this page was last checked against the CMS. A recheck changes this one line.
export const checked = "2026-11-17";
// Stays out of the guide until Rob has read the page and approved it.
export const approved = false;
export const goal = "You will refresh the reviews and the star rating shown on your site.";
export const time = "About 6 minutes";
export const body = `<p>The reviews and the star rating on your site are typed in by you. They do not update by themselves, so you copy them from Google when you want them refreshed.</p>
<h2>Update the reviews</h2>
${steps([
  {
    action: `Open ${chip("Google reviews")} in the menu.`,
    see: "A form with your current reviews.",
    ifNot: "If the menu has no such entry, your site doesn't use this module. Email Kingsbury Creative.",
  },
  {
    action: `In ${chip("Where and when the reviews were copied from")}, type where and when, for example <em>Google, copied in November 2026</em>.`,
    figure: figure({ caption: "The Google reviews form with two reviews filled in." }),
    see: "Your note in the box.",
    ifNot: "The box is required. If it is red, fill it in.",
  },
  {
    action: `Paste your Google reviews page link into ${chip("Google reviews link (https)")}.`,
    see: "The link in the box.",
    ifNot: "The link must start with https.",
  },
  {
    action: `Under ${chip("Reviews, word for word")}, choose ${chip("Add an item")} for each review. Type the name in ${chip("Name as Google shows it")} and the text in ${chip("Review text, word for word")}.`,
    see: "One name and one review per item.",
    ifNot: "Don't fix spelling or trim the text. Copy it exactly.",
  },
  {
    action: `Choose ${chip("Save")}.`,
    see: "A message that the page saved.",
    ifNot: "If a box is red, fix it first.",
  },
])}
${callout("note", "Only copy reviews that are really on Google. Visitors can check them against your Google page.")}
<h2>Update the rating</h2>
${steps([
  {
    action: `Open ${chip("Google rating")} in the menu.`,
    see: "A form with a rating, a review count and a date.",
    ifNot: "If the menu has no such entry, ask Kingsbury Creative.",
  },
  {
    action: `Type the rating from Google into ${chip("Rating (1.0 to 5.0)")}, and the number of reviews into ${chip("Number of reviews")}.`,
    figure: figure({ caption: "The Google rating form showing a rating, a review count and a date." }),
    see: "Both numbers in their boxes.",
    ifNot: "The rating must be between 1 and 5.",
  },
  {
    action: `Type the day you copied the figures into ${chip("Date (YYYY-MM-DD)")}, like 2026-11-17.`,
    see: "The date in the box.",
    ifNot: "If the box turns red, use year, month and day with dashes.",
  },
  {
    action: `Choose ${chip("Save")}.`,
    see: "A message that the page saved.",
    ifNot: "If a box is red, fix it first.",
  },
])}
${callout("note", "Update the rating and the reviews on the same day. The rating shows its date, so an old date next to new reviews looks wrong.")}
${checkItWorked("After a minute, open your live site. The new reviews and the new rating show, with today's date.")}`;
