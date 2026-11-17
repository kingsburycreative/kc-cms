# 108.01 result

Finding: `Result: restores` (see finding.md). Restoring the old Services page and saving writes the FAQ back word for word, because Henike's `.pages.yml` at 98ce106 already listed answer, source and faq. A schema that lacks them drops them on save (deepMap, lib/schema.ts), even from restored content; the test records that too.

Files added:
- kc/tests/restore-wiped-field.test.ts (6 tests, uses the real restoreState, initializeState, generateZodSchema, deepMap, sanitizeObject through kc/register/load-config.ts)
- kc/tests/fixtures/henike-services-before.json, henike-services-after.json, henike-pages.yml (trimmed, no contact details)
- .claude/work/108-01-restore-check/finding.md

Mutation: in "Result: restores. Restoring the old version and saving writes the FAQ back, word for word" the save ran with the faq-less schema. That test failed; restored; green again.

Call made: the brief listed .json fixtures (plan said .md); I followed the brief.

Not done / noticed: the runner ran the whole suite despite the file argument. Two failures predate this card and are not in my files: "every upstream file the fork changed is claimed" (docs/PRD-help-guide.md and docs/adr/0001-0004 unclaimed in the customizations register) and "the label is plain case: no uppercase or tracking classes". Whether a stale-settings guard is wanted is a separate card; the cause of Kirk's loss is unconfirmed.
