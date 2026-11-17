import { callout, checkItWorked, chip, figure, steps } from "../parts.ts";

export const title = "Opening hours";
export const group = "modules";
export const slug = "module-hours";
export const moduleId = "hours";
// The date this page was last checked against the CMS. A recheck changes this one line.
export const checked = "2026-11-17";
// Stays out of the guide until Rob has read the page and approved it.
export const approved = false;
export const goal = "You will change your opening hours so visitors see the right times.";
export const time = "About 2 minutes";
export const body = `<p>Your opening hours sit in the same place as your address, phone number and email, under ${chip("Hours and contact")}. Visitors see them on your contact page and often in the footer.</p>
${steps([
  {
    action: `Open ${chip("Hours and contact")} in the menu.`,
    see: "A form with your restaurant name, address, phone and the hours.",
    ifNot: "If the menu has no such entry, your site doesn't use this module. Email Kingsbury Creative.",
  },
  {
    action: `Scroll to ${chip("Hours")}. Each line has ${chip("Days")} and ${chip("Times")}.`,
    figure: figure({ caption: "The Hours and contact form scrolled to the hours lines." }),
    see: "One line per set of days, in the order the site shows them.",
    ifNot: "If you can't find Hours, scroll to the bottom of the form.",
  },
  {
    action: `Edit a line, for example ${chip("Days")}: <em>Monday to Thursday</em> and ${chip("Times")}: <em>11 am to 9 pm</em>.`,
    see: "Your new text in the line.",
    ifNot: "Type the days and times the way you want visitors to read them. The site shows exactly what you type.",
  },
  {
    action: `If your weekend hours differ, choose ${chip("Add an entry")} under ${chip("Hours")} and fill in a new ${chip("Days")} and ${chip("Times")}.`,
    see: "A new line at the bottom.",
    ifNot: "Remove a line you no longer need with its delete button.",
  },
  {
    action: `Choose ${chip("Save")}.`,
    see: "A message that the page saved.",
    ifNot: "If a box is red, fix it first.",
  },
])}
${callout("note", `For a holiday or a day closed, type it into the line yourself, for example ${chip("Days")}: <em>Monday</em> and ${chip("Times")}: <em>Closed</em>. Change it back when you reopen. The site does not know the calendar. The same form also holds ${chip("Restaurant name")}, ${chip("One-line description")}, ${chip("Address")}, ${chip("Phone")}, ${chip("Email")} and ${chip("Facebook page URL")}. Type the Facebook link in full, starting with https.`)}
${figure({ caption: "The contact page on the live site showing the new hours." })}
${checkItWorked("After a minute, open your contact page. The new hours show there and in the footer.")}`;
