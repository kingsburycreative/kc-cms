# Progress: plan customization-guard

- Read project.md, BOARD.md, project-test.cjs. No CLAUDE.md in repo root.
- Surveyed: kc/ files, upstream files importing kc/, lib/config.ts exports, fields/registry, kc-upstream-sync.yml (github.token), kc-cms docs NEW-CLIENT.md + DASHBOARD-SETTINGS.md, kc-cms PLAN.md:81 (fork is public), the first client's .pages.yml (no secrets by grep).
- Findings to flag: upstream PRs opened with github.token trigger no pull_request runs; fork is public; lib/config.ts not loadable under plain node --test; ci: none vs branch protection.
- Wrote plan.md: 12 cards (00 to 11). Nothing committed.
- Stray write: a placeholder file in the session scratchpad (noop.txt). Harmless, not in the repo.
- Done.

## Re-plan 2026-10-27 (cards 03 on, client half private)
- Read progress, plan.md, Rob's answers in kc-cms/audits/2026-10-27-customization-guard-decisions.md.
- Read project.md (both repos), kc-upstream-sync.yml, kc/register/load-config.ts, 69-deps-update result.md, claude-loop ciState.
- Found: .claude/work is tracked in the public repo; extra_checks is read by nothing in .claude/bin; ciState sees only posted checks; the second site's clone has no .pages.yml; kc-cms has no .github/ and no risky-path list; client names already in ~34 tracked public files.
- Call: private Action in kc-cms-server is the gate (hourly poll + manual dispatch, two jobs, token only in the report job). No local gate. ci stays none.
- Wrote plan.md: cards 03 to 15 rewritten, Wrong section rewritten, no client names in plan.md or this file (earlier lines here scrubbed of them).
- Stray write again: scratchpad\unused.txt, outside the plan folder. Harmless, not in the repo.
- Done. Nothing committed.
