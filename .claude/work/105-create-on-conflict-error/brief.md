# 105. Collection option: stop on a duplicate file name (Normal)

## Objective
A collection in `.pages.yml` can say `create: { onConflict: error }`. Creating an entry in it whose file name already exists then stops with "A file with this name already exists. Open the existing entry to change it." and nothing is written. Without the option nothing changes: the server still numbers the file (`-1`, `-2`). Why: Henike's French posts are named from an English-post reference, so a duplicate became `deck-permit-ottawa-1.md`, Henike's build threw, and the client's post silently never appeared.

## Read first
- D:\Dev\htdocs\kc-cms-app\CLAUDE.md and D:\Dev\htdocs\kc-cms-app\.claude\project.md (relative `.ts` imports in `kc/`, upstream-file rule, Never list)
- C:/Users/roban/.claude/pm/traps.md
- D:\Dev\htdocs\kc-cms-app\.claude\work\103-schema-stem-token\brief.md (layout of a small upstream hook into `kc/`)
- D:\Dev\htdocs\kc-cms-app\kc\tests\interpolate-stem.test.ts (test style: zod and file-as-text assertions)

## Context
Size call, from the code: the route already supports this. `app/api/[owner]/[repo]/[branch]/files/[path]/route.ts:56` reads `data.onConflict === "error"` and `:375-377` throws a 409 `File "<path>" already exists.` for a new file (no sha) on a GitHub 422. `components/folder-create.tsx:70` already sends it. Only the entry editor never sends it and the schema has no way to ask. So `app/api/` is NOT touched, which makes this Normal, not Risky. If you find the route must change after all, stop, say so in result.md and do not edit it.

Option name, chosen to match the fork's schema (`commit: { templates, identity }` is a nested object per concern): `create: { onConflict: rename | error }` on a collection, default `rename`. Document this exact shape in result.md. Copy shown to clients (the message above) goes through the `prose` skill, then `avoid-ai-writing` and `humanizer` (project.md Copy rule); list it in result.md.

## Start here
Read by the briefer, not run yet.
- `components/entry/entry.tsx:127-143` gets `schema` via `getSchemaByName`. `:343-355` builds `savePath` for a new entry (`!path`). `:390-401` is the POST body to change: add `onConflict: "error"` only when `!path`, `schemaType === "collection"` and the option is `error`. After `fetch`, before `requireApiSuccess` (`:403`, `lib/api-client.ts` throws only `payload.message`): when `onConflict` was sent and `response.status === 409`, throw `new Error(<the message>)` so the toast shows it. Saving an existing entry (path set, has sha) never sends it.
- `lib/config-schema.ts:702-722` is the collection object schema (`subfolders`, `fields`, `commit`). Add `create: CreateSchema.optional()` there (the file already imports `@/kc/client-view` at line 9; do the same for the new module). Check line 833 and other collection-shaped schemas; only collections get it. Zod strips unknown keys, so without this the option never reaches the client.
- New pure `kc/create-conflict.ts` (relative imports only, loadable by the test runner): `CreateSchema` = `z.object({ onConflict: z.enum(["rename","error"], {message: "'onConflict' must be either 'rename' or 'error'."}).optional() }).strict()`; `createConflictMode(schema)` returning `"error"` or `"rename"` (anything missing or odd is `"rename"`); `CREATE_CONFLICT_MESSAGE`; `createRequestBody(...)` or equivalent pure helper that builds the extra body fields, so the test can assert what the entry editor sends without rendering React.
- Add one entry to `kc/register/customizations.json` claiming `lib/config-schema.ts` and `components/entry/entry.tsx` (the 103 entry is the pattern; the coordinator may add it instead, say which).
- Add a line for 105 to `kc/BOARD.md` next to 103/104 (coordinator's step; skip if the coordinator does it).
- Done-test command: `node C:\Users\roban\.claude\bin\project-test.cjs kc/tests/create-conflict.test.ts`

## Files you may touch
- `kc/create-conflict.ts` (new)
- `kc/tests/create-conflict.test.ts` (new)
- `lib/config-schema.ts` (upstream: import plus the one `create` key on the collection schema)
- `components/entry/entry.tsx` (upstream: the POST body and the 409 message only)
- `kc/register/customizations.json` (one entry)
- Any test under `kc/tests` that snapshots the collection schema keys (grep first; list changes in result.md)

## Done-test
`kc/tests/create-conflict.test.ts` asserts:
- `CreateSchema` parses `{onConflict: "error"}`, `{onConflict: "rename"}` and `{}`; rejects `{onConflict: "skip"}` and an unknown key.
- A collection schema with `create: {onConflict: "error"}` gives mode `error`; with no `create`, with `create: {}` and with a junk value gives `rename`.
- A create (no path) with mode `error` produces a body containing `onConflict: "error"`; a create without the option produces a body with no `onConflict` key (behaviour unchanged); saving an existing entry (path set) never includes it, even with mode `error`.
- Read as text: `components/entry/entry.tsx` uses the helper and `lib/config-schema.ts` has `create` on the collection schema; the route file is unchanged in what it reads (`data.onConflict === "error"` still present).
- The 409 message equals "A file with this name already exists. Open the existing entry to change it."
Then the mutation check through the runner (`node C:\Users\roban\.claude\bin\project-test.cjs`): make the helper always send `error`, then make it never send it, run the filtered command each time, name the tests that failed, restore, run green. Run `npx tsc --noEmit` and `npx eslint kc` once at the end. Never run the full suite.

## Boundaries
No commit, no push, no install, nothing outward. Do not touch `app/api/`, `package.json` or `db/migrations/`. No real network. `.claude/project.md` Never list applies. The only UI is one toast message; no screenshots. Not seen in a browser: say so in result.md.

## Progress
Keep `progress.md` beside this file from your first step, one line per step that changes a file or finishes a unit of work: done, files, next, anything half-written. Already there? You are resuming: read it and check the disk against it first.

## Report
Write `result.md` beside this file, under 200 words: files changed, tests added, the mutation result naming the tests that failed, the option name and shape, the copy written, and any call made and why. Say what was not done.
