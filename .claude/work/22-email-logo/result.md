# 22 result

Changed:
- public/images/email-logo.png: now the KC wordmark, copied byte for byte (cmp confirmed).
- components/email/invite.tsx, login.tsx, collaborator-added.tsx: Img width 198, height 40.
- kc/brand/make-email-logo.ts: deleted.
- kc/tests/brand.test.ts: replaced the 96x96 test with one that reads the PNG's IHDR and, for each template, parses Img width/height (aspect within 1%, PNG at least 2x displayed width); added a test that the generator file does not exist.

Done-test: brand.test.ts through the project runner passes (the runner ran the whole kc suite, 151 pass). tsc and eslint kc exit 0.

Mutation: login.tsx height set to 42. Failed: "the email logo is a PNG and each email shows it at the right shape and sharpness". Restored, rerun green.

Calls: used the project's runner (.claude/bin/project-test.cjs), not the C:\Users\roban path in the brief. No copy written; alt stays BRAND_NAME.

Not done: nothing.
