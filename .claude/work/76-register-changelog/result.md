Changed: kc/register/customizations.json, added "CHANGELOG-KC.md" to the files of the release-version entry.

Tests added: none.

Evidence: before the edit the register test failed with "unclaimed: CHANGELOG-KC.md" (pass 476, fail 1). After, pass 477, fail 0. No other unclaimed file.

Note: the runner ran the whole kc suite (the file arg did not filter it), so this was the full count.

Calls: the brief's runner path (C:\Users\roban\.claude\bin) was swapped for the project's own .claude/bin/project-test.cjs, per my instructions.

Not done: nothing. No commit.
