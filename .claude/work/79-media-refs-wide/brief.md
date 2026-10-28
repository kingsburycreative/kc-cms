# 79. Widen the media-delete guard to every content path and src code (Risky)

## Objective
Card 78's guard only searches the content paths it found, not nested collection subfolders, `type: file` entries, or site code under `src/`, so a client can still delete an image a component imports and break the deploy (Henike site issue 48; Henike's CMS round-trip test hits this within hours). Widen the search and refuse the delete on any hit with the existing 409 and friendly message.

## Read first
- .claude/project.md (Never list, risky paths: this touches app/api/)
- The media-refs-wide entry in kc/BOARD.md (the spec)
- kc/media-refs.ts (`contentScope`, `assertMediaUnused`) and kc/tests/media-refs.test.ts
- `app/api/[owner]/[repo]/[branch]/files/[path]/route.ts`, the media DELETE branch that calls `assertMediaUnused`
- .claude/work/78-media-delete-guard/result.md

## Build
- Scope: every path `.pages.yml` lists, `type: file` entries and collections both, recursive into subfolders; plus text files under `src/`.
- Match: the media input path, the public/output path (with and without leading slash), and relative imports from `src/` files (`import x from "../assets/y.jpg"`, `astro:assets` usage, plain path strings) resolved against the importing file's folder.
- Reads: the same GitHub tree/blob reads the route already uses; one recursive tree call per delete, not one per file. Skip blobs over 1 MB and binary extensions (images, fonts, pdf, video, archives).
- Keep the five-name cap, the 409 and the existing friendly message; no new copy.

## Files you may touch
- `kc/media-refs.ts`
- `kc/tests/media-refs.test.ts`
- `app/api/[owner]/[repo]/[branch]/files/[path]/route.ts` (only if the call's arguments must change; smallest hook, named in result.md)
- `kc/register/customizations.json` (only if the route changes)
- `.claude/work/79-media-refs-wide/result.md`, `progress.md`

## Done-test
Extend `kc/tests/media-refs.test.ts`: a hit in a `type: file` JSON entry; a hit in a nested collection subfolder; a hit from a `src/` import by relative path; a hit by public output path; an unreferenced file still allowed; a blob over 1 MB and a binary file skipped; the loader makes one tree call (mocked fetch, no network).

Mutation check through the runner: stop recursing into subfolders (a test fails); drop the `src/` scan (a test fails); restore both.

At the end, each exit 0 on the final tree:
- `node C:\Users\roban\.claude\bin\project-test.cjs kc/tests/media-refs.test.ts`
- the register test through the same runner
- `npx tsc --noEmit`, `npx eslint kc`

## Boundaries
No commit, no push, no npm install, no package.json edits, no network in tests, no .env.

## Progress
Keep `progress.md` beside this file from your first step, one line per step that changes a file or finishes a unit of work: done, files, next, anything half-written. Already there? You are resuming: read it and check the disk against it first.
