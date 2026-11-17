# 108.02 result

Fields the schema does not list now survive the History read, the editor form and the save.

Changed:
- `kc/keep-unlisted.ts` (new): `keepUnlisted(fields, raw, kept)` copies unlisted keys from raw into what deepMap kept, recursing into objects, list items and blocks. Listed fields are never overridden.
- Entries GET route: the parseContent `deepMap(...)` call is wrapped in `keepUnlisted(entryFields, contentObject, ...)`, plus import.
- Files POST route: the save's `deepMap(zodValidation.data, ...)` is wrapped in `keepUnlisted(contentFields, contentObject, ...)` (unlisted keys come from the request body, after Zod strips them), plus import.
- `lib/schema.ts` `initializeState`: same wrap, plus import. Needed: the editor form builds its values with initializeState, which drops unlisted keys on the client, so a route-only fix would never see them on save.
- `kc/register/customizations.json`: entry `keep-unlisted`.
- Tests: `kc/tests/keep-unlisted.test.ts` (3 new); `restore-wiped-field.test.ts` second test flipped and its pipeline mirrors the new hooks.

Mutation: merge disabled (early return) -> "unlisted keys come back at the top, in objects, list items and blocks" and "when the schema does not list them, restore then save still brings them back" failed; restored, green (626 pass).

Calls: the brief's `kc/tests/customizations.test.ts` does not exist; ran `register-customizations.test.ts`. `kc/history/restore.ts` unchanged. Did not add a fetch of the branch's current file on save: the request now carries the keys. Unlisted keys bypass Zod validation (still go through sanitizeObject); worth a security-auditor look. Not verified in a live editor.
