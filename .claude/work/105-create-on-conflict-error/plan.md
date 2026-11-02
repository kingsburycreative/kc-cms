# Plan: create stops on a duplicate file name

One Normal card queued by the PM, 2026-11-02.

## What I found

- A new file is posted without a sha. On a GitHub 422 the route reads `options.onConflict`, which defaults to "rename" and numbers the file. Henike's French posts, named from an English-post reference, became `deck-permit-ottawa-1.md` and Henike's build threw.
- The route already handles `onConflict: "error"` (`route.ts:56`, `:375-377`, a 409) and `components/folder-create.tsx` sends it. The entry editor (`components/entry/entry.tsx`) never does and the schema has no way to ask. So no `app/api/` change: Normal, not Risky.
- `requireApiSuccess` throws only the server's message, so the editor must swap in the clear message on a 409.
- Tests cannot import `@/` aliases, so the schema piece and the body helper live in `kc/create-conflict.ts`.

## Cards

### 105. Collection option: stop on a duplicate file name (Normal)
- Role: implementer (Sonnet)
- Risky path: no
- Files: `kc/create-conflict.ts`, `kc/tests/create-conflict.test.ts`, `lib/config-schema.ts`, `components/entry/entry.tsx`, `kc/register/customizations.json`
- Option: `create: { onConflict: rename | error }` on a collection, default rename.
- Done-test: `node --test kc/tests/create-conflict.test.ts`. The option parses; a create with it set sends onConflict "error"; without it the body is unchanged; saving an existing entry never sends it.
