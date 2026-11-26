start: read files
kc modules written: field-merge, stale-sync, email-normalise, save-error, otp-limit. next: entry wiring
entry-form valuesRef hook, update-banner, auth session, route cache catch done. next: entry.tsx wiring
entry.tsx wired (decideRefresh, banner, saveWithRetry, keepUnknownFields). next: tests
tests written; fixed history-restore regex compat. next: tsc/eslint, mutation
round2 start: gmail invite, field list reload, inline mark, copy skills
gmail: emailKeySql in kc/email-normalise.ts, collaborator-access lookups switched, kc/tests/invite-gmail.test.ts. next: run
gmail mutation done (invite-gmail test 1 failed, restored green). next: field list reload
configChanged/reloadedConfig added to kc/stale-sync.ts. next: entry.tsx wiring + inline marks
entry.tsx config reload + markedFields; entry-form markedFields setError hook. next: copy via skills
copy via prose/avoid-ai-writing/humanizer applied. next: stale-sync tests for configChanged, run done-test
suite green 916. next: tsc/eslint, mutation configChanged
round2 done: mutation configChanged done, result.md written
