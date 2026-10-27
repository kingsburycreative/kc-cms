# 77 result: done

New: `kc/save-size.ts` (proxy cap 1 MB, /files/ 25 MB, webhook/multipart/GET/non-api exempt, missing length refused except bodyless DELETE; `checkFilesBody` route check), `kc/save-error.ts` (413 mapper), `kc/tests/save-size.test.ts` (10 tests).

Upstream touched: `proxy.ts` (import `checkRequestSize`, one call before the header copy); files route (import + one line after `request.json()`, before zod, using Content-Length); `components/entry/entry.tsx` and `components/media/media-upload.tsx` (import + `throwIfTooLarge(response, ...)` before `requireApiSuccess`). `lib/api-client.ts` not needed. `kc/tests/short-url-proxy.test.ts` repointed and import list updated. Register entry `save-size-cap` added.

Copy (prose, avoid-ai-writing, humanizer all ran; last two found nothing):
- "This page is too large to save in one go. Your changes are still here. Split it into smaller pages, or contact Kingsbury Creative for help."
- "This file is too large to upload. Try a smaller file."

Mutation: dropped multipart exemption -> "multipart over the cap passes" failed; mapper returned generic -> "the mapper turns a 413 into the friendly message" failed. Restored, green (488 pass). tsc and eslint kc clean.

Call made: bodyless DELETE without Content-Length passes (files DELETE uses query params). Not done: did not scan fixtures for >256 KB content; 1 MB cap kept.
