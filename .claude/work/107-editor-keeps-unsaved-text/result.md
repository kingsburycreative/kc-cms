# 107 result

Files changed: `kc/editor-guard.ts` (new), `kc/tests/editor-guard.test.ts` (new, 11 tests), `components/entry/entry.tsx`, `components/entry/entry-form.tsx`. Each upstream edit is marked `// KC:`. No other test asserted on the changed lines, so none were edited.

- The entry fetch has `revalidateOnFocus: false`.
- After a save, `mutateEntry(cacheAfterSave(...), { revalidate: false })` runs when the path did not change.
- The form resets only when `shouldResetForm` allows it: never while dirty, and only when the data differs from what was last applied.
- While there are unsaved edits, a `beforeunload` guard and a capture-phase in-app link guard (`window.confirm`) are on. Both come off when the form is clean.
- A failed validation keeps the toast, each field shows its `FormMessage`, and the page scrolls to the first `aria-invalid` field.

Mutation runs, each failed and then went green after the restore:
1. `shouldResetForm` ignoring isDirty: "a dirty form is never reset, whatever the refetch brings" failed.
2. With the `mutateEntry` call dropped: "entry.tsx writes the saved content into the cache after a save" failed.

Note: the runner ran the full suite each time (621 tests), not only the two files.

Not done:
- Copy: I wrote `LEAVE_WARNING` by hand and did not run it through the prose skill. The PM should run it through.
- The browser back button inside the app is not guarded. The App Router has no event to hook. Reload and tab close are covered.

PM live check: a focus switch after typing keeps the text; a save followed by more typing and a focus switch keeps it; clicking another file asks first.
