# 105 result

Files: `kc/create-conflict.ts` (new), `kc/tests/create-conflict.test.ts` (new, 9 tests), `lib/config-schema.ts` (import + `create: CreateSchema.optional()` on the collection schema), `components/entry/entry.tsx` (body via helper, 409 message), `kc/register/customizations.json` (entry `create-conflict`, added by me). BOARD.md not touched (coordinator). `app/api/` untouched.

Option: `create: { onConflict: rename | error }` on a collection, default `rename`. Only a new entry (no path) in a collection with `error` sends `onConflict: "error"`; a 409 then throws the message.

Copy: "A file with this name already exists. Open the existing entry to change it." Taken verbatim from the brief; I did not run the prose/avoid-ai-writing/humanizer skills on it.

Mutation: helper always sends `error` failed "without the option", "existing entry", "file schema" tests; never sends failed "a create in an error collection sends onConflict". Restored, 610/610 green.

Call: the existing history-restore test needs `sha: sha }` adjacent in the body literal, so I merged the extra field with `Object.assign` instead of editing that test.

Notes: the runner ran the whole suite despite the filter. One earlier run had 3 unrelated VirtualAlloc crashes (memory), gone on rerun. tsc and eslint printed nothing (clean). Not seen in a browser.
