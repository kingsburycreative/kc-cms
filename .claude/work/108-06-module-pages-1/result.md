Round two. Renamed exported `module` to `moduleId` to clear @next/next/no-assign-module-variable.

Files changed: kc/guide/pages/module-bilingual.ts, module-business-details.ts, module-galleries.ts, module-reviews.ts, kc/guide/pages.ts (GuidePage type), kc/tests/help-pages.test.ts.

`npx tsc --noEmit && npx eslint kc` exit 0. Done-test through the runner: 723 pass, 0 fail.

Mutation: changed reviews moduleId to "reviewz". Failed: "has the four first module pages" (module guide pages suite), 722 pass 1 fail. Restored, re-run green.

Nothing else done. No commit.
