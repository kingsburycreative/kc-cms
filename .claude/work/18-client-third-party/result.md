# 18 result

Files changed: kc/client-view.ts (githubLinks flag), kc/avatar.ts (new, initialFor), components/user.tsx, components/file/file-options.tsx, fields/core/image/edit-component.tsx, fields/core/file/edit-component.tsx, components/entry/entry-history.tsx, components/actions/actions-page.tsx.

Tests added: kc/tests/avatar.test.ts (3 tests); client-view.test.ts gained the flag test and a source test over the components (no unavatar.io, each reads githubLinks, user.tsx uses initialFor).

Mutation: viewFor returning githubLinks true for a client failed "github links are for GitHub users only" (1 fail). Restored, green (135 pass). tsc and eslint kc exit 0.

Calls made:
- initialFor returns "" when name and email are both empty, so it never returns "U".
- Actions hover card no longer falls back to triggeredByImage, since that could be a third-party URL.
- A client sees commit entries as plain rows, not links.
- Runner ran the whole kc suite despite file args (135 tests, all pass).
- Used the project runner path, not C:\Users\roban\.claude\bin.

New user-facing copy: none. Not done: repo-dropdown untouched as briefed.
