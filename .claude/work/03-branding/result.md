# 03. Branding: result

**New files:** `kc/brand.ts`, `kc/brand/make-email-logo.ts` (I ran it, and it wrote `public/images/email-logo.png`), `kc/tests/brand.test.ts`.

**Upstream files changed:** `app/globals.css` (only `--primary`, `--primary-foreground` and `--ring`, in both `:root` and `.dark`), `app/icon.svg`, `app/layout.tsx`, `components/about.tsx`, `components/sign-in.tsx`, `components/document-title.tsx`, the three files in `components/email/`, `lib/actions/collaborator.ts`, `lib/auth.ts` (one import and the subject string, nothing else) and `lib/commit-message.ts`.

**Tests:** 7 in `brand.test.ts`. The full suite passes: 30 of 30, run through the runner. `tsc --noEmit` and `eslint kc` both exit 0.

**Mutation check:** I put "(via Pages CMS)" back in `commit-message.ts` and set the `.dark` primary to `#C2602E`. Two tests failed: "no user-facing Pages CMS string outside the About credit" and ".dark primary text holds 4.5:1". I restored both files and the suite was green again.

**Calls I made:**
- The About marks used to sit on a `bg-primary` tile. I removed the tile classes so the logo is a plain terracotta circle (`r=12` in a 32 box).
- The credit, "Built on Pages CMS" with a link to the upstream GitHub repo, sits in the About description. The Website, Docs and GitHub links there still point to pagescms.org.
- `sign-in.tsx`, `app/(main)/page.tsx` and `collection-table.tsx` draw no Pages CMS logo (they have the GitHub icon and an L-shape), so I left those SVGs alone. `page.tsx` and `collection-table.tsx` have no changes.

**Not done:** none.
