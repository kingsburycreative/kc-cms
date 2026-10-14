# 06. Update banner

## Objective
On the admin page (Rob only, already behind `requireAdminSession`), when `kingsburycreative/kc-cms` has an open pull request from a branch named `upstream/<tag>` (opened by `.github/workflows/kc-upstream-sync.yml`), show a banner "Pages CMS <tag> is available" with a button opening that pull request on GitHub. No banner otherwise.

## Read first
- `D:\Dev\htdocs\kc-cms-app\.claude\project.md` (upstream-merge rules, Never list, test conventions)
- `D:\Dev\htdocs\kc-cms-app\kc\BOARD.md`, the **update-banner** card under Now (the full spec)
- `D:\Dev\htdocs\kc-cms-app\app\(main)\admin\page.tsx`
- `D:\Dev\htdocs\kc-cms-app\.github\workflows\kc-upstream-sync.yml` (line 39: branch is `upstream/$TAG`)
- Style to match: `D:\Dev\htdocs\kc-cms-app\kc\update\upstream.ts` and `D:\Dev\htdocs\kc-cms-app\kc\tests\update.test.ts`

## Context
- Pure module `kc/update/banner.ts`: takes GitHub's pulls list (array of objects with `head.ref`, `html_url`) and returns `{ tag, url } | null`. Only branches starting `upstream/`; tag is the rest of the branch name. `url` must start with `https://github.com/kingsburycreative/kc-cms/pull/`, else that PR is dropped. If several qualify, pick one deterministically (say which in result.md).
- Server-only fetch (e.g. `kc/update/banner-fetch.ts`): `GET https://api.github.com/repos/kingsburycreative/kc-cms/pulls?state=open`, no token, cached one hour (Next's `fetch` with `next: { revalidate: 3600 }` is fine). Any failure (network, non-200, bad JSON) returns null and logs one line. Make the fetcher injectable so a test can cover the failure path without the network.
- KC code under `kc/` imports with relative paths and `.ts` extensions. The admin page imports from `@/kc/...`. The admin page edit is the smallest hook: one call and one banner block. Render tag and url as plain text/attribute values, never HTML.

## Files you may touch
- `D:\Dev\htdocs\kc-cms-app\kc\update\banner.ts` (new)
- `D:\Dev\htdocs\kc-cms-app\kc\update\banner-fetch.ts` (new)
- `D:\Dev\htdocs\kc-cms-app\kc\tests\banner.test.ts` (new)
- `D:\Dev\htdocs\kc-cms-app\kc\tests\fixtures\pulls\none.json` (new)
- `D:\Dev\htdocs\kc-cms-app\kc\tests\fixtures\pulls\one-upstream.json` (new)
- `D:\Dev\htdocs\kc-cms-app\kc\tests\fixtures\pulls\non-upstream.json` (new)
- `D:\Dev\htdocs\kc-cms-app\kc\tests\fixtures\pulls\foreign-url.json` (new)
- `D:\Dev\htdocs\kc-cms-app\kc\tests\fixtures\pulls\several.json` (new)
- `D:\Dev\htdocs\kc-cms-app\app\(main)\admin\page.tsx`
- `D:\Dev\htdocs\kc-cms-app\.claude\work\06-update-banner\result.md` (new)

## Done-test
`kc/tests/banner.test.ts` with fixtures covers: none open gives null; one upstream PR open gives its tag and url; a non-upstream branch is ignored; a foreign URL (other repo, other host, `http://`) is rejected; the tag parsed from the branch name; the fetch failure path returns null.

Then the full suite passes through the runner (`node C:\Users\roban\.claude\bin\project-test.cjs`), and `npx tsc --noEmit && npx eslint kc` exit 0. Mutation check, through the runner so it is on record: break the new code on purpose, run, name the tests that failed, restore, run again green.

## Boundaries
No commit, no push, no install, nothing outward; no real network call in tests. Never edit `package.json`, `package-lock.json`, `db/migrations/`, anything under `app/api/`, `lib/auth.ts`, `lib/crypto.ts`, `lib/token.ts`. Plus `project.md`'s Never list.

## Report
Write `result.md` beside this file, under 200 words: files changed, tests added, the mutation result naming the tests that failed, and any call made and why. Say what was not done.
