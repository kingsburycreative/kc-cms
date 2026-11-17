Finding: restore does NOT bring back Henike's wiped FAQ when the CMS's schema lacks the fields (which is what wiped it); it does when the schema lists them. Read and save both rebuild content from the schema only (entries route.ts:165, files route.ts:108-133, lib/schema.ts deepMap). Full reasoning in finding.md.

Files: kc/tests/restore-wiped-field.test.ts, kc/tests/fixtures/henike-services-before.json, henike-services-after.json, henike-services-pages.yml, finding.md, progress.md, result.md. No helper added in kc/, no upstream file touched.

Done-test: the runner ran the whole suite (it ignored the file argument): 623 pass, 0 fail, both new tests ok (restore with schema listing the fields recovers them; with them removed it returns the wiped page).

Mutation: removed the faq list from the decks entry in the fixture schema; "when the schema lists the answers and FAQ, restore then save brings them back" failed (622 pass, 1 fail). Restored; 623 green. The code under test is upstream and off-limits, so the mutation is on the fixture.

Call made: Result line is "does not restore" because the schema Henike's CMS used lacked the fields; stale config cache is inferred, not checked.
