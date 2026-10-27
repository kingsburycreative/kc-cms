# 69. Dependency updates and advisories (Risky)

## Objective
Next 16.2.1 has unauthenticated DoS advisories through 16.4.0. Bump `next` and `eslint-config-next` to the newest 16.4.x. Then run `npm audit` and `npm outdated`: take every patch or minor release that closes an advisory (better-auth, nodemailer, tiptap, markdown-it and zod were named by the sweep) and any other patch or minor that keeps everything below green. No major bumps: list each one in result.md with what it would need. The `version` field stays `2.1.8` (KC's version is 2.1.8+kc.1 elsewhere; do not change it).

## Read first
- D:/Dev/htdocs/kc-cms-app/.claude/project.md (Never list, and the deps-update exception)
- package.json
- The deps-update entry in kc/BOARD.md

## Start here
- Exception for this card only (Rob, 2026-10-27): you may edit package.json and package-lock.json and run `npm install` / `npm install <pkg>@<version>`. No `npm audit fix --force`. No other installs, no global installs.
- Bump in small groups (next + eslint-config-next first, then auth/mail, then editor, then the rest) and run the checks after each group, so a breaking bump is easy to find and drop.
- If a bump breaks code, prefer dropping that bump (note it in result.md) over editing upstream code. A fix to code outside kc/ needs the file named in result.md and must be the smallest change.

## Files you may touch
- `package.json`
- `package-lock.json`
- `kc/tests/auth-ip.test.ts` (only the import that moved in better-auth 1.7: `getIp` from `better-auth/dist/utils/get-request-ip.mjs` is now `getIP` in `@better-auth/core/utils/ip`; check its arguments match, keep every assertion)

## Done-test
All exit 0, each run once at the end on the final tree:
- `node C:\Users\roban\.claude\bin\project-test.cjs` (full suite, through the runner; run it in the background if over a minute)
- `npx tsc --noEmit`
- `npx eslint kc`
- `npm run build`
- `npm audit --omit=dev`: no high or critical left that has a fix. Name each remaining advisory in result.md and why it is unreachable or unfixable without a major.

No mutation check: this card adds no code. Give the before and after versions of every bumped package in result.md.

## Boundaries
No commit, no push, nothing outward beyond the npm registry for installs. project.md's Never list applies otherwise (no .env, no secrets, no deploy). No user-facing copy. This repo is public: result.md names advisories by package and severity, not exploit detail.

## Progress
Keep `progress.md` beside this file from your first step, one line per step that changes a file or finishes a unit of work: done, files, next, anything half-written. Already there? You are resuming: read it and check the disk against it first.
