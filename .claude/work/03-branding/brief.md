# 03. Branding

## Objective
Every place a user sees "Pages CMS" says Kingsbury Creative instead, with every brand string and colour coming from one KC file, `kc/brand.ts`. The UI primary colour, the app icon, the in-app logo marks and the email logo become KC's terracotta. The MIT credit stays: the About dialog says "Built on Pages CMS" with a link to upstream.

## Read first
- D:\Dev\htdocs\kc-cms-app\.claude\project.md (rules: relative `.ts` imports inside `kc/`, Never list)
- D:\Dev\htdocs\kc-cms-app\kc\BOARD.md, the **branding** card under Now: it is the spec, follow it exactly
- Each file listed below before editing it
- D:\Dev\htdocs\kc-cms-app\kc\tests\update.test.ts as the test style to match

## Context
- Brand values: name `Kingsbury Creative CMS`, short name `KC CMS`, mark `#C2602E`, primary (buttons/links) `#A84F23` with white foreground. `#C2602E` on white text fails AA, so it is the mark colour only. Primary text must hold 4.5:1 in both `:root` and `.dark`.
- Mark: a terracotta circle, `r=12` centred in a 32x32 viewBox.
- Upstream files are allowed here because the card names them. Keep each upstream edit the smallest change: import from `kc/brand.ts` (upstream files may use a relative path or the `@/` alias; files under `kc/` must use relative `.ts` imports) and swap the string/SVG. In `app/globals.css` only change `--primary`, `--primary-foreground`, `--ring`.
- In inline SVGs, replace only the ones drawing the Pages CMS logo; leave other icons alone.
- `lib/auth.ts` is a risky path: change the email subject string only, nothing else. A security audit checks this.
- Email logo PNG: write `kc/brand/make-email-logo.ts` (Node built-ins only, `zlib` for deflate, own CRC32) that writes a 96x96 RGBA PNG of a `#C2602E` circle on transparent to `public/images/email-logo.png`; run it and commit the output.

## Files you may touch
- `kc/brand.ts` (new)
- `kc/brand/make-email-logo.ts` (new)
- `kc/tests/brand.test.ts` (new)
- `app/globals.css`
- `app/icon.svg`
- `app/layout.tsx`
- `app/(main)/page.tsx`
- `components/about.tsx`
- `components/sign-in.tsx`
- `components/document-title.tsx`
- `components/collection/collection-table.tsx`
- `components/email/collaborator-added.tsx`
- `components/email/invite.tsx`
- `components/email/login.tsx`
- `lib/actions/collaborator.ts`
- `lib/auth.ts`
- `lib/commit-message.ts`
- `public/images/email-logo.png`

## Done-test
`kc/tests/brand.test.ts`: greps every file listed above (except the new kc ones) and fails if any user-facing "Pages CMS" string remains outside the About credit; computes WCAG contrast from the hex values in `kc/brand.ts` and `app/globals.css` for the primary/foreground pairs in `:root` and `.dark` and requires >= 4.5; checks `public/images/email-logo.png` has the PNG signature and an IHDR of 96x96. Run `node --test kc/tests/brand.test.ts`.
Then the full suite passes through the runner (`node C:\Users\roban\.claude\bin\project-test.cjs`), and the mutation check through the runner too: break the new code on purpose (e.g. put a "Pages CMS" string back, or set primary to `#C2602E`), run, name the tests that failed, restore, run again green. Also confirm `npx tsc --noEmit` and `npx eslint kc` exit 0.

## Boundaries
No commit, no push, no install, nothing outward. Do not touch `LICENSE`, `package.json`, `package-lock.json`, `db/migrations/`. No design work beyond the listed values. project.md's Never list applies.

## Report
Write `result.md` beside this file, under 200 words: files changed, tests added, the mutation result naming the tests that failed, and any call made and why. Say what was not done.
