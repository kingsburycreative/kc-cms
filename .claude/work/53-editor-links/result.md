# 53 result

Files changed: entry.tsx, entry-history.tsx, collection.tsx, media-view.tsx, empty-create.tsx, file and image edit-component.tsx, settings/page.tsx, [branch]/layout.tsx (line 74 only), [repo]/page.tsx. Every `/${owner}/${repo}...` page link (Link href, router.push/replace, redirect, href variables) is wrapped in `shortHref(...)`, with one `@/kc/short-url` import per file. `/api/`, github.com strings untouched (12 `/api/` literals, same before and after).

Test added: kc/tests/short-href-editor.test.ts (3 tests: every page link wrapped, import present, /api/ count 12). It failed on the untouched files first.

Mutation: unwrapped one `router.push` in entry.tsx and one settings href in collection.tsx. Failed: "every in-app page link template is wrapped in shortHref". Restored, green (367 pass). `npx tsc --noEmit && npx eslint kc` exit 0.

Calls: used the project runner (.claude/bin/project-test.cjs), not the global path in the brief. The runner runs the whole suite whatever the filter. The two links with no branch (`/${owner}/${repo}` in layout and page) are wrapped as the test rule requires; shortHref returns them unchanged.

Not done: nothing.
