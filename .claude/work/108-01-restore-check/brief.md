# 108.01. Would restore have recovered Henike's wiped FAQ? (job: code)

## Objective
A test over a fixture of the real Henike case says whether opening the old version in History and saving it gets the wiped FAQ back, and `.claude/work/108-01-restore-check/finding.md` says so in plain words. This card finds out; it does not fix restore (that is plan card 02).

## Read first
- `CLAUDE.md` and `.claude/project.md` (upstream-file rule, Never list)
- `.claude/work/108-help-guide-plan/plan.md` card 01 and 02
- `kc/history/restore.ts`, `kc/history/history-view.tsx`, `kc/tests/history-restore.test.ts`
- The entry save path: `components/entry/entry.tsx`, `components/entry/entry-form.tsx` and whatever turns form values into file content (`lib/serialization*`, `lib/schema*`). Find out whether a field missing from the `.pages.yml` schema is dropped on save even when the restored content has it.
- The real case: `git -C D:/Dev/htdocs/henike-contracting show 98ce106` (Kirk's save of `src/content/en/pages/services.json` that dropped the FAQ) and `98ce106^` for the before version, plus that repo's `.pages.yml` entry for services. Read only; never commit there.

## Files you may touch
- `kc/tests/restore-wiped-field.test.ts` (new)
- `kc/tests/fixtures/henike-services-before.json` (new, trimmed copy)
- `kc/tests/fixtures/henike-services-after.json` (new, trimmed copy)
- `kc/tests/fixtures/henike-services-pages.yml` (new, trimmed copy of the services schema, if the test needs it)
- `.claude/work/108-01-restore-check/finding.md` (new)
- `.claude/work/108-01-restore-check/result.md`, `.claude/work/108-01-restore-check/progress.md`

No other file. If the answer needs a helper in `kc/`, stop and say so in result.md instead of adding one.

## Done-test
`node --test kc/tests/restore-wiped-field.test.ts` passes, and finding.md's first line is exactly `Result: restores` or `Result: does not restore`, followed by a few plain sentences saying why (which function keeps or drops the field, with file:line). The test asserts whichever is true; "does not restore" is a recorded finding, not a failure.

## Mutation check
Run through the shared runner: break the behaviour the test pins (e.g. flip what the test expects the restore/save path to keep) so `node C:/Users/roban/.claude/bin/project-test.cjs` goes red naming the new test, then restore it and run green. Name the failing test in result.md.

## Rules
- Fixtures only, no network. Trim the fixtures to what shows the case; no personal data beyond the public page text.
- Do not commit. Keep `progress.md` beside this brief, updated after each step.
- Write `result.md`: the finding in one line, files touched, the done-test output summary, the mutation check.
