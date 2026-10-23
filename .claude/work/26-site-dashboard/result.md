# 26 result

Files: `kc/dashboard.ts`, `kc/dashboard.tsx`, `kc/tests/dashboard.test.ts`, `app/(main)/[owner]/[repo]/[branch]/page.tsx`. No fixtures folder (inline fixtures).

Tests added: 5 in `dashboard.test.ts`. Done-test green; `tsc --noEmit` and `eslint kc` clean.

Mutation (Insights tile always added): failed "tiles follow the config, then Media and History", "no media and no content gives History only", "Insights tile only with access". Restored, green.

page.tsx: now a server component. It computes `hasInsights` like layout.tsx:100 and renders `Dashboard` from `kc/dashboard.tsx` (imported with the `.tsx` extension because `@/kc/dashboard` resolves to the `.ts` file). The no-content, config-enabled case still redirects to /configuration, from inside the component.

Calls: title comes from the content entry's label matched by path (the feed has no title), else the file name. Media is one tile linking to the first media entry.

Copy: "Recent edits", "History", "Media", "Insights", "Loading recent edits", "Nothing has been edited yet.", "Recent edits could not be loaded." Existing empty-state text kept. prose, avoid-ai-writing, humanizer, avoid-ai-design all ran; no changes resulted.

Not done: browser check at 375 and 1280 (headless, not possible). Layout is one column, two from 520px, three from lg.
