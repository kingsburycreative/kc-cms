# 20. Result

Files changed:
- `kc/content-ops.ts` (new): `clientMayDelete({ source, schemaType })`, false only for installation + `file`. Reuses `TokenSource` from `branch-lock.ts`.
- `app/api/[owner]/[repo]/[branch]/files/[path]/route.ts`: DELETE, content case, 403 after the schema's own delete check.
- `components/entry/entry.tsx`: `canDelete` folds in `clientMayDelete`, client = `!hasGithubIdentity(user)` via `useUser()`.

Tests added (`kc/tests/content-ops.test.ts`): file refused for installation; collection, media and no-type allowed; user + file allowed; route source order (getSchemaByName < gate < deleteFile); entry.tsx canDelete source match.

Done-test 145 pass. `tsc --noEmit` and `eslint kc` exit 0.

Mutation: removed the route gate; "DELETE checks clientMayDelete after the schema lookup and before the GitHub delete" failed (1 fail). Restored, green.

Copy (403): "This page can't be deleted. Ask Kingsbury Creative if it needs to go." Ran prose, avoid-ai-writing and humanizer; all clean, model-only.

Call: the UI treats "no GitHub identity" as client, matching identities.tsx; server uses the real token source. Not done: nothing outstanding.
