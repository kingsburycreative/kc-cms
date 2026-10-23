# 17. Strip identity from history and actions for clients

## Objective
A client (`source === "installation"` from `getToken`) never receives commit author emails, GitHub logins, avatars, commit links or workflow run links. The entry history route returns, for clients, only `sha`, `parentSha`, `date`, `authorName` per commit (an email-shaped name becomes the part before "@"); the actions GET routes blank `triggeredByEmail`, `triggeredByGithubUsername`, `triggeredByImage` and `htmlUrl` for clients and refuse `all=1` with 403. KC staff (`source === "user"`) see what they see today. The entry history component renders both shapes.

## Read first
- `D:\Dev\htdocs\kc-cms-app\.claude\project.md` (upstream-merge rules, Never list, `kc/` imports use relative `.ts` paths)
- `D:\Dev\htdocs\kc-cms-app\.claude\work\15-plan-client-experience\plan.md`, card 02: the spec
- `D:\Dev\htdocs\kc-cms-app\kc\branch-lock.ts` and `kc\tests\branch-lock.test.ts`: the shape to match (pure `kc/` function, source-reading route tests)

## Start here
- `app\api\[owner]\[repo]\[branch]\entries\[path]\history\route.ts:31,63-73`: `source` is already in scope; `response.data` from `listCommits` goes out raw. Map it with the redactor when `source === "installation"`.
- `app\api\[owner]\[repo]\[branch]\actions\route.ts:207,220,253-270,308-325`: GET builds rows inline with `triggeredByEmail`, `htmlUrl`, etc.; `listAll` at 220. Refuse `all=1` for clients with `createHttpError(..., 403)`, redact rows for clients. The POST (around 465) returns run data too: redact it for clients.
- `app\api\[owner]\[repo]\[branch]\actions\[runId]\route.ts:20-40` (row serializer), 160 and around 377: redact for clients.
- `types\api.ts:16-28`: `EntryHistoryItem`. Make the GitHub fields optional and add optional `parentSha`, `date`, `authorName`.
- `components\entry\entry-history.tsx:29-35,63,112`: reads `item.commit.author`, builds a github.com avatar URL, links `item.html_url`. Prefer `authorName`/`date` when present; no avatar image and no link when `html_url` is absent (initials fallback stays).
- Suggested: `kc/redact.ts` exporting `redactHistory(commits)`, `redactActionRun(run)` and `nameFromAuthor(name)`.
- Done-test: `node C:\Users\roban\.claude\bin\project-test.cjs kc/tests/redact.test.ts` (check the runner usage if a filtered run takes another form).

## Files you may touch
- `D:\Dev\htdocs\kc-cms-app\kc\redact.ts` (new)
- `D:\Dev\htdocs\kc-cms-app\kc\tests\redact.test.ts` (new)
- `D:\Dev\htdocs\kc-cms-app\types\api.ts`
- `D:\Dev\htdocs\kc-cms-app\app\api\[owner]\[repo]\[branch]\entries\[path]\history\route.ts`
- `D:\Dev\htdocs\kc-cms-app\app\api\[owner]\[repo]\[branch]\actions\route.ts`
- `D:\Dev\htdocs\kc-cms-app\app\api\[owner]\[repo]\[branch]\actions\[runId]\route.ts`
- `D:\Dev\htdocs\kc-cms-app\components\entry\entry-history.tsx`
- `D:\Dev\htdocs\kc-cms-app\.claude\work\17-client-identity-redact\result.md` (new)

`kc/tests/settings-gate.test.ts` and `kc/tests/branch-lock.test.ts` read these route sources; they must still pass unedited. Keep the existing `getToken` / `assertBranchAllowed` lines as they are.

## Done-test
From the plan: `node --test kc/tests/redact.test.ts` passes. The history mapper keeps exactly `sha`, `parentSha`, `date`, `authorName` (card 17's diff needs the parent); an email-shaped author name comes back as the part before "@"; the actions mapper blanks email, GitHub username and run link; a source test per route shows the mapper is applied for `source === "installation"` and `all=1` is refused.

Also `npx tsc --noEmit && npx eslint kc` exit 0. Mutation check, through the runner so it is on record: make the history route return raw `listCommits` data, run the done-test plus `kc/tests/settings-gate.test.ts` and `kc/tests/branch-lock.test.ts`, name the tests that failed, restore, run again green.

## Boundaries
No commit, no push, no install, nothing outward. No real network calls in tests. Never read or print a key or secrets file. The only new user-facing text is one short 403 error for `all=1` in the existing error style; list it in result.md. `project.md`'s Never list applies. Do not run the full suite.

## Report
Write `result.md` beside this file, under 200 words: files changed, tests added, the mutation result naming the tests that failed, and any call made and why. Say what was not done.
