Files changed: kc/publish/status-fetch.ts, kc/tests/publish-status.test.ts.

Change: FetchLike response gained `status?: number`. A non-ok response now warns `publish status unknown: deployments request failed (HTTP <status>)`, with the status printed only when it is an integer. A thrown fetch or bad JSON keeps the old line. No token, URL, account id or header in the line.

Test added: "a 403 warns with its HTTP status, a thrown fetch warns without one". It checks one warn line, "HTTP 403" present, and no token, account id or api.cloudflare.com. The thrown fetch gives one line with no "HTTP". Existing tests pass (464 pass, 0 fail).

Mutation: dropped the status from the warn line. The new 403 test failed (nothing else did). Restored, green again.

Not done: nothing outstanding. The runner accepted the file path argument. No progress.md was kept (a single short pass).
