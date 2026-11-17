Result: does not restore

Restore only brings a field back if the CMS's copy of the site's .pages.yml lists that field. Henike's wipe happened because it did not, so History would have shown the old version without the FAQ and saving it would have written the wiped page again.

Where the field is dropped, in the order a restore runs. When History fetches the old version, `app/api/[owner]/[repo]/[branch]/entries/[path]/route.ts:165` (parseContent) passes it through `deepMap` in `lib/schema.ts:34-77`, which builds a new object from the schema's fields only; anything else is gone before the editor sees it. `kc/history/restore.ts:11-13` then loads that already-trimmed content into the form (`components/entry/entry.tsx:285-291`). On save, `app/api/[owner]/[repo]/[branch]/files/[path]/route.ts:108-133` validates with a Zod object (which strips unknown keys) and maps through `deepMap` again, so a field the schema lacks cannot be written even if it reached the request.

The test (`kc/tests/restore-wiped-field.test.ts`) runs the real code over a trimmed copy of Henike's files. With the schema listing the answers and FAQ, restore then save returns them. With them removed from the schema, it returns the wiped page.

One inference, not verified: Kirk's save dropped answer, source and faq everywhere, while Henike's .pages.yml at that commit already listed them (commit 2cb5c25, the day before). That fits the CMS holding an older cached copy of the schema. The card did not check the config cache. Now that the schema is current, restoring would work, so the fix worth making is likely keeping the config fresh, or having restore and save keep fields the schema does not list (card 02).

A restore also reverts everything else in the file to the old version, including Kirk's other wording edits that day.
