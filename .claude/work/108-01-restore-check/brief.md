# 108.01. Would restore have recovered Henike's wiped FAQ (job: code)

## Objective
Find out, with a test over a fixture of the real Henike case, whether opening the old version of the Services page in History and restoring it (then saving through the editor) gets the wiped FAQ back. Write the answer in plain words to `.claude/work/108-01-restore-check/finding.md`. This card finds out; it does not fix. A "does not restore" answer is a recorded finding, not a failure (card 02 in the plan fixes it).

## Read first
- `D:\Dev\htdocs\kc-cms-app\.claude\project.md` (Never list, upstream-file rule, test command)
- `C:\Users\roban\.claude\pm\traps.md`
- `D:\Dev\htdocs\kc-cms-app\.claude\work\108-help-guide-plan\plan.md` card 01
- `kc/history/restore.ts`, `kc/history/history-view.tsx`, `kc/tests/history-restore.test.ts` (test style)
- The entry save path: `components/entry/entry.tsx` save handler, `components/entry/entry-form.tsx`, and wherever form values are built from the `.pages.yml` schema (`lib/schema.ts` and kin): is a key missing from the schema dropped on save even when the loaded content has it?

## Context
- The real case: commit `98ce106` in `D:\Dev\htdocs\henike-contracting` (Kirk Henike, 2026-11-04, "Update src/content/en/pages/services.json (via KC CMS)") dropped 154 lines, the FAQ, from `src/content/en/pages/services.json`. Before = `git -C D:\Dev\htdocs\henike-contracting show 98ce106~1:src/content/en/pages/services.json`; after = `show 98ce106:...`. Read Henike's `.pages.yml` at `98ce106` to see whether the FAQ field is in the schema.
- Fixtures are trimmed copies (keep the FAQ and a couple of other keys; no client email addresses or phone numbers). No network in tests; read-only git on the Henike repo while writing fixtures only.

## Files you may touch
- `kc/tests/restore-wiped-field.test.ts` (new)
- `kc/tests/fixtures/henike-services-before.json` (new)
- `kc/tests/fixtures/henike-services-after.json` (new)
- `kc/tests/fixtures/henike-pages.yml` (new, trimmed, only if the test needs the schema)
- `.claude/work/108-01-restore-check/finding.md` (new)
- `.claude/work/108-01-restore-check/result.md` and `progress.md`

No change to any app code. If a helper seems needed, put it inside the test file.

## Done-test
`node --test --test-reporter=tap kc/tests/restore-wiped-field.test.ts` passes, and `finding.md`'s first line is exactly `Result: restores` or `Result: does not restore`, followed by a few plain sentences on why (which function keeps or drops the FAQ, with file:line). The test asserts whichever is true, using the real restore and schema functions, not copies of them. Mutation check: break the assertion's key condition on purpose, run through `node C:\Users\roban\.claude\bin\project-test.cjs`, see it fail, restore it, see it pass; name the test that failed in result.md.

## Progress
Keep `progress.md` beside this brief after every step: done so far, files touched, next step.

Secrets: never run a command or read a file that prints a secret value; values move file-to-file or pipe-to-pipe only (secret-put.cjs, secret-to-file.cjs).
