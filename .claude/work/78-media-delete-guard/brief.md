# 78. Refuse deleting a media file content still uses (Risky)

## Objective
Deleting a media file in the CMS never checks whether content uses it, so a client can delete an image a page imports and break the next deploy (Henike site issue 48). Before the media DELETE, find content files that reference the file and refuse with a 409 listing up to five of them; the editor shows a friendly message.

## Read first
- .claude/project.md (Never list, Copy rule, risky paths: this touches app/api/)
- The media-delete-guard entry in kc/BOARD.md (the spec)
- `app/api/[owner]/[repo]/[branch]/files/[path]/route.ts`, the DELETE handler, media branch (about lines 518-528)
- lib/github-cache-file.ts (the content cache) and how the entries routes read content; reuse one of them, no new network shape
- lib/api-error.ts (`createHttpError`, the `{ status: "error", message }` shape)
- components/media/: where a delete error shows today; kc/save-error.ts (card 77's mapper, follow its pattern)

## Build
- New `kc/media-refs.ts`: pure finder taking the deleted path, the media config (`input`, `output`) and a list of `{ path, content }` files; returns referencing paths. Match the input path and the public/output path form (and the form with or without a leading slash). Decide how references in non-content files (src code) are treated, keep the decision consistent, and say it in result.md.
- A loader in kc that gathers content files using the existing cache or the entries routes' GitHub reads, and a one-call hook in the route's media branch: on references, `createHttpError(<message>, 409)` with up to five paths (file list in the JSON error the way other file errors carry data, or in the message; say which).
- Editor: map the 409 to a friendly message where media errors already show, via a kc mapper (extend kc/save-error.ts or a new kc file). Copy via the Skill tool: `prose`, then `avoid-ai-writing`, then `humanizer`. Says the file is still used on these pages and to remove it there first. No generic error, no status code. If the Skill tool refuses one, stop and say so in result.md.

## Files you may touch
- `app/api/[owner]/[repo]/[branch]/files/[path]/route.ts` (upstream: smallest hook, named in result.md)
- `kc/media-refs.ts` (new), `kc/save-error.ts` or a new kc mapper file
- components/media/ files that show a delete error (upstream: smallest hook)
- `lib/api-client.ts` only if the 409's file list cannot reach the editor otherwise
- `kc/tests/media-refs.test.ts` (new)
- `kc/register/customizations.json` (claim every upstream file changed)
- `.claude/work/78-media-delete-guard/result.md`, `progress.md`

## Done-test
New `kc/tests/media-refs.test.ts`: referenced by input path found; referenced by output path found; unreferenced allowed; reference in a non-content file handled as decided; more than five refs capped at five; the mapper turns the 409 into the friendly message, not the generic one.

Mutation check through the runner: make the finder return no references (a test fails), then make the mapper return the generic message (a test fails); restore both.

At the end, each exit 0 on the final tree:
- `node D:\Dev\htdocs\kc-cms-app\.claude\bin\project-test.cjs kc/tests/media-refs.test.ts`
- the register test file through the same runner
- `npx tsc --noEmit`, `npx eslint kc`

## Boundaries
No commit, no push, no npm install, no package.json edits, no network in tests, no .env. result.md lists each piece of copy written and each upstream file touched.

## Progress
Keep `progress.md` beside this file from your first step, one line per step that changes a file or finishes a unit of work: done, files, next, anything half-written. Already there? You are resuming: read it and check the disk against it first.
