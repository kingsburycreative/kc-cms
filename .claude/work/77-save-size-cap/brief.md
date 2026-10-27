# 77. Cap JSON request size on /api saves (Risky)

## Objective
Blunt zod's memory-exhaustion advisory (GHSA-mrhx-c7xc-m3w5, zod < 4.6.6) without moving off zod 3. The request filter (`proxy.ts`) refuses an oversized non-multipart body under `/api/` with a 413 before any route parses it, and the editor shows a friendly message for that 413. Rob, 2026-10-27: the error a user sees must be friendly, never generic.

## Read first
- .claude/project.md (Never list, Copy rule, risky paths)
- The save-size-cap entry in kc/BOARD.md (the spec; this brief corrects one fact in it, below)
- proxy.ts (it already imports kc/short-url.ts; hook the same way), kc/short-url.ts
- app/api/[owner]/[repo]/[branch]/entries and .../files routes: the JSON error shape they return
- components/entry/entry.tsx, components/entry/entry-form.tsx: where save errors show today
- components/media/media-upload.tsx: uploads are JSON with base64 content, NOT multipart

## The correction (coordinator's call, logged)
The board assumed uploads are multipart. They are JSON base64 (media-upload.tsx:78-89), so a flat 1 MB cap would break image uploads. Do this instead, in a new `kc/save-size.ts`:
- POST/PUT/PATCH/DELETE-with-body under `/api/`, not multipart: cap 1 MB by declared Content-Length; missing Content-Length with a body method is refused.
- Media uploads and content saves share POST `/api/[owner]/[repo]/[branch]/files/[path]` (media sends `type: "media"` in the JSON body), so the proxy cannot tell them apart. Coordinator's call: the proxy caps `/files/` requests at 25 MB (nginx's limit) and everything else under /api at 1 MB. Inside the files route handler (`app/api/[owner]/[repo]/[branch]/files/[path]/route.ts`), before any zod parse, a body whose `type` is not `"media"` and whose length is over 1 MB gets the same 413 (JSON.parse is fine at that size; zod is the risk). Put that check in `kc/save-size.ts` and call it from the route in one line.
- `/api/webhook/github` is exempt (GitHub-signed, payloads can be large).
- Multipart passes untouched. GET/HEAD untouched. Non-/api paths untouched.
- Check the largest real content save first: if any fixture or test content is over 256 KB, raise the 1 MB cap and say why in result.md.
- 413 body is `{ status: "error", message }`, as lib/api-error.ts builds it. Save errors reach the editor through `requireApiSuccess` in lib/api-client.ts, then entry.tsx:423 and media-upload.tsx:104.

## Editor message
A 413 from a save (and from a media upload) shows where save errors already show, through a small mapper in kc (e.g. `kc/save-error.ts`) that the upstream client file calls: the smallest hook. Copy written with the `prose` skill, then `avoid-ai-writing` and `humanizer`, all via the Skill tool. Says the page is too large to save in one go and what to do (split it up, or contact Kingsbury Creative). For uploads: the file is too large, try a smaller one. No "Something went wrong", no status code. Unsaved content stays in the editor. If the Skill tool refuses one of these skills, stop and say so in result.md.

## Files you may touch
- `proxy.ts` (upstream: one import and one call, named in result.md)
- `kc/tests/short-url-proxy.test.ts` (repoint the new `./kc/save-size.ts` import as short-url's is, and add it to the expected import list; its no-session/token/fetch check stays)
- `app/api/[owner]/[repo]/[branch]/files/[path]/route.ts` (upstream: one-line call before the zod parse)
- `lib/api-client.ts` only if the 413 cannot be mapped at entry.tsx:423 / media-upload.tsx:104
- `kc/save-size.ts` (new)
- `kc/save-error.ts` (new)
- `kc/tests/save-size.test.ts` (new)
- `components/entry/entry.tsx` and/or `components/entry/entry-form.tsx` (upstream: smallest hook)
- `components/media/media-upload.tsx` (upstream: smallest hook)
- `kc/register/customizations.json` (claim every upstream file you change, as its other entries do; the register test fails otherwise)
- `.claude/work/77-save-size-cap/result.md`, `progress.md`

## Done-test
New `kc/tests/save-size.test.ts`: over-cap JSON on an entries path refused with 413 and the JSON error shape; missing length refused; under-cap passes; multipart over-cap passes; a 5 MB JSON request on a /files/ path passes the proxy and 30 MB is refused; the route-level check refuses a 2 MB non-media body and passes a 2 MB media body; webhook exempt; GET untouched; non-/api path untouched; the mapper turns a 413 into the friendly message, not the generic one.

Mutation check through the runner: drop the multipart exemption (a test fails), then make the mapper return the generic message (a test fails); restore both.

At the end, each exit 0 on the final tree:
- `node D:\Dev\htdocs\kc-cms-app\.claude\bin\project-test.cjs kc/tests/save-size.test.ts`
- `node D:\Dev\htdocs\kc-cms-app\.claude\bin\project-test.cjs kc/tests/customizations.test.ts` or whichever file tests the register
- `npx tsc --noEmit`, `npx eslint kc`

## Boundaries
No commit, no push, no npm install, no package.json edits, no network in tests, no .env. result.md lists each piece of copy written and each upstream file touched.

## Progress
Keep `progress.md` beside this file from your first step, one line per step that changes a file or finishes a unit of work: done, files, next, anything half-written. Already there? You are resuming: read it and check the disk against it first.
