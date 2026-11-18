# 110 result

Files changed (all under the brief's list):
- `kc/empty-home-copy.ts` (new): `signedInAsLine`, hint and button text.
- `kc/empty-home-account.tsx` (new): client component. A `kc/` file can hold it; other `kc/` files are already .tsx.
- `kc/tests/empty-home-copy.test.ts` (new): 5 tests.
- `app/(main)/page.tsx`: one import, one element after `EmptyHeader`.

Copy, run through prose, avoid-ai-writing and humanizer (no changes needed after audit):
- "You're signed in as {email}." (falls back to the name, shown only if there is an email or name)
- "If your invitation went to a different address, sign out and sign in with that one."
- Button: "Sign out"

Mutation: email dropped from the line. Failed: "the line names the signed-in email" and "a missing name still shows the email". Restored; green (878 pass, 0 fail). `npx tsc --noEmit` and `npx eslint kc` clean.

Call made: user.tsx's `window.location.assign("/sign-in")` triggers a lint warning (and so does `href`), so the button uses `signOut()` then `router.push("/sign-in")` and `router.refresh()`.

Not done: the 390px screenshot. There is no `.env.local` in the worktree, and a signed-in session needs the database and secrets, which this card forbids. Needs a live or staging look.
