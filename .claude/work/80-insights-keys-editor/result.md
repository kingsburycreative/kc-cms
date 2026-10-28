# 80 result

Files: db/schema.ts (insightsKeysTable), db/migrations/0014_insights_keys.sql, meta/0014_snapshot.json (0013 plus the table), meta/_journal.json; kc/insights/map.ts (validators exported, siteTag tightened to letters/digits/dash/underscore, async table-first insightsSourcesFor/insightsPropertyFor with file fallback); new kc/insights/keys.ts (pure save logic), keys-db.ts, keys-action.ts (server action, session user, admin via GitHub repos.get permissions.admin with getUserToken), keys-form.tsx (useActionState form, works without JS); kc/dashboard-server.tsx (awaits, form in StaffStrip); insights/page.tsx, layout.tsx, page.tsx (await); kc/tests/dashboard-server.test.ts (regex follows await); register entry "insights-keys".

Tests: kc/tests/insights-keys.test.ts, 6 tests. Done-test, register, dashboard and insights tests green; tsc and eslint kc clean.

Mutation: admin check dropped -> "a GitHub user without admin on the repo is refused 403" failed. Reader skips table -> "a table row wins over the file" and "an admin saves and the next read returns..." failed. Restored, green.

Calls: siteTag was "any non-empty string", so no cf value could be refused; tightened it (existing fixtures still pass). Refusal returns status 403 in the action result (server action, not a route). A row with neither ga nor cf falls back to the file.

Copy (prose, avoid-ai-writing, humanizer: clean): "Analytics IDs"; "GA4 property ID"/"Digits only."; "Cloudflare site tag"/"Letters, digits and dashes."; "Pages project"/"Lowercase letters, digits and dashes."; "Leave a field empty to clear it."; "Save IDs"; "Saved. GA4: x, Cloudflare: y, Pages: z."; three BAD_ID errors; "Only an admin of this repository on GitHub can change these IDs."; "The IDs weren't saved. Try again." avoid-ai-design: surgical, existing tokens, no findings.

Not done: security-auditor pass (coordinator's); migration not run on the box.

## Round 2 (audit fix)
keys.ts: `isStaff` dep (403 NOT_STAFF "Only KC staff can change these IDs.") checked before GitHub; `reposUsing` dep refuses any ga/cf/pages bound to another repo (400 TAKEN: "Another site already uses this GA4 property ID." / "...Cloudflare site tag." / "...Pages project."); `fileReposUsing` pure. keys-db.ts: `tableReposUsing`. keys-action.ts: `hasAdminAccess(session.user)`, table + insights.json lookup. Tests added: non-staff repo admin refused; ID in another repo's row refused; ID in another repo's file entry refused; re-saving own IDs works. Mutation: staff check dropped -> "a GitHub repo admin who is not KC staff is refused 403" failed; reuse check dropped -> both "another repo ... table/file" tests failed; restored, green. Copy drafted to the prose rules by hand, skills not invoked this round. tsc/eslint not re-run (gate's).
