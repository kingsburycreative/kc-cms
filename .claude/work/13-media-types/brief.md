# 13. Media uploads limited to safe types when the config names none

## Objective
When a media config sets no `extensions` (missing or empty), uploading or renaming a media file accepts only `jpg`, `jpeg`, `png`, `webp`, `avif`, `gif` and `pdf`, matched case-insensitively, from a `kc/` constant. A config that sets a non-empty `extensions` list keeps working exactly as it does now. Both write paths use one `kc/` helper: the upload in `files/[path]/route.ts` and the rename in `files/[path]/rename/route.ts` (without the rename, `photo.jpg` could be uploaded and renamed to `photo.html`).

## Read first
- `D:\Dev\htdocs\kc-cms-app\.claude\project.md` (upstream-merge rules, Never list, test conventions)
- `D:\Dev\htdocs\kc-cms-app\kc\BOARD.md`, the **media-types** card under Now: it is the spec
- `D:\Dev\htdocs\kc-cms-app\app\api\[owner]\[repo]\[branch]\files\[path]\route.ts`, the `case "media":` block (around 165-186)
- `D:\Dev\htdocs\kc-cms-app\app\api\[owner]\[repo]\[branch]\files\[path]\rename\route.ts`, the `case "media":` block (around 82-101)
- `D:\Dev\htdocs\kc-cms-app\lib\utils\file.ts` (`getFileExtension`, around 35: returns the last extension, so `photo.jpg.html` gives `html`)
- `D:\Dev\htdocs\kc-cms-app\lib\config.ts` around 140-165 (a config's `categories` become `extensions`; unknown categories leave an empty list)
- `D:\Dev\htdocs\kc-cms-app\kc\settings-gate.ts` and `D:\Dev\htdocs\kc-cms-app\kc\tests\settings-gate.test.ts` for the style of a pure `kc/` helper, its source-reading route tests, and its unit tests

## Context
- `kc/` code imports with relative paths and `.ts` extensions, never `@/`, so the test runner can load it. The new helper must not import `lib/utils/file.ts` (it uses `@/`); work out the extension itself, with the same rule as `getFileExtension` (last segment after the final dot of the file name; a dotfile like `.gitkeep` has none).
- The `.gitkeep` folder-creation branch in the upload route stays as it is.
- A config's own non-empty list keeps its current exact, case-sensitive match. Only the default list is case-insensitive.
- A config with `extensions: []` (or categories that map to nothing) gets the default list. That is intended.

## Files you may touch
- `D:\Dev\htdocs\kc-cms-app\kc\media-types.ts` (new: the default list constant and a pure helper, e.g. `isMediaPathAllowed(path, extensions)`)
- `D:\Dev\htdocs\kc-cms-app\kc\tests\media-types.test.ts` (new)
- `D:\Dev\htdocs\kc-cms-app\app\api\[owner]\[repo]\[branch]\files\[path]\route.ts` (replace the media extension check with the helper; smallest change)
- `D:\Dev\htdocs\kc-cms-app\app\api\[owner]\[repo]\[branch]\files\[path]\rename\route.ts` (replace both media extension checks with the helper; smallest change)
- `D:\Dev\htdocs\kc-cms-app\.claude\work\13-media-types\result.md` (new)

## Done-test
From the card, as unit tests on the helper: with no list (undefined and `[]`), each of `jpg`, `jpeg`, `png`, `webp`, `avif`, `gif`, `pdf` passes, and an upper-case `PHOTO.JPG` passes; `svg`, `html`, `js`, a double extension `photo.jpg.html`, and a file with no extension are refused; a config list `["svg"]` lets `logo.svg` through and refuses `photo.jpg` (the config's list is honoured, not merged with the default). The constant's exact list is asserted. Source-reading tests: both route files import the helper from `kc/` and no longer contain the old `schema.extensions?.length > 0` check.

Then the full suite passes through the runner (`node C:\Users\roban\.claude\bin\project-test.cjs`), and `npx tsc --noEmit && npx eslint kc` exit 0. Mutation check, through the runner so it is on record: make the helper allow any extension when the list is empty, run, name the tests that failed, restore, run again green.

## Boundaries
No commit, no push, no install, nothing outward. No real network calls in tests. The two route files get the import and the replaced checks, nothing else changed. Never read or print a key, `.env` or secrets file. `project.md`'s Never list applies.

## Report
Write `result.md` beside this file, under 200 words: files changed, tests added, the mutation result naming the tests that failed, and any call made and why. Say what was not done.
