# 34. Delete and rename guards judge the file, not the schema the client names

## Objective
Board card delete-guard-path, from the card 23 audit. Today a client blocked from deleting a single-file entry (say `src/content/home.md`, a schema of `type: file`) can send DELETE with `type=content&name=<some collection>` whose `path` is a prefix of that file, and the guard only looks at the named schema. The same holds for rename. After this card, the delete and rename routes refuse any path that is the `path` of any `type: file` content schema in the config (for clients on delete, for everyone on rename, matching today's rule for named file schemas), whatever `name` says. Media delete uses `isMediaPathAllowed` like upload and rename already do.

## Read first
- `D:\Dev\htdocs\kc-cms-app\.claude\project.md` (risky paths, Never list, relative `.ts` imports in `kc/`)
- `D:\Dev\htdocs\kc-cms-app\.claude\work\31-feature-audit\result.md`
- `D:\Dev\htdocs\kc-cms-app\kc\content-ops.ts` and its test in `kc\tests\`
- `D:\Dev\htdocs\kc-cms-app\kc\media-types.ts`
- `D:\Dev\htdocs\kc-cms-app\app\api\[owner]\[repo]\[branch]\files\[path]\route.ts` (DELETE, around lines 470-530)
- `D:\Dev\htdocs\kc-cms-app\app\api\[owner]\[repo]\[branch]\files\[path]\rename\route.ts` (lines 55-100)
- `lib/schema` helpers (`getSchemaByName`, how `config.object.content` is shaped) and `normalizePath`

## Start here
- Add to `kc/content-ops.ts` a pure function, e.g. `isSingleFilePath(content, normalizedPath)`, true when any content entry with `type === "file"` has a normalized `path` equal to the path. Pure, no `@/` imports, so it is unit-testable.
- Files DELETE, `content` case: after the existing `clientMayDelete` check, also refuse with the same 403 and the same message when `source === "installation"` and `isSingleFilePath(...)` is true. Staff behaviour unchanged.
- Rename, `content` case: refuse (same error as the existing `schema.type === "file"` line) when either the old or new path is a single-file path.
- Files DELETE, `media` case: replace the inline `schema.extensions` check with `isMediaPathAllowed(normalizedPath, schema.extensions)`, same error text.
- Smallest change in the two upstream route files; logic lives in `kc/`.
- Done-test command: `node C:\Users\roban\.claude\bin\project-test.cjs kc/tests/delete-guard-path.test.ts`

## Files you may touch
- `D:\Dev\htdocs\kc-cms-app\kc\content-ops.ts`
- `D:\Dev\htdocs\kc-cms-app\app\api\[owner]\[repo]\[branch]\files\[path]\route.ts` (upstream file, named by the card)
- `D:\Dev\htdocs\kc-cms-app\app\api\[owner]\[repo]\[branch]\files\[path]\rename\route.ts` (upstream file, named by the card)
- `D:\Dev\htdocs\kc-cms-app\kc\tests\delete-guard-path.test.ts` (new)
- `D:\Dev\htdocs\kc-cms-app\.claude\work\34-delete-guard-path\result.md` (new)

## Done-test
`node --test kc/tests/delete-guard-path.test.ts` passes. It shows: `isSingleFilePath` is true for a file schema's path (also with a leading or trailing slash variant if `normalizePath` would equalise them), false for a collection entry under the same folder and for an unrelated path; from the route sources, the DELETE content case calls `isSingleFilePath` gated on installation, the rename content case checks both paths, and the DELETE media case calls `isMediaPathAllowed`. Existing tests unchanged. Also `npx tsc --noEmit && npx eslint kc` exit 0.

Mutation check, through the runner so it is on record: make `isSingleFilePath` always return false, run the done-test command, name the failing tests, restore, run again green. Every run filtered to the one test file; never the full suite.

## Context
- Risky path (`app/api/`). No new client-facing text: reuse existing messages.

## Boundaries
No commit, no push, no install, nothing outward. No real network call in tests. Never read or print a secret or `.env`. `project.md`'s Never list applies.

## Report
Write `result.md` beside this file, under 200 words: files changed, tests added, the mutation result naming the failing tests, and what was not done.
