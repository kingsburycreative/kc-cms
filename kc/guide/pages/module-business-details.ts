import { callout, checkItWorked, chip, figure, steps } from "../parts.ts";

export const title = "Business details";
export const group = "modules";
export const slug = "module-business-details";
export const moduleId = "business-details";
// The date this page was last checked against the CMS. A recheck changes this one line.
export const checked = "2026-11-17";
// Stays out of the guide until Rob has read the page and approved it.
export const approved = false;
export const goal = "You will change your business name, phone, email or social links in one place.";
export const time = "About 2 minutes";
export const body = `<p>Your business name, phone number, email, social pages and service areas live in one place. Change them here and every page that shows them changes too.</p>
${steps([
  {
    action: `Open ${chip("Business details")} in the menu.`,
    see: "A form with your current details.",
    ifNot: "If the menu has no such entry, your site doesn't use this module. Email Kingsbury Creative.",
  },
  {
    action: `Click the box you want to change: ${chip("Legal name")}, ${chip("Phone (like 555-010-0199)")}, ${chip("Email")}, ${chip("Facebook page")}, ${chip("Instagram page")} or ${chip("Service areas")}.`,
    figure: figure({ caption: "The Business details form with the phone number box selected." }),
    see: "A cursor in that box.",
    ifNot: "Scroll down. The social links and service areas sit under the phone and email.",
  },
  {
    action: "Type the new value. For the phone, use three digits, three digits and four digits with dashes, like 555-010-0199. For a social page, type the full link starting with https.",
    figure: figure({ caption: "The phone box with the message asking for the dashes format." }),
    see: "Your value in the box.",
    ifNot: "If the box turns red, the message under it says the shape it expects. Match it.",
  },
  {
    action: `To add a service area, choose ${chip("Add an entry")} under ${chip("Service areas")} and type one town or region.`,
    see: "A new line with your town in it.",
    ifNot: "Use one town or region per line.",
  },
  {
    action: `Choose ${chip("Save")}.`,
    see: "A message that the page saved.",
    ifNot: "Nothing saves until every red box is fixed.",
  },
])}
${callout("note", "Your email must be a full address, like office@example.com.")}
${checkItWorked("After a minute, open your live site. The footer and the contact page show the new details. Tap the phone number on a phone to test it once.")}`;
