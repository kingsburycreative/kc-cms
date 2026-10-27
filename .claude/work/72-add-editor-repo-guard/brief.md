# 72. add-editor refuses a repo with no .pages.yml (Risky)

## Objective
scripts/add-editor.mts accepts any repo in the GitHub App installation, including internal ones like kingsburycreative/kc-cms-server, and would invite a client editor to it. After this card it refuses a repo whose default branch has no `.pages.yml` at the root, before it looks up collaborators or sends anything, and prints one line: `Refused: <owner>/<repo> has no .pages.yml, so it is not a CMS site.` A dry run refuses the same way.

## Read first
- D:/Dev/htdocs/kc-cms-app/.claude/project.md (upstream rule, Never list, risky paths)
- scripts/add-editor.mts (whole file: `AddEditorDeps`, `addEditor`, `realDeps`)
- kc/tests/add-editor.test.ts (how deps are faked)

## Start here
- Add a dep, e.g. `hasPagesConfig: (owner: string, repo: string, installationId: number) => Promise<boolean>`, called right after the installation check passes. Throwing counts as false (refuse), never as allowed.
- Real wiring in `realDeps`: use the installation octokit (the App's own credentials, never a user token) to `GET /repos/{owner}/{repo}` for `default_branch`, then `GET /repos/{owner}/{repo}/contents/{path}` for `.pages.yml` at that ref; 404 means false. Fold it into the existing getRepoInstallation if that is simpler, but keep it fakeable in tests.
- Done-test command: `node C:\Users\roban\.claude\bin\project-test.cjs kc/tests/add-editor.test.ts`

## Files you may touch
- `scripts/add-editor.mts`
- `kc/tests/add-editor.test.ts`

## Done-test
In kc/tests/add-editor.test.ts with fake deps: a repo whose config check returns false exits 1 with the refusal line, and no collaborator lookup, insert or email happens; the same with `--dry-run`; a check that throws refuses too; a repo with a config still invites as before. Existing tests still pass (give their fakes `hasPagesConfig` returning true).

Mutation check through the runner: remove the config check, run, name the tests that failed, restore, run green.

## Boundaries
No commit, no push, no install, nothing outward, no network (fixtures only), never run the script against GitHub. The refusal line is operator text printed on the box, not client copy; keep it as written.

## Progress
Keep `progress.md` beside this file from your first step, one line per step that changes a file or finishes a unit of work: done, files, next, anything half-written. Already there? You are resuming: read it and check the disk against it first.

## Report
Write `result.md` beside this file, under 200 words: files changed, tests added, the mutation result naming the tests that failed, and what was not done.
