# 67 result

Files changed: `kc/github-email.ts` (new, `pickVerifiedGithubEmail`), `kc/tests/github-email.test.ts` (new, 7 tests), `lib/auth.ts` (calls the helper; on null logs a warn with no token or address and returns null; otherwise sets the email and `emailVerified: true`). Import in lib/auth.ts is relative (`../kc/github-email`) as the brief asked.

Rule: emails not an array -> refuse; pick the entry matching the profile email, else the primary; refuse unless it is verified.

Mutation: returning the profile email when the list is missing failed "emails list undefined is refused" and "emails list not an array is refused". Dropping the verified check failed "unverified matching email is refused" and "unverified primary is refused". Restored, green (443 pass).

better-auth: a null from getUserInfo hits `callback.mjs` `if (!userInfo)`, logs and calls `redirectOnError("unable_to_get_user_info")`, a redirect to the error page, not a throw. The existing profile-fetch failure already took this path, so no new copy was written and `kc/sign-in-methods.ts` was not touched.

Note: the runner ignored the path argument and ran the whole suite each time.

Not done: no plain-language mapping of `unable_to_get_user_info` on the sign-in page (no listed file owns that page).
