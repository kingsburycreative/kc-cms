Result: restores

Opening the old Services page in History and saving it through the editor would have brought Henike's FAQ back, word for word, as long as the site's settings file lists the FAQ fields. Henike's did: at commit 98ce106 each service has answer, source and faq in `.pages.yml`, added the day before Kirk's save (commit 2cb5c25).

Why it works: restore loads the old version's content into the editor (`kc/history/restore.ts:11`, called from `components/entry/entry.tsx:285-291`). The editor then builds its form values from the settings file's fields (`components/entry/entry-form.tsx:1053`, `initializeState` in `lib/schema.ts:86`), and the save route checks and writes through the same fields (`app/api/[owner]/[repo]/[branch]/files/[path]/route.ts:108-127,161`). A key the fields list is kept.

The catch: a key the fields do not list is dropped on save, by `deepMap` in `lib/schema.ts:25-83`, even when the restored content has it. The test shows this too. So the 4 November loss most likely came from an editor that was working from a settings file without the FAQ (a page opened before the 3 November change reached the CMS). I could not confirm that from the repo; a fixture cannot show which settings file Kirk's browser held.

No fix card is needed for restore itself. A guard against stale settings would be a separate card.
