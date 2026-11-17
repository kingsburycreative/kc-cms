import { callout, checkItWorked, chip, figure, steps } from "../parts.ts";

export const title = "Sign in";
export const group = "core";
export const slug = "core-sign-in";
// The date this page was last checked against the CMS. A recheck changes this one line.
export const checked = "2026-11-17";
// Stays out of the guide until Rob has read the page and approved it.
export const approved = false;
export const goal = "You will be signed in and looking at your dashboard.";
export const time = "About 2 minutes";
export const body = `<p>You don't need a password. Each time you sign in, the CMS emails you a six-digit code.</p>
${steps([
  {
    action: "Open the address Kingsbury Creative sent you. Bookmark it, because you use it every time.",
    figure: figure({ caption: "The sign-in page with the Email box and the Continue with email button." }),
    see: `A page with a box labelled ${chip("Email")}.`,
    ifNot: "Ask Kingsbury Creative to send the address again.",
  },
  {
    action: `Type the email address we set up for you in the ${chip("Email")} box.`,
    see: "Your address in the box.",
    ifNot: "If the CMS says the email is not valid, check for a typo or a space at the end.",
  },
  {
    action: `Choose ${chip("Continue with email")}.`,
    see: `A page titled ${chip("Verify your login")}. It says it sent a 6-digit code to your address.`,
    ifNot: "If nothing changes, wait a moment and choose the button once more.",
  },
  {
    action: "Open the email from Kingsbury Creative and find the six-digit code.",
    see: "An email with six digits in it, within a minute or two.",
    ifNot: `Check your junk folder. If the email is not there after two minutes, go back to the sign-in page and choose ${chip("Resend code")}.`,
  },
  {
    action: "Type the six digits into the boxes on the CMS page.",
    figure: figure({ caption: "The six code boxes with the Verify code and Resend code buttons under them." }),
    see: `All six boxes filled, and the ${chip("Verify code")} button ready to use.`,
    ifNot: `Type the digits with no spaces. If you paste, check that all six landed.`,
  },
  {
    action: `Choose ${chip("Verify code")}.`,
    see: "Your dashboard, with your site's name at the top.",
    ifNot: `If the CMS rejects the code, choose ${chip("Resend code")} and use the newest email.`,
  },
])}
${callout("note", "The code stops working after a few minutes. After several wrong codes in a row, the CMS makes you wait before you try again. Wait a few minutes, then ask for a fresh code.")}
${checkItWorked(`You are on the dashboard and can see your site's name. If you are not, email Kingsbury Creative from the link below.`)}`;
