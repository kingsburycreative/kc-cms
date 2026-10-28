Files changed: kc/save-baseline.ts (new, nextBaseline helper), components/entry/entry-form.tsx, components/entry/entry.tsx, kc/register/customizations.json (entry save-baseline), kc/tests/save-baseline.test.ts (new, 4 tests).

Call made: entry.tsx onSubmit swallowed save errors and never threw, so the form could not tell failure from success. It now returns true or false. entry-form.tsx calls form.reset(nextBaseline(...), { keepValues: true }) after onSubmit; a false result keeps the old baseline. keepValues means edits typed mid-save stay in the form and are compared against the new baseline.

Mutation: removed the reset line; "entry-form resets the baseline after onSubmit and keeps in-flight edits" failed (1 fail). Restored, full run green (549 pass).

The runner ignores the file filter and ran the whole suite each time. tsc --noEmit and eslint kc printed nothing (clean). Not tested in a browser; the RHF keepValues behaviour is from knowledge of the library.
