# 108.05b result

Changed:
- `kc/guide/build.ts`: `build(outDir, pages, { drafts })`; with drafts on, every page is built and listed. CLI takes `--drafts` before or after outDir; outDir stays optional.
- `kc/guide/shell.ts`: `renderPage` takes a fourth argument, `showDraftLine`; it writes `<p class="draft">Draft, not yet approved</p>` above the h1 of unapproved pages. Default off, so existing callers are unchanged. Noindex meta, robots.txt and .htaccess are unchanged for drafts output.
- `kc/tests/guide-build.test.ts`: new describe "guide build with drafts", 4 tests (draft page built and in nav; draft line before h1 plus noindex/robots/htaccess; approved page has no draft line; drafts off leaves the page file and nav entry out).

Tests: done-test files pass (the runner reported the whole suite, 701 pass, 0 fail).

Mutation: forced `drafts` false in build.ts. Failed: "builds an unapproved page and lists it in the nav" and "puts the draft line at the top of an unapproved page, noindex like the rest". Restored, rerun green.

Not done: no `.draft` rule in `style.css` (not in my file list), so the line shows as plain paragraph text. Copy: one line, "Draft, not yet approved", given verbatim by the brief; prose skills not run.
