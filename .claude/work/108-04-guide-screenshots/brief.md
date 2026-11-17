# 108.04. Screenshot script and changed-pictures report (job: code)

## Objective
One command, `node kc/guide/screenshots/run.mjs`, opens the demo site (kc-test-site, with copies of each module's config) in headless Playwright Chromium at 375 and 1280 widths, takes every screenshot the manifest names (page, picture name, URL, steps), writes them to `kc/guide/img/`, and prints which guide pages have a picture that changed since the last run, by image hash kept in a hashes file beside the manifest. The comparison logic lives in `compare.ts` and is what the tests cover.

## Read first
- `.claude/project.md` (upstream-file rule, Never list, and the 2026-11-17 Playwright exception for this card)
- `docs/adr/0004-*.md` (guide is a static site)
- `.claude/work/108-help-guide-plan/plan.md` card 04 and its header note
- `kc/guide/build.ts`, `kc/guide/pages.ts`, `kc/guide/pages/placeholder.ts` (how pages and their `<img>` tags look)

## Requirements
- Add `playwright` as a devDependency only: `npm install --save-dev playwright`, then `npx playwright install chromium`. Nothing else in package.json changes. If either command is refused or fails, stop, say so in result.md, and touch nothing else.
- `compare.ts` (relative imports with `.ts`, never `@/`): pure functions. Given two hash maps (or two folders of images, hashed with node:crypto sha256), return the guide pages whose pictures differ (changed, added, removed), and none whose pictures all match. A function that lists every picture file a guide page's body uses (`<img src>`), so the test can check the manifest covers them.
- `manifest.json`: entries `{ page, picture, url, width, steps }`, steps a short list of plain actions (`goto`, `click <selector>`, `fill <selector> <text>`, `wait <selector>`). Cover the placeholder page's pictures (none is fine if it has none; the test then checks the rule on fixtures).
- `run.mjs` is the only file that talks to the demo site. Demo base URL from an env var `KC_GUIDE_DEMO_URL`; with none set, print how to set it and exit 1. No credentials in the file. No real client data. The suite never runs it.
- Tests use fixture folders written into a temp dir. No network.

## Files you may touch
- `kc/guide/screenshots/run.mjs`, `kc/guide/screenshots/manifest.json`, `kc/guide/screenshots/compare.ts`, `kc/guide/screenshots/hashes.json` (new)
- `kc/tests/help-screenshots.test.ts` (new)
- `package.json`, `package-lock.json` (playwright devDependency only)
- `.claude/work/108-04-guide-screenshots/result.md`, `.claude/work/108-04-guide-screenshots/progress.md`

## Done-test
`node --test kc/tests/help-screenshots.test.ts` passes: compare on two fixture folders lists exactly the pages whose picture hash differs and none that match, and the manifest names a picture file for every `<img>` a guide page uses. Run it through `node C:\Users\roban\.claude\bin\project-test.cjs` as the runner allows. Mutation check through the runner: make compare report every page; name the failing tests; restore it.

## Rules
Keep `progress.md` beside this brief, updated after every step. No commit. No network in tests. Do not run run.mjs against any site. Write `result.md`: what changed, the mutation result, the playwright version added, anything not verified.

Secrets: never run a command or read a file that prints a secret value; values move file-to-file or pipe-to-pipe only (secret-put.cjs, secret-to-file.cjs).
