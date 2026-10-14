# 07 result

Files changed: components/document-title.tsx, contexts/config-context.tsx (one export, useOptionalConfig), kc/client-view.ts (documentTitleFor), kc/tests/client-view.test.ts.

Test added: "tab title is the dashboard name for a client inside a repo only" (client with kc.client, client with repo-name fallback, GitHub user, no config for both user kinds).

Mutation: dropped the `isClient` check in documentTitleFor. The new test failed (only that one). Restored; full suite green (47 pass, 0 fail). tsc and eslint exit 0.

Call made: the helper returns `string | null` (null means use formatDocumentTitle), so formatDocumentTitle stays in the component. It takes a structural `{ repo, object? }` config so it imports nothing.

Not done: nothing outstanding. (checklist.json was already modified before I started; untouched by me.)
