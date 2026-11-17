import { callout, checkItWorked, chip, figure, steps } from "../parts.ts";

export const title = "Events";
export const group = "modules";
export const slug = "module-events";
export const moduleId = "events";
// The date this page was last checked against the CMS. A recheck changes this one line.
export const checked = "2026-11-17";
// Stays out of the guide until Rob has read the page and approved it.
export const approved = false;
export const goal = "You will add an event that visitors can see on your site.";
export const time = "About 4 minutes";
export const body = `<p>Events are the dates you want visitors to see, such as a live music night or a tasting. Each event has a date, an optional time and photo, and a switch that decides whether it shows on the site.</p>
${steps([
  {
    action: `Open ${chip("Events")} in the menu and choose ${chip("Add an entry")}.`,
    see: "A blank event form.",
    ifNot: "If the menu has no Events entry, your site doesn't use this module. Email Kingsbury Creative.",
  },
  {
    action: `Type the ${chip("Event name")}, for example <em>Friday Jazz Night</em>.`,
    see: "The name in the box.",
    ifNot: "The name is required. If the box is red, fill it in.",
  },
  {
    action: `Pick the ${chip("Date")}.`,
    figure: figure({ caption: "The event form filled in for a jazz night, with the date picker open." }),
    see: "A calendar opens. After you pick, the date shows in the box.",
    ifNot: "If the calendar doesn't open, click the box once more.",
  },
  {
    action: `Type the time in ${chip("Time (e.g. 7 pm)")} the way you would say it. This box is optional.`,
    see: "Your time in the box.",
    ifNot: "Leave it empty if the event has no set time.",
  },
  {
    action: `Add ${chip("Photo or poster")} if you have one, then write the ${chip("Details")}: what happens, the price, how to book.`,
    see: "The picture's name in its box and your words in Details.",
    ifNot: "If the picture won't upload, check that it is a picture file.",
  },
  {
    action: `Check that ${chip("Show on the site")} is on, then choose ${chip("Save")}.`,
    see: "The event saved and shown in your list.",
    ifNot: "If a box is red, fix it first.",
  },
])}
<h2>Hide an event without deleting it</h2>
<p>Turn off ${chip("Show on the site")} and choose ${chip("Save")}. The event stays in your list but visitors do not see it. Turn it back on any time.</p>
<h2>Change or remove an event</h2>
<p>Open ${chip("Events")}, choose the event and edit it. To remove it, choose the three dots at the top right, then ${chip("Delete")}.</p>
${figure({ caption: "The events list showing title, date and whether each one is shown." })}
${callout("note", "Past events do not remove themselves. Check the list now and then and delete or hide the old ones.")}
${checkItWorked("After a minute, open the events page on your live site. Your event is there with the right date.")}`;
