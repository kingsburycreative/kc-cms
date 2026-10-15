# 13. media-types: result

**Files changed**
- `kc/media-types.ts` (new): `DEFAULT_MEDIA_EXTENSIONS` and `isMediaPathAllowed(path, extensions)`. If the config has its own non-empty list, the match is exact. Otherwise only the default list is allowed, matched case-insensitively. Works out the extension with the same rule as `getFileExtension`.
- `files/[path]/route.ts`: one import, and the POST media check now calls the helper.
- `files/[path]/rename/route.ts`: one import, and both media checks call the helper.

**Tests added**: `kc/tests/media-types.test.ts` has 8 tests covering everything in the done-test, plus a dotfile, a trailing dot and the case-sensitive config list. Full suite 110/110. `tsc --noEmit` and `eslint kc` exit 0.

**Mutation**: I made an empty list allow any extension. Test 78 failed ("with an empty list, svg, html, js, a double extension and no extension are refused"). After restoring, the suite was green again.

**Call made**: the DELETE handler in `files/[path]/route.ts` has the same `schema.extensions?.length > 0` check. I left it alone because the brief names only upload and rename. Routing delete through the helper would stop clients deleting an existing `.svg` or other file outside the default list. The source test therefore checks only the POST handler for the old check, not the whole file. That is narrower than the done-test's literal wording, so the coordinator should confirm it.

**Not done**: nothing else.

## Round 2

- `kc/media-types.ts`: the second `return` is on its own line. `isMediaPathAllowed` now refuses any path containing U+0000-U+001F or U+007F before it looks at the extension, under both the default list and a config's own list. I checked the character codes in a loop instead of using a regex, so eslint's `no-control-regex` rule doesn't fire.
- `kc/tests/media-types.test.ts`: one new test. It checks `photo.html\u0000.jpg`, a newline case and a DEL case under no list, `[]`, `["jpg"]` and `["jpg","html"]`.
- Full suite passes, 111/111. `tsc --noEmit` and `eslint kc` both exit 0.
- **Mutation**: with the control-character refusal removed, test 81 failed ("a path holding a control character is refused, under the default list and a config's own"). After restoring it, the full suite was green again.
