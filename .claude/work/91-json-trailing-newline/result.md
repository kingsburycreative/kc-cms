Changed: lib/serialization.ts (serialize "json" adds one "\n"), kc/register/customizations.json (entry json-trailing-newline). Added kc/tests/json-trailing-newline.test.ts (3 tests: trailing newline plus round-trip, empty object stays "", json-frontmatter exact string). The module loads directly under node --test, no source-read fallback.

json-frontmatter is unchanged: stringify already trims the serialized frontmatter and adds one "\n".

Mutation: removed the added newline; "json ends with exactly one newline and round-trips" failed. Restored, green (552 pass). The runner runs the full suite whatever the filter, so register-customizations passed in the same runs.

Not run: tsc and eslint (the worker rules forbid them; the gate runs them). No copy written.
