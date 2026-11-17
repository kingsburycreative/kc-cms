# 108.03 result

**Files added:** `kc/guide/build.ts`, `shell.ts`, `pages.ts`, `version.ts`, `style.css`, `pages/placeholder.ts`, and `kc/tests/guide-build.test.ts`. Nothing upstream touched.

**What it does:** `node kc/guide/build.ts [outDir]` empties the out folder (refuses a folder holding the guide source), writes index.html, one `{slug}.html` per page, style.css, `img/` if present, robots.txt and .htaccess. Page links are relative, so it uploads anywhere. Version stamp read from package.json.

**Ignore rules:** `.gitignore` covers only `/out/` and `/.next/` at the repo root. `kc/guide/out/` is NOT covered. Someone with edit rights on .gitignore should add it.

**Copy written** (prose, avoid-ai-writing, humanizer loaded via Skill tool; avoid-ai-design run on the shell, kept plain: system sans, white base, one muted green accent, no eyebrow, no button pair, active nav item is a plain tint): site name "KC CMS guide"; index line "Step-by-step help for editing your website with KC CMS."; nav headings "Every site" and the client name; "Skip to the page"; stamp "Checked on KC CMS {version}, {date}"; placeholder page "Sample page" with a short stand-in paragraph and three steps.

**Tests:** 8 build tests plus a grouping test, all green. The runner ran the whole suite (635 pass) whatever the file argument.

**Mutation:** removed the noindex meta tag from shell.ts; "marks every page noindex" failed (suite 634 pass, 1 fail). Restored; green again.

**Not verified:** no browser frames captured (not asked for; the shell has not been viewed at 375px or 1280px). tsc/eslint not run per rules.
