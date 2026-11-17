# 108.04b. Screenshots show demo text only, nothing of KC's (job: code)

Plan: `.claude/work/108-help-guide-plan/plan.md` card 04b. Rob, 2026-11-17: "We also need to ensure there is no KC stuff. It might make sense for this demo to just fake some of the text in place of 'pages loaded', 'recent changes', etc."

## Objective
The demo site is wired to KC's own analytics, so dashboard panels show KC's real data. Without changing the CMS, the screenshot tooling cleans each page before capture:
- Each manifest entry may carry `replace`: a list of `{ "selector", "text" }`; run.mjs sets the text of every matching element in the page just before the capture.
- Each entry may carry `hide`: a list of selectors whose elements are removed (or hidden) before capture, for panels with no demo stand-in (e.g. Staff only).
- After the swap, run.mjs fails that shot (non-zero exit, names the shot and the word) if the page's visible text still contains any entry of a top-level `deny` list in manifest.json, case-insensitive. Seed `deny` with: kingsbury, kc test site, kingsburycreative.com, skilled-trades-month, plus the client names from the client-names trap in `C:\Users\roban\.claude\pm\traps.md`.
- Made-up figures are plainly ordinary (e.g. 1,240 visitors) and fixed, so pictures only change when the CMS does.
Put the replace/hide/deny logic in pure, testable functions (e.g. in compare.ts or a function run.mjs exports, taking a DOM-like document or HTML string) so the test runs on a fixture page with no browser and no network. run.mjs calls the same logic inside the page via Playwright.

## Files you may touch
- `kc/guide/screenshots/run.mjs`, `kc/guide/screenshots/compare.ts`, `kc/guide/screenshots/manifest.json`
- `kc/tests/help-screenshots.test.ts` (extend)
- `.claude/work/108-04b-screenshot-masks/result.md`, `.claude/work/108-04b-screenshot-masks/progress.md`

## Done-test
`node --test kc/tests/help-screenshots.test.ts` passes, with new tests on a fixture HTML page: replace swaps the named element's text; hide removes the named element; the deny check fails a page that still says "Kingsbury" and passes the cleaned page; the seeded manifest deny list includes kingsbury. Mutation check through the shared runner (`node C:\Users\roban\.claude\bin\project-test.cjs`): make the deny check always pass, show the new test fails, restore.

## Rules
Read `.claude/project.md`. Relative imports with `.ts`, no `@/`. No package.json edits, no npm install, no network, never run against the demo site. Keep `progress.md` updated after each step. Do not commit. Write `result.md`: what changed, tests run, mutation result.

Secrets: never run a command or read a file that prints a secret value; values move file-to-file or pipe-to-pipe only (secret-put.cjs, secret-to-file.cjs).
