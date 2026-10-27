# 76. Claim CHANGELOG-KC.md in the customizations register (Small)

## Objective
Main's suite is red: `kc/tests/register-customizations.test.ts` fails with "unclaimed: CHANGELOG-KC.md", because PR 79 (release version) added that file after the register was written. Claim it in the existing `release-version` entry.

## Read first
- .claude/project.md (upstream rule, Never list)
- kc/register/customizations.json, entry `release-version`
- kc/tests/register-customizations.test.ts

## Files you may touch
- `kc/register/customizations.json`

## What to build
Add `"CHANGELOG-KC.md"` to the `files` array of the `release-version` entry. Nothing else changes. If the test then reports any other unclaimed file, stop and name it in result.md instead of claiming it.

## Done-test
`node --test kc/tests/register-customizations.test.ts` passes, run through `node C:\Users\roban\.claude\bin\project-test.cjs` (see earlier result.md files under .claude/work for how the runner takes a file). Do not run the full suite; the loop does.

Mutation check through the runner: run the test once before the edit (red, naming CHANGELOG-KC.md), then after (green). That red-then-green pair is the evidence.

## Progress
Keep `.claude/work/76-register-changelog/progress.md` after each step. Write result.md beside this brief. Do not commit.
