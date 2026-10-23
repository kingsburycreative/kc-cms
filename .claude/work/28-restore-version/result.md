# 28 result

Files changed: kc/history/restore.ts (new), kc/tests/history-restore.test.ts (new), kc/history/history-view.tsx, components/entry/entry.tsx.

Tests added: 5 in history-restore.test.ts (restoreState keeps current sha, param accepts hex, param rejects bad values, entry.tsx source test incl. save body `sha: sha`, history link has ?restore=). tsc and eslint kc exit 0.

Mutation: restoreState returned old.sha -> "restoreState keeps the current sha and returns the old content" failed; restored, green again.

Copy (prose, avoid-ai-writing, humanizer, avoid-ai-design all invoked; no changes needed):
- Link: "Restore this version" (plain underlined link, no button pair)
- Note above the form: "This is an older version. Save to keep it as your latest edit." (small bordered paragraph)

Calls: the old version is fetched with the existing entries route plus `&ref=<sha>`; the restored values replace the entry content and mark the form changed so Save enables. Link goes to /collection/<name>/edit/<path> for collections, /file/<name> for files.

Not done: no browser check (headless). The runner ignored the file filter and ran all 191 tests, all passing. Not verified that EntryForm re-initialises on contentObject change; check in a browser.
