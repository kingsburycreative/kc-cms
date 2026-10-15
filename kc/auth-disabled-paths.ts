// Email-OTP endpoints better-auth answers 404 for. KC signs in only with
// send-verification-otp and sign-in/email-otp; each of these takes a code
// nobody is emailed (or, for check, does not use the code up), so a caller
// could guess one silently.
export const AUTH_DISABLED_PATHS = [
  "/email-otp/check-verification-otp",
  "/email-otp/verify-email",
  "/email-otp/request-password-reset",
  "/forget-password/email-otp",
  "/email-otp/reset-password",
];
