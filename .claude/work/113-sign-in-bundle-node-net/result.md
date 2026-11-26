# 113 result

**Changed:** `kc/invite-code.ts` (new, import-free, holds `NOT_INVITED_CODE`); `kc/invite-gate.ts` re-exports it, so `lib/auth.ts` and its tests are untouched; `kc/sign-in-error.ts` imports from `invite-code.ts`; `kc/tests/sign-in-error.test.ts` imports the new module and checks gate and page share one code.

**Test added:** `kc/tests/client-imports.test.ts` walks static imports (`@/` and relative) from `components/sign-in.tsx` and from every `"use client"` module under `kc/` and `components/`, and fails on any Node built-in. It stops at `"use server"` modules (a client imports those as references, not bodies); without that it flagged three false positives through server actions. Checked the other sign-in imports: none reach a built-in.

**Mutation:** put `./invite-gate.ts` back in `sign-in-error.ts`: "the sign-in page's bundle reaches no Node built-in" and "every use-client module ... reaches no Node built-in" failed (chain ends at `node:net` in `otp-limit.ts`). Restored: 920/920 green. The runner ignored my file filter, so those were full-suite runs.

**next build:** `npx next build` (Turbopack) could not run here: `node_modules` is a symlink to the main checkout, and Turbopack refuses to resolve outside the worktree root. `npx next build --webpack` with placeholder env compiled all routes including `/sign-in`, with no `node:net` error. Not run on Turbopack, so the box's deploy is the real proof. Next prints a security-upgrade nudge (known vulnerable Next version); not acted on.

Removed the `.next` I created.
