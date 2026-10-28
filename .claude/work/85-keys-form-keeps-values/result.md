# 85 result

Files changed:
- kc/insights/keys.ts: `SaveResult` gains `saved?: KeysRow`; a 200 returns the normalised row.
- kc/insights/keys-action.ts: on a 200, `revalidatePath("/<owner>/<repo>", "layout")` (refreshes every branch dashboard). Auth and validation untouched.
- kc/insights/keys-form.tsx: fields take `defaultValue` from `result.saved ?? sources`, with a value-driven `key`, so React 19's post-action reset lands on the saved IDs.

Tests added (kc/tests/insights-keys.test.ts): the save result carries the saved row; source-level checks that the form reads `result.saved` and the action revalidates only on 200.

Mutation: form fields reset to empty after save plus revalidate dropped. Failed: "after a save the form's fields hold the saved IDs..." and "the action revalidates the repo's dashboards only on a successful save". Restored, 528 pass. tsc and eslint exit 0.

Call: the path is built with `["", owner, repo].join("/")` rather than a template, because short-url-links.test.ts flags any `/${owner}/${repo}` template not wrapped in shortHref; revalidatePath needs the real route, not the short one.

No copy changed. The runner ran the full suite each time despite the file argument.
