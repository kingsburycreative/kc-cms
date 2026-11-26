import { NOT_INVITED_CODE } from "./invite-code.ts";

export const HELP_EMAIL = "hello@kingsburycreative.com";

export type InlineSignInError = { message: string; help: string; helpEmail: string; helpHref: string };

// Errors shown under the email field instead of a toast. Others stay toasts.
export function inlineSignInError(code: unknown): InlineSignInError | null {
  if (code !== NOT_INVITED_CODE) return null;
  return {
    message: "There's no account for this email address. Check it for typos, or use the address your invitation was sent to.",
    help: "Still stuck? Email",
    helpEmail: HELP_EMAIL,
    helpHref: `mailto:${HELP_EMAIL}`,
  };
}
