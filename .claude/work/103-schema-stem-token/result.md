# 103 result

Files changed: new `kc/interpolate.ts` (safeAccess and interpolate moved there unchanged, plus `stemOf` and the `{stem}` rule; `value` typed `unknown` so tsc passes); `lib/schema.ts` (two functions removed, `import { safeAccess, interpolate } from "../kc/interpolate"` added; export block untouched). No existing kc test imported interpolate.

Tests added: `kc/tests/interpolate-stem.test.ts`, 8 tests (stem cases, data.stem wins, unchanged tokens, schema/route import text).

Calls: a real `data.stem` wins; the built-in stem applies only when it is undefined, before the `fields.` fallback.

Mutation: keeping the extension failed "{stem} is the file name without its extension", "removes only the final extension", "falls back to the last path segment". Making `{name}` return the stem failed "existing tokens are unchanged". Restored, green. tsc clean.

Not done / blocker: the runner ran the full suite despite the filter. `register-customizations.test.ts` "every upstream file importing kc/ is claimed" fails: `lib/schema.ts` must be added to the customizations register, a file outside this card's list. The PM needs to add that entry.
