# 112 result (round 2)

Round 1 is kept. Round 2 changes:
- `lib/collaborator-access.ts`: every email lookup compares `emailKeySql(column)` with `normaliseEmail(address)`. Gmail and googlemail addresses match with or without dots and `+tag`; other addresses keep their dots. `emailKeySql` is in `kc/email-normalise.ts`.
- `entry.tsx`: polls `.pages.yml?meta=1` on focus and every minute. When the sha changes it parses the new config, calls `setConfig` and remounts the form, keeping typed values.
- Fields both sides changed get an inline note through `form.setError` (new `markedFields` prop in `entry-form.tsx`).
- `kc/stale-sync.ts`: new `configChanged` and `reloadedConfig`.

Tests: new `kc/tests/invite-gmail.test.ts`; 3 cases added to `stale-sync.test.ts`. Full suite 916/916, tsc and eslint clean.

Mutations:
- Removed dot-stripping in `emailKeySql`: "a stored Gmail invite matches…" failed.
- Made `configChanged` always true: "the field list reloads only when…" failed.
Both restored, green.

Copy: prose, then avoid-ai-writing and humanizer, all invoked. The last two found nothing to change. Final strings: banner, conflict toast, new per-field note `CONFLICT_FIELD_NOTE`, `SAVE_RETRY_FAILED`. "Load the latest" and `SIGNED_OUT` kept as they were.

Call: the config URL comes from `entryApiUrl`, because `short-href-editor.test` caps `/api/` literals.

Not done: no frames captured.
