# 108. Plan the help guide cards (job: docs)

## Objective
A plan file, D:\Dev\htdocs\kc-cms-app\.claude\work\108-help-guide-plan\plan.md, that turns the help guide feature into ordered cards the loop can run one by one. Each card names its job, the files it may touch and a done-test a command can confirm. You plan; you do not build.

## Read first
- D:\Dev\htdocs\kc-cms-app\.claude\project.md (Never list, copy rule, risky paths, upstream-merge rule: KC code lives under kc/)
- D:\Dev\htdocs\kc-cms-app\docs\PRD-help-guide.md
- D:\Dev\htdocs\kc-cms-app\docs\adr\0001-help-lives-at-cms-help.md, 0002-guide-tied-to-deployed-version.md, 0003-retire-pdf-and-client-guides.md
- D:\Dev\htdocs\kc-cms-app\public\guides\besciworks\index.html (the guide being split; 11 sections, screenshots in img/)
- D:\Dev\htdocs\kc-cms-app\kc\BOARD.md, .claude/work/15-plan-client-experience/plan.md (card 19), .claude/work/40-plan-short-urls/plan.md (card 53)
- C:\Users\roban\.claude\pm\traps.md
- C:\Users\roban\.claude\bin\jobs.json (the only valid job names)
- Client CMS configs, for module lists: D:\Dev\htdocs\besciworks\.pages.yml, D:\Dev\htdocs\henike-contracting\.pages.yml, D:\Dev\htdocs\thecupboard\.pages.yml, D:\Dev\htdocs\chris-adams\.pages.yml, D:\Dev\htdocs\kc-test-site\.pages.yml (demo template)

## Context
Rob, 2026-11-17: "one single guide that covers all the basics per version, PLUS individual modules (besciworks built the papers module, etc)... this doesn't need crazy checks and validations, it's a simple website and some screenshots. We do need to be 100% certain the copy is legible, understandable, and accurate, TIED TO VERSIONS." Keep each card's proof to what its job asks; size copy and docs cards Small.

Facts already checked by the PM: modules are defined only in each client repo's .pages.yml; kc-cms-app has no client-specific code (fields/custom is empty). The CMS version is in package.json ("2.1.8+kc.8") and tags kc-2.1.8.N. Henike lost its live Services FAQ through a CMS save on 2026-11-04 (commit 98ce106 in henike-contracting). Restore code: D:\Dev\htdocs\kc-cms-app\kc\history\.

Cards, in this order (merge or split only with a one-line reason in plan.md):
1. Check that kc/history restore would have recovered Henike's wiped FAQ; write the finding. If it would not, the plan adds a fix card before the save/undo page.
2. /help route and page shell, mobile first, public (no sign-in), version stamp from package.json on every page. Mind the upstream-merge rule (smallest hook outside kc/).
3. Screenshot script (Playwright, headless, demo site) and a report of which guide pages' pictures changed since the last run.
4. Core guide, split from the BeSciWorks guide. Copy via the prose skill as project.md says. Ends with a human step: Rob reads and approves each page.
5. Henike module pages (EN/FR pairs, project photo categories, Google reviews and rating, business details). Human step: Rob's read.
6. BeSciWorks module pages (Papers, Weekly, What Works, Insight Briefs). Human step: Rob's read.
7. In-app Help link that lists only the modules in that client's .pages.yml. The board already has card 19 "Sidebar: Insights, History and Help" and card 53 "In-app help text guard" (D:\Dev\htdocs\kc-cms-app\kc\BOARD.md, Now; plans in .claude/work/15-plan-client-experience/plan.md and .claude/work/40-plan-short-urls/plan.md). Read both and build on them; say in plan.md how this card relates.
8. Permanent redirect /guides/besciworks to /help, after Rob approves /help.

For every card: title line in the form `### NN. Title (job: <job>)`, an Objective, Files it may touch (paths), a Done-test with the exact command, and for copy cards a "Human step" line. Note any card that touches a risky path from project.md.

## Files you may touch
- `.claude/work/108-help-guide-plan/plan.md` (new)
- `.claude/work/108-help-guide-plan/progress.md` (new)
- `.claude/work/108-help-guide-plan/result.md` (new)

## Done-test
From D:\Dev\htdocs\kc-cms-app:
`node -e "const t=require('fs').readFileSync('.claude/work/108-help-guide-plan/plan.md','utf8');const c=t.split(/^### /m).slice(1);if(c.length<8)throw new Error('cards: '+c.length);for(const x of c){if(!/\(job: (docs|content|style|sweep|code|risky)\)/.test(x.split('\n')[0]))throw new Error('no job: '+x.split('\n')[0]);if(!/Done-test/i.test(x)||!/Files/i.test(x))throw new Error('missing files or done-test: '+x.split('\n')[0]);}console.log('ok',c.length)"`
Prints `ok` and the card count. One green run is the proof.

## Boundaries
No commit, no push, no install, nothing outward. Do not edit any file outside the list, including the PRD and ADRs; if one is wrong, say so in result.md. project.md's Never list applies.

## Progress
Keep `progress.md` beside this file from your first step, one line per step that changes a file or finishes a unit of work: done, files, next, anything half-written. Already there? You are resuming: read it and check the disk against it first.

## Report
Write `result.md` beside this file, under 200 words: the card list (number, title, job), anything in the PRD or ADRs you think is wrong, and what you could not confirm.
