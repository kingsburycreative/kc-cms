# 20. Clients cannot delete single-file entries

## Objective
A client (installation token) must not delete a content entry whose schema is `type: file` (a single-file entry such as a home page or settings-like file). Collection entries and media stay deletable for clients; every delete with a GitHub user token is allowed as before. New `kc/content-ops.ts` exports `clientMayDelete({ source, schemaType })` (`source` is `getToken`'s `"installation" | "user"` or similar; read `lib/token.ts` for the real values): false only for installation + `"file"`, true otherwise. The server enforces it; the UI hides the delete action to match.

## Read first
- `D:\Dev\htdocs\kc-cms-app\.claude\project.md` (upstream-merge rules, Never list, `kc/` imports use relative `.ts` paths)
- `D:\Dev\htdocs\kc-cms-app\.claude\work\15-plan-client-experience\plan.md`, card 10
- `D:\Dev\htdocs\kc-cms-app\kc\branch-lock.ts` and `kc\tests\branch-lock.test.ts`: how earlier cards hooked a route and wrote source tests
- `D:\Dev\htdocs\kc-cms-app\kc\client-view.ts` and `components\settings\identities.tsx`: how the client side tells a client (no GitHub identity, `useUser()` + `hasGithubIdentity`)

## Start here
- `app\api\[owner]\[repo]\[branch]\files\[path]\route.ts`, `DELETE` at line 451: after the content schema is resolved in the `switch (type)` `content` case, call `clientMayDelete({ source, schemaType: schema.type })` and throw `createHttpError(..., 403)` when false. Smallest edit.
- `components\entry\entry.tsx:138`: `canDelete = operations.delete` becomes `operations.delete && clientMayDelete(...)` with the client derived as identities.tsx does (client = no GitHub identity).

## Files you may touch
- `D:\Dev\htdocs\kc-cms-app\kc\content-ops.ts` (new)
- `D:\Dev\htdocs\kc-cms-app\kc\tests\content-ops.test.ts` (new)
- `D:\Dev\htdocs\kc-cms-app\components\entry\entry.tsx`
- `D:\Dev\htdocs\kc-cms-app\app\api\[owner]\[repo]\[branch]\files\[path]\route.ts`
- `D:\Dev\htdocs\kc-cms-app\.claude\work\20-client-no-delete-file\result.md` (new)

## Done-test
`node --test kc/tests/content-ops.test.ts` passes, run through `node C:\Users\roban\.claude\bin\project-test.cjs` with that file. `clientMayDelete` refuses installation + `file`, allows installation + `collection`, allows installation for media (no schema type or media), allows user token + `file`; a source test shows the route's DELETE handler calls `clientMayDelete` after `getSchemaByName` and before the GitHub delete call, and `entry.tsx` folds it into `canDelete`.

Also `npx tsc --noEmit && npx eslint kc` exit 0. Mutation check, through the runner so it is on record: remove the route call, run the done-test, name the tests that failed, restore, run again green.

## Boundaries
No commit, no push, no install, nothing outward. No real network calls in tests. Never read or print a key or secrets file. The 403 message is client-facing copy: write it with the `prose` skill, then run `avoid-ai-writing` and `humanizer` (Skill tool); if the Skill tool refuses, stop and say so in result.md. Smallest edit in each upstream file. Do not run the full suite.

## Report
Write `result.md` beside this file, under 200 words: files changed, tests added, the mutation result naming the tests that failed, the copy written, any call made and why, and what was not done.
