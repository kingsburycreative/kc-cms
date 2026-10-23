# 17 result

Files: new `kc/redact.ts` (`nameFromAuthor`, `redactHistory`, `redactActionRun`, `forSource`), new `kc/tests/redact.test.ts`; edited `types/api.ts`, history route, actions route, actions `[runId]` route, `components/entry/entry-history.tsx`.

Tests added (6): history mapper keeps sha/parentSha/date/authorName; email name trimmed at "@"; action run blanks email, username, image, htmlUrl (staff untouched); source tests for history route, actions list (403 on `all=1` + both row maps wrapped), and `[runId]` (every `toSummary` wrapped).

Mutation: history route set back to raw `response.data`; failed "the history route redacts for clients"; restored, 130/130 green. tsc and `eslint kc` clean.

Note: the runner appends args to the glob, so every run was the full suite.

Calls:
- `[runId]` GET: moved its existing `getToken`/`assertBranchAllowed` pair (text unchanged) out of the `status !== "completed"` block so `source` is known for completed runs too. Costs one token lookup per completed-run fetch.
- Actions POST routes return only `{ id }`, nothing to redact.
- Client `triggeredByName` also goes through `nameFromAuthor`.

New copy: 403 "Only Kingsbury Creative can see the full list of site actions." (coordinator replaced the worker draft after prose, avoid-ai-writing and humanizer).
