import { callout, checkItWorked, chip, figure, steps } from "../parts.ts";

export const title = "Menu";
export const group = "modules";
export const slug = "module-menu";
export const moduleId = "menu";
// The date this page was last checked against the CMS. A recheck changes this one line.
export const checked = "2026-11-17";
// Stays out of the guide until Rob has read the page and approved it.
export const approved = false;
export const goal = "You will change a price or a dish on your menu page.";
export const time = "About 3 minutes";
export const body = `<p>Your menu is a list of sections, such as Starters or Drinks, and each section holds its dishes. You change prices and dishes in one place and the menu page on your site follows.</p>
<h2>Change a price or a dish</h2>
${steps([
  {
    action: `Open ${chip("Menu")} in the menu on the left.`,
    see: `A form that starts with ${chip("Menu sections")}.`,
    ifNot: "If the menu has no such entry, your site doesn't use this module. Email Kingsbury Creative.",
  },
  {
    action: `Find the section, then the item under ${chip("Items")}.`,
    figure: figure({ caption: "The menu form with one item open, showing item, description and price." }),
    see: `The boxes ${chip("Item")}, ${chip("Description")} and ${chip("Price (e.g. $14)")}.`,
    ifNot: "Scroll down. Each section lists its own items.",
  },
  {
    action: "Edit the item name, its description or its price. Type the price the way you want it shown, with the dollar sign, like <em>$14</em>.",
    see: "Your new text in the box.",
    ifNot: "The site shows exactly what you type, so add the dollar sign yourself.",
  },
  {
    action: `Choose ${chip("Save")}.`,
    see: "A message that the page saved.",
    ifNot: "If a box is red, fix it first.",
  },
])}
<h2>Add a dish or a section</h2>
<p>To add a dish, open its section, choose ${chip("Add an entry")} under ${chip("Items")}, and fill in the name, description and price. To add a section, choose ${chip("Add an entry")} under ${chip("Menu sections")}, type the ${chip("Section name")}, then add its items. Choose ${chip("Save")} when you are done.</p>
${callout("warning", "Removing a section removes every dish inside it. Use the delete button beside a dish or section, and check before you save.")}
${figure({ caption: "The menu page on the live site with a changed price." })}
${checkItWorked("After a minute, open the menu page on your live site and look over the section you changed.")}`;
