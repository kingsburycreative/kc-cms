# 19 result

Files changed: kc/sign-in-methods.ts (new), kc/client-view.ts (`settings.connectGithub`), components/sign-in.tsx (GitHub button and "Or" divider gated on `signInMethods`, `?staff=1`), components/settings/identities.tsx (GitHub row hidden when flag false, via `useUser()` + `hasGithubIdentity`).

Tests added: kc/tests/sign-in-methods.test.ts (4 tests: methods, staff param, sign-in source, identities source); one test in kc/tests/client-view.test.ts.

Mutation: made `signInMethods({ staff: false })` include "github". Failed: "email only by default, GitHub for staff". Restored; green (full 140 pass, the runner ran all files despite the filter args). tsc and eslint kc exit 0.

Call made: added `isStaffParam` helper in sign-in-methods.ts. The whole GitHub row (not just Connect) is hidden for clients.

Not done: no new copy, so no prose skills run. The sign-in source test checks the gating by regex, not rendering.
