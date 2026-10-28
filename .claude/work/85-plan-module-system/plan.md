# Plan 85: the KC module system

## What exists

All four sites are Astro 7 on Cloudflare Pages with Zod schemas in `src/data/schemas.ts` and a `.pages.yml` held to them by a `cms-schemas` test. "Chris Ward" is `D:\Dev\htdocs\chris-adams` (repo `chrisadamsward1`, the Ward 1 candidate site). Pitt St is not scaffolded yet. It waits on ui-library 1.0.

Copied today: `no-raw-html.mjs` (BeSciWorks says "ported from Henike"), `tests/run.mjs` with build stamps, the cms-schemas `compare()` test, robots, sitemap, JsonLd, Base, SiteHeader and SiteFooter in three sites, and a business-facts schema in three. `D:\Dev\htdocs\kc-test-site` is the starter that every site gets copied from.

## Flags

1. kc-framework is a WordPress plugin. Every WP client site polls this repo's latest GitHub Release through Plugin Update Checker (`includes/updater.php`), and the plugin zip is built from tracked files. Modules can live there only if their tags never make a Release and `.gitattributes` keeps them out of the zip. I'd use a separate `kc-modules` repo. Card 01 asks Rob.
2. `C:\xampp\htdocs\kc-framework` has the same file list, HEAD `d59ae1b` and `.git/config` byte for byte. It is almost certainly the D: folder seen through a junction, so `D:\Dev\htdocs\kc-framework` is the real one. A third copy, which has drifted, sits in `brauwerk-hoffman/wp-content/plugins/`.
3. `KcSchema` in `kc/client-view.ts` is `.strict()`. A module list under `kc:` would break every site's CMS config, so it goes in `kc-modules.json`.
4. Pitt St says every page gets its own layout. Modules therefore ship data, schemas, logic and bare components, never page sections.
5. kc-framework has no loop copy and no `project.md`. Card work there needs `loop-copy.cjs` first.

## The module unit

It is one package, `@kingsburycreative/kc-modules`, published to GitHub Packages the way ui-library card 92 does it. Each module gets one folder, `modules/<name>/`, holding `module.json`, `cms.yml` (its `.pages.yml` fragment), `schema.ts`, its code and components, `tests/` (the module's own tests) and `site-checks.mjs` (checks run against a client's content).

A site lists its modules in `kc-modules.json` and edits `.pages.src.yml`. `npx kc-modules compose` writes `.pages.yml`. Because Cloudflare never runs tests, an Astro integration fails the build when `.pages.yml` has drifted from what compose would write. The client's `tests/modules.test.mjs` runs every module's site checks under its own `npm test`.

## Versions

Sites use a caret range, and Dependabot auto-merges patch bumps only. A patch release may not change `cms.yml` or a schema, and the release check enforces that. A drifted `.pages.yml` fails the build, so production stays on the last good deploy.

## ui-library

The tie is token names, never imports. Module CSS uses only `--ui-*` names that exist in ui-library's `tokens.css`, each with a fallback, so modules work today and pick up the theme once 1.0 lands.

## Upcoming modules, by current sites

- site-core (head and SEO, robots, sitemap, JSON-LD, `_headers`, 404): 4
- posts and news: 3
- business facts: 3
- gallery (Henike photos, Chris photo, Pitt planned): 3
- testimonials: 2
- dated events and countdown: 2
- test harness (`run.mjs`, build stamps): 2
- safe-markdown: 2
- consent and analytics: 1 plus the starter
- contact and quote form: 1
- legal pages: 1
- EN/FR: 1
- papers: 1
- payments: 1, waiting on the Helcim test (pittstbbq #2)
- video and map: 1

## Cards

### 01. Rob decides: where modules live, the installs, a package token
- Role: waiting on Rob
- Risky path: no
- Files: none
- Decide: kc-framework `modules/` or a new `kc-modules` repo. Approve installing `@kingsburycreative/kc-modules` (one dependency, `yaml`) in besciworks and henike-contracting. Create one read-only GitHub Packages token as a Cloudflare build secret for each site (the same token Pitt St needs for ui-library).

Done-test: Rob's answer is recorded in `D:\Dev\htdocs\kc-cms-app\.claude\work\85-plan-module-system\decision.md`, and `node -e "process.exit(require('fs').existsSync('D:/Dev/htdocs/kc-cms-app/.claude/work/85-plan-module-system/decision.md')?0:1)"` exits 0.

### 02. Package skeleton and module contract (kc-framework, Normal)
- Role: implementer
- Risky path: no
- `D:\Dev\htdocs\kc-framework\package.json`
- `D:\Dev\htdocs\kc-framework\.gitattributes`
- `D:\Dev\htdocs\kc-framework\modules\README.md`
- `D:\Dev\htdocs\kc-framework\tests\run.mjs`
- `D:\Dev\htdocs\kc-framework\tests\package.test.mjs`

Done-test: `node --test tests/package.test.mjs` asserts the package name, `files` and `exports`, and that every `modules/*/module.json` passes the contract. It also asserts that `git archive HEAD` lists `kc-framework.php` and no `modules/`, `tests/` or `package.json`.

### 03. Compose `.pages.yml` (kc-framework, Normal)
- Role: implementer
- Risky path: no
- `D:\Dev\htdocs\kc-framework\modules\_compose\compose.mjs`
- `D:\Dev\htdocs\kc-framework\bin\kc-modules.mjs`
- `D:\Dev\htdocs\kc-framework\tests\compose.test.mjs`
- `D:\Dev\htdocs\kc-framework\tests\fixtures\compose\`

Done-test: `node --test tests/compose.test.mjs` asserts each of these:
- module entries land at the `- module: <name>` markers in `.pages.src.yml`
- a name collision fails and names both sources
- a single `media:` object becomes a named list
- `kc:` passes through unchanged
- composing twice gives the same output
- `check` exits 1 with a diff on drift
- a module media extension outside the CMS default list is refused

### 04. ui-library token contract (kc-framework, Small)
- Role: implementer
- Risky path: no
- `D:\Dev\htdocs\kc-framework\modules\_ui\tokens-used.txt`
- `D:\Dev\htdocs\kc-framework\tests\tokens-contract.test.mjs`

Done-test: `node --test tests/tokens-contract.test.mjs` asserts that every `var(--x)` in `modules/**/*.{astro,css}` is a `--ui-*` name listed in `tokens-used.txt` (copied from `D:\Dev\htdocs\ui-library\tokens.css`) and has a fallback value.

### 05. Drift guard and client test hook (kc-framework, Normal)
- Role: implementer
- Risky path: no
- `D:\Dev\htdocs\kc-framework\modules\_site\integration.mjs`
- `D:\Dev\htdocs\kc-framework\modules\_site\test-hook.mjs`
- `D:\Dev\htdocs\kc-framework\tests\site-hook.test.mjs`

Done-test: `node --test tests/site-hook.test.mjs`, on a fixture site, asserts that a stale `.pages.yml` makes `astro:build:start` throw an error naming the file, and that a failing fixture site-check is reported under its module's name.

### 06. safe-markdown module (kc-framework, Normal)
- Role: implementer
- Risky path: no project-listed path, but it is the XSS boundary for Markdown content
- `D:\Dev\htdocs\kc-framework\modules\safe-markdown\module.json`
- `D:\Dev\htdocs\kc-framework\modules\safe-markdown\index.mjs`
- `D:\Dev\htdocs\kc-framework\modules\safe-markdown\tests\safe-markdown.test.mjs`

Done-test: `node --test modules/safe-markdown/tests/safe-markdown.test.mjs`. It refuses:
- raw HTML, block and inline
- `<script>` and `<iframe>`
- `javascript:`, `data:` and `http:` links
- protocol-relative links
- `JavaScript://https:/x` with control characters inserted

It accepts relative and https links, and the integration fails the build on any refusal. A mutation that drops the HTML-node check fails named tests.

### 07. papers module (kc-framework, Normal)
- Role: implementer
- Risky path: no
- `D:\Dev\htdocs\kc-framework\modules\papers\module.json`
- `D:\Dev\htdocs\kc-framework\modules\papers\cms.yml`
- `D:\Dev\htdocs\kc-framework\modules\papers\schema.ts`
- `D:\Dev\htdocs\kc-framework\modules\papers\citation.ts`
- `D:\Dev\htdocs\kc-framework\modules\papers\References.astro`
- `D:\Dev\htdocs\kc-framework\modules\papers\site-checks.mjs`
- `D:\Dev\htdocs\kc-framework\modules\papers\tests\papers.test.mjs`

Done-test: `node --test modules/papers/tests/papers.test.mjs` asserts these:
- the `cms.yml` fields mirror `paperSchema` (ported from BeSciWorks' `compare()`)
- APA and BibTeX output equals golden strings taken from BeSciWorks' current `dist/`
- the ORCID, DOI and JEL patterns accept blanks and refuse the wrong values
- the media entry is pdf only, with `rename: safe`

### 08. i18n module, EN/FR (kc-framework, Normal)
- Role: implementer
- Risky path: no
- `D:\Dev\htdocs\kc-framework\modules\i18n\module.json`
- `D:\Dev\htdocs\kc-framework\modules\i18n\routes.ts`
- `D:\Dev\htdocs\kc-framework\modules\i18n\expand.mjs`
- `D:\Dev\htdocs\kc-framework\modules\i18n\LanguageSwitch.astro`
- `D:\Dev\htdocs\kc-framework\modules\i18n\tests\i18n.test.mjs`

Done-test: `node --test modules/i18n/tests/i18n.test.mjs` asserts these:
- `pairFor`, `alternatesFor` (with x-default) and `switchFor` return Henike's current results, and `switchFor` is null for the English-only blog
- `expand` turns a `localized` entry into EN and FR groups with `src/content/{lang}/` paths and French labels
- `tokens-contract` passes on `LanguageSwitch.astro`

### 09. CMS accepts every composed block (kc-cms-app, Small)
- Role: implementer
- Risky path: no. CMS repo, tests only, no runtime change.
- `D:\Dev\htdocs\kc-cms-app\kc\tests\module-blocks.test.ts`
- `D:\Dev\htdocs\kc-cms-app\kc\tests\fixtures\modules\papers.pages.yml`
- `D:\Dev\htdocs\kc-cms-app\kc\tests\fixtures\modules\i18n.pages.yml`

Done-test: `node --test kc/tests/module-blocks.test.ts` asserts that each fixture passes `parseAndValidateConfig` (through `loadCoreConfig`) with zero errors, and that the same fixture with `kc.modules` added fails, naming `modules`.

### 10. Release workflow and patch rule (kc-framework, Risky)
- Role: implementer
- Risky path: yes, a workflow with a publish token
- `D:\Dev\htdocs\kc-framework\.github\workflows\kc-modules-release.yml`
- `D:\Dev\htdocs\kc-framework\bin\kc-modules.mjs`
- `D:\Dev\htdocs\kc-framework\tests\release.test.mjs`

Done-test: `node --test tests/release.test.mjs` asserts these about the workflow:
- the trigger is `modules-v*` tags only
- permissions are only `contents: read` and `packages: write`
- tests run before `npm publish`
- no step creates a GitHub Release

It also asserts that `release-check` fails a patch bump whose fixture diff touches `cms.yml` or `schema.ts`.

### 11. Rob tags modules-v0.1.0 and sets the site secrets
- Role: waiting on Rob
- Risky path: no
- Files: none

Done-test: `npm view @kingsburycreative/kc-modules version --registry=https://npm.pkg.github.com` prints `0.1.0`.

### 12. BeSciWorks adopts safe-markdown and papers (besciworks, Normal)
- Role: implementer
- Risky path: no
- `D:\Dev\htdocs\besciworks\kc-modules.json`
- `D:\Dev\htdocs\besciworks\.pages.src.yml`
- `D:\Dev\htdocs\besciworks\.pages.yml`
- `D:\Dev\htdocs\besciworks\astro.config.mjs`
- `D:\Dev\htdocs\besciworks\src\data\no-raw-html.mjs` (removed)
- `D:\Dev\htdocs\besciworks\src\data\citation.ts` (removed)
- `D:\Dev\htdocs\besciworks\tests\modules.test.mjs`

Done-test: `npm test` stays green. `npx kc-modules check` exits 0. The old and new `.pages.yml` parse to deep-equal objects. `dist/papers/**` HTML and `.bib` are byte-equal to the build before the change.

### 13. Henike adopts safe-markdown and i18n (henike-contracting, Normal)
- Role: implementer
- Risky path: no
- `D:\Dev\htdocs\henike-contracting\kc-modules.json`
- `D:\Dev\htdocs\henike-contracting\.pages.src.yml`
- `D:\Dev\htdocs\henike-contracting\astro.config.mjs`
- `D:\Dev\htdocs\henike-contracting\src\i18n\routes.ts`
- `D:\Dev\htdocs\henike-contracting\src\components\LanguageSwitch.astro`
- `D:\Dev\htdocs\henike-contracting\src\data\no-raw-html.mjs` (removed)
- `D:\Dev\htdocs\henike-contracting\tests\modules.test.mjs`

Done-test: `npm test` stays green, including `i18n.test.mjs` and `fr-*.test.mjs`. `.pages.yml` parses deep-equal to the current one. Every paired page in `dist/` has the same hreflang links and switch markup as before.

### 14. Security audit of the feature
- Role: security-auditor
- Risky path: yes
- `D:\Dev\htdocs\kc-framework\modules\safe-markdown\index.mjs`
- `D:\Dev\htdocs\kc-framework\modules\_compose\compose.mjs`
- `D:\Dev\htdocs\kc-framework\.github\workflows\kc-modules-release.yml`

Done-test: the audit's `result.md` lists findings by file and line. `node --test modules/safe-markdown/tests/safe-markdown.test.mjs tests/compose.test.mjs tests/release.test.mjs` passes after its fixes, including a test that composer refuses `svg`, `html` and `js` media extensions from a module.
