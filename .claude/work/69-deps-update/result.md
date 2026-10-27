# 69 result

Files changed: package.json, package-lock.json, kc/tests/auth-ip.test.ts (line 5 only: imports `getIP as getIp` from better-auth's nested `@better-auth/core/dist/utils/ip.mjs`; same `(req|Headers, options)` signature, assertions unchanged). Version stays 2.1.8.

Bumps (before -> after): next 16.2.1 -> 16.4.3, eslint-config-next 16.2.1 -> 16.4.3, @next/env -> 16.4.3, better-auth 1.5.6 -> 1.7.14, resend 6.x -> 6.35.0, nodemailer 8.0.4 -> 8.0.11, all @tiptap/* 3.20 -> 3.32.0. `npm update` refreshed markdown-it, linkify-it, prosemirror-view, defu, source-map-js, sharp, baseline-browser-mapping in the lock.

Done-test: suite 463/463 pass, tsc 0, eslint kc 0. `npm run build`: compile and TypeScript pass; it then fails collecting page data with "Missing BASE_URL" (lib/base-url.ts, env not set here), before any migrate. Not a dependency fault; compile treated as the check.

Audit left (prod): nodemailer high (fix only in 10.x, major), zod high (installed 3.25.76; fix only in 4.6.6+, major, schema API changes across lib/), esbuild moderate via drizzle-kit (CLI-only, fix is a major). Majors not taken: nodemailer 10, zod 4, drizzle-kit.

No mutation check (no code).
