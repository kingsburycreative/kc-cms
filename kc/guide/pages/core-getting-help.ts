import { callout, checkItWorked, chip, figure, steps, CONTACT_EMAIL } from "../parts.ts";

export const title = "Getting help";
export const group = "core";
export const slug = "core-getting-help";
// The date this page was last checked against the CMS. A recheck changes this one line.
export const checked = "2026-11-17";
// Stays out of the guide until Rob has read the page and approved it.
export const approved = false;
export const goal = "You will send Kingsbury Creative a message that gets you a fast answer.";
export const time = "About 3 minutes";
export const body = `<p>If something won't save, looks wrong on the site, or you'd like a new section or page added, email Rob at Kingsbury Creative.</p>
${steps([
  {
    action: "Go to the screen where the problem is, and leave it as it is.",
    figure: figure({ caption: "A screen with a red box and its message, ready to capture." }),
    see: "The same screen you had when it went wrong.",
    ifNot: "If you already left it, open it again and repeat what you did.",
  },
  {
    action: "Take a screenshot of the screen.",
    see: "A picture of the screen saved on your device.",
    ifNot: "If you don't know how, describe what you see in words.",
  },
  {
    action: `Email <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a> with the screenshot, the page name and what you were trying to do.`,
    see: "Your email in your sent folder.",
    ifNot: "If the link doesn't open your email, copy the address and write from your own email app.",
  },
])}
${callout("note", `You can't break your website from the CMS. If a change has a problem the site can't publish, the last working version stays live. Put a wrong edit back with the clock button on the page, or see <a href="core-undo.html">Undo a change and get an old version back</a>. If you delete something by accident, email us and we can bring it back. The ${chip("See all changes")} list shows what was changed and when.`)}
${checkItWorked("You have sent the email and kept the screen open or noted what it said.")}`;
