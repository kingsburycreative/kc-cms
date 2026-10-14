# 04 result

Files changed: `app/globals.css` (`.dark` only: --primary #D4713F, --primary-foreground #1A1714, --ring #D4713F), `kc/brand.ts` (BRAND_PRIMARY_DARK, BRAND_PRIMARY_FOREGROUND_DARK), `kc/tests/brand.test.ts`.

Tests: added "dark brand values" (constants match `.dark` primary, foreground, ring). Rewrote the per-selector contrast test: for `:root` and `.dark` it reads primary, foreground and background from the CSS, converts oklch to sRGB in the test (no dependency), and requires 4.5:1 for primary on background and foreground on primary.

Measured ratios: `:root` link 5.52, button 5.52. `.dark` link 5.86, button 5.30.

Mutation: `.dark --primary` set back to #A84F23. Failed: "dark brand values" and ".dark primary holds 4.5:1 ...". Restored; full suite green (31 pass, 0 fail).

Call made: the runner's file filter appeared to run the whole suite (31 tests each time), so every run was effectively full.

Not done: extra_checks (tsc, eslint) not run.
