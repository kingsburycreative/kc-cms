---
name: KC CMS app (fork of Pages CMS)
test_command: node --test --test-reporter=tap "kc/tests/**/*.test.ts"
test_match: (^|[;&|(]\s*)node\s+--test\b
test_failure_start: ^\s*not ok\b
test_summary: ^# (tests|pass|fail)\b
test_log: .claude/work/test-last.log
test_timeout_s: 300
verify_max_age_min: 30
board: kc/BOARD.md
ci: none
extra_checks: npx tsc --noEmit && npx eslint kc
gate_narrow: public/images/ => kc/tests/brand.test.ts
afk_log: .claude/work/log.md
scope_ignore: .claude/settings.json, .claude/settings.local.json, tsconfig.tsbuildinfo
---

# KC CMS app, for the shared agents

Kingsbury Creative's fork of Pages CMS (`hunvreus/pagescms`, MIT). It runs at
`cms.kingsburycreative.com` for every KC client. The plan, the decisions and
the box live in a separate private repo, `D:\Dev\htdocs\kc-cms` (read its
`PLAN.md`, steps 8, 10 and 12, for the cards here).

**Upstream merges must stay clean.** KC code lives under `kc/` and in
`.github/workflows/kc-*.yml`. Touching an upstream file (anything else) needs
the card to say so and name the file, and the change is the smallest hook into
`kc/` that works. Never edit `package.json`, `package-lock.json` or
`db/migrations/`: a new dependency or a schema change parks the card.

**Tests** are Node's own runner on TypeScript (Node 24 strips the types), in
`kc/tests/`, named `*.test.ts`. KC code under `kc/` imports with relative paths
and `.ts` extensions, never the `@/` alias, so the runner can load it. Done
means the card's done-test and the tests it added pass
(`node --test kc/tests/<file>.test.ts`), and a mutation check names which
tests failed when the new code was broken on purpose.

**Copy** (Rob, 2026-10-23): every piece of text a client or visitor reads
(emails, UI labels, help text, empty states, errors) is written with the
`prose` skill, then run through `avoid-ai-writing` and `humanizer`, invoked
with the Skill tool, never done by hand. UI a card builds or restyles gets
`avoid-ai-design`. `.claude/loop-settings.json` switches these on for loop
passes; if the Skill tool refuses one, park the card. result.md lists each
piece of copy written.

**Risky paths**, which go to the top model tier and a `security-auditor` pass:
`kc/insights/` (holds a Google service account key at runtime),
`.github/workflows/` (tokens and write permissions), anything touching
`lib/auth.ts`, `lib/crypto.ts`, `lib/token.ts` or `app/api/`.

**Never**: real network calls in tests (fixtures only); read or print a secret,
a `.env` file or `/root/kc-cms-secrets`; run `npm install`; deploy or ssh to the
box; push to `upstream`; commit `.env*`.

Exception (Rob, 2026-10-27): cards deps-update and nodemailer-major alone may edit `package.json` and `package-lock.json` and run `npm install`, for the dependency updates its board entry names.

Exception (Rob, 2026-10-27): card insights-keys-editor alone may add one new migration under `db/migrations/` and the matching table in `db/schema.ts`, for the analytics IDs table its board entry names.

Exception (Rob, 2026-10-26): the coordinator, not a card worker, may deploy with `server/deploy.sh` from kc-cms after the push's PRs are merged and the suite is green, telling Rob before and after.

**Decisions** (Rob, 2026-10-23, the rubric Sembr and BeSciWorks use):
consensus > security > correct long-term > best practice > KC CMS health > UX.
Consensus means the reviewers who looked at it (audits, a plan review) agree.
Apply it and act; when audits disagree or a round keeps finding the same
problem, decide by the rubric instead of parking for Rob, and name the call
in the log in one line so he can overrule it.
