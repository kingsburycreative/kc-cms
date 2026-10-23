# 22. Put the KC logo in the emails

## Objective
The three emails show Kingsbury Creative's wordmark instead of the generated 96x96 dot. Copy `D:\Dev\htdocs\kingsburycreative\img\logos\kc-wordmark-logo.png` (1624x328 RGBA) over `public/images/email-logo.png` byte for byte. In each template's `<Img>`, set `width="198"` and `height="40"` (aspect within 1% of the PNG's). Delete `kc/brand/make-email-logo.ts` so nothing can overwrite the logo; the in-CMS dot (BRAND_MARK elsewhere) stays.

## Read first
- `D:\Dev\htdocs\kc-cms-app\.claude\project.md` (upstream-merge rules, Never list, `kc/` imports use relative `.ts` paths)
- `D:\Dev\htdocs\kc-cms-app\.claude\work\15-plan-client-experience\plan.md`, card 12
- `D:\Dev\htdocs\kc-cms-app\kc\tests\brand.test.ts` (line ~133 reads email-logo.png and probably asserts the 96x96 dot; replace that test, and remove any import of make-email-logo)

## Files you may touch
- `D:\Dev\htdocs\kc-cms-app\public\images\email-logo.png`
- `D:\Dev\htdocs\kc-cms-app\kc\brand\make-email-logo.ts` (delete)
- `D:\Dev\htdocs\kc-cms-app\kc\tests\brand.test.ts`
- `D:\Dev\htdocs\kc-cms-app\components\email\invite.tsx`
- `D:\Dev\htdocs\kc-cms-app\components\email\login.tsx`
- `D:\Dev\htdocs\kc-cms-app\components\email\collaborator-added.tsx`
- `D:\Dev\htdocs\kc-cms-app\.claude\work\22-email-logo\result.md` (new)

## Done-test
`node --test kc/tests/brand.test.ts` passes, run through `node C:\Users\roban\.claude\bin\project-test.cjs` with that file. A test reads the PNG's IHDR width and height and, for each of the three templates, parses the `<Img>` width and height from source and asserts the aspect ratio matches the PNG's within 1% and the PNG width is at least twice the displayed width. A test asserts `kc/brand/make-email-logo.ts` does not exist. Also `npx tsc --noEmit && npx eslint kc` exit 0.

Mutation check, through the runner so it is on record: set one template's height to 42, run the done-test, name the tests that failed, restore, run again green.

## Boundaries
No commit, no push, no install, nothing outward. No real network calls in tests. Never read or print a key, `.env` or secrets file. No new client-facing copy (alt stays `BRAND_NAME`); if you think copy is needed, stop and say so. Smallest edit in each upstream file. Do not run the full suite.

## Report
Write `result.md` beside this file, under 200 words: files changed, tests added, the mutation result naming the tests that failed, any call made and why, and what was not done.
