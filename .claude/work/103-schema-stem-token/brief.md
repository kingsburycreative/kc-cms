# 103. Stem token for interpolate (Risky)

## Objective
`interpolate()` understands a `{stem}` token: the entry's file name without its extension. A reference field whose value is `{stem}` over an entry `deck-permit-ottawa.md` yields `deck-permit-ottawa`. Why: Henike's French posts must pair with English posts by identical file name, via a reference field on `posts-fr` that drives filename `{fields.english}.md`. The filename generator slugifies, so a reference cannot give a bare slug today. Existing tokens must not change.

## Read first
- D:\Dev\htdocs\kc-cms-app\CLAUDE.md and D:\Dev\htdocs\kc-cms-app\.claude\project.md (risky paths, Never list, relative `.ts` imports in `kc/`, upstream-clean rule)
- C:/Users/roban/.claude/pm/traps.md
- D:\Dev\htdocs\kc-cms-app\kc\tests\auth-ip.test.ts (test style)

## Start here
Read by the briefer, not run yet.
- `D:\Dev\htdocs\kc-cms-app\lib\schema.ts:335-366`: `safeAccess` (335) and `interpolate` (353). Tokens are looked up with `safeAccess(data, token)`, then `safeAccess(data, "fields." + token)` when a `prefixFallback` is given. Escaped braces are restored at the end.
- `D:\Dev\htdocs\kc-cms-app\app\api\[owner]\[repo]\[branch]\references\[name]\route.ts:80-92` calls `interpolate(valueTemplate, item, "fields")`. Items come from `parseReferenceItems` (lines 141-189) as `{name, path, primary, fields}`, where `name` is the file name with extension (`deck-permit-ottawa.md`).
- Other caller: `components/entry/entry-form.tsx:146` passes `{index, fields}` with no `name`, so `{stem}` there yields an empty string like any missing token.
- `lib/schema.ts` imports `@/fields/registry`, so a test under `kc/tests` cannot load it. Plan: move `safeAccess` and `interpolate` unchanged into new `kc/interpolate.ts` (relative imports only), add the `stem` rule there, and make `lib/schema.ts` import both from `../kc/interpolate` and keep exporting `interpolate` from its existing export block (line ~468). If `safeAccess` is used elsewhere in `lib/schema.ts`, keep it available there. If you find a smaller hook that still lets the test run the real code, take it and say so in result.md.
- Stem rule: take `data.name` (string), else the last segment of `data.path`; remove only the final `.ext` (`a.b.md` gives `a.b`; a name with no dot, or a leading-dot name like `.pages`, stays whole). A real field called `stem` must not be shadowed by accident: decide, test and state which wins (recommended: the built-in stem applies only when `data.stem` is undefined).
- Done-test command: `node C:\Users\roban\.claude\bin\project-test.cjs kc/tests/interpolate-stem.test.ts`

## Files you may touch
- `kc/interpolate.ts` (new)
- `lib/schema.ts` (upstream: only remove the two moved functions and add the import; nothing else)
- `kc/tests/interpolate-stem.test.ts` (new)
- Any test under `kc/tests` that imports `interpolate` from `lib/schema` (grep first; list changes in result.md)

## Done-test
`kc/tests/interpolate-stem.test.ts` asserts, with fixture items shaped like `parseReferenceItems` output:
- `interpolate("{stem}", {name: "deck-permit-ottawa.md", path: "src/content/posts/deck-permit-ottawa.md", fields: {}}, "fields")` is `deck-permit-ottawa`.
- Multi-dot name, no-dot name, missing name with a path, and no name or path (empty string).
- Unchanged: `{path}`, `{name}` (keeps `.md`), `{primary}`, `{fields.title}`, bare `{title}` via the fallback, escaped braces, a missing token gives an empty string.
- `lib/schema.ts` still exports `interpolate` and the route still imports it from `@/lib/schema` (read the files as text and assert).
Then the mutation check through the runner (`node C:\Users\roban\.claude\bin\project-test.cjs`): break the stem rule (keep the extension), then break the `{name}` path, run the filtered command each time, name the tests that failed, restore, run green. Run `npx tsc --noEmit` once at the end. Never run the full suite.

## Boundaries
No commit, no push, no install, nothing outward. No `package.json` or migration edits. Do not touch `app/api/`; the route already calls `interpolate`. `.claude/project.md` Never list applies. Not UI, so no screenshots or copy skills. A `security-auditor` pass follows this card (the PM runs it).

## Progress
Keep `progress.md` beside this file from your first step, one line per step that changes a file or finishes a unit of work: done, files, next, anything half-written. Already there? You are resuming: read it and check the disk against it first.

## Report
Write `result.md` beside this file, under 200 words: files changed, tests added, the mutation result naming the tests that failed, the calls made (where `interpolate` lives, who wins on a `stem` field). Say what was not done.
