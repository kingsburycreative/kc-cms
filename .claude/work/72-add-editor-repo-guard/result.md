# 72 result

Files changed: `scripts/add-editor.mts`, `kc/tests/add-editor.test.ts`.

- New dep `hasPagesConfig(owner, repo, installationId)`, called right after the installation check and before the collaborator lookup, user lookup, dry-run branch or any send. A false result or a throw returns code 1 with `Refused: <owner>/<repo> has no .pages.yml, so it is not a CMS site.`
- `realDeps`: installation octokit (App credentials) reads `default_branch`, then `GET contents/.pages.yml` at that ref; 404 is false, any other error throws (and so refuses).
- Tests added (4): config false / throws, each with and without `--dry-run`; each asserts exit 1, the exact line, no collaborator or user lookup, no rows, no email. Existing fakes default `hasPagesConfig` to true; the old invite/added tests still pass.

Mutation: disabled the refusal (`&& false`). Failed: "a repo whose config check is false is refused", "... is false is refused on a dry run", "... throws is refused", "... throws is refused on a dry run". Restored, green (469 pass).

Note: the runner ran the full suite (469 tests) despite the file arg. Not done: no security-auditor pass (coordinator's call).
