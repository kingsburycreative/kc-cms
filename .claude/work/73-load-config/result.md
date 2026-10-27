Files changed: kc/register/load-config.ts (new), kc/tests/register-load.test.ts (new).

`loadCoreConfig()` registers tsx's ESM and CJS hooks, sets `TSX_TSCONFIG_PATH`, stubs `.css` requires, and returns `{ config, schema }`.

Tests (3): minimal config with a `kc:` block has no errors; unknown field type; `kc:` block with an unknown key names the key.

Round two: the unknown-field-type test now asserts the error. I inspected the real error: `{"message":"'type' must be a valid field type.","from":128,"to":133}`. The message names neither `title` nor `bogus`, so the test checks the message matches /field type/ and that the source slice at from..to is exactly `bogus`. That is the only way the error identifies the bad field.

Mutation: commented out the CJS register. All 3 tests failed (minimal config, unknown field type, unknown kc key). Restored; green.

Not done: the runner runs the whole suite on each call, so the filter did not narrow it.
