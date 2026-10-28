# 83 result

Files: kc/not-set-up.ts (new), kc/dashboard.tsx, components/repo/repo-sidebar.tsx, components/repo/repo-layout.tsx, app/(main)/[owner]/[repo]/[branch]/layout.tsx, kc/tests/not-set-up.test.ts (new), kc/tests/dashboard.test.ts (one assertion updated), kc/register/customizations.json (new not-set-up entry).

Behaviour: no media config shows the Media label with a muted non-link line; no insights entry shows the Site label with the same line; configured but no access stays hidden (new `insightsConfigured` flag, default true, separate from `hasInsights`); no kc.site shows muted plain text in the top-bar slot.

Copy (one piece, used three places): "Not set up yet" (the brief's wording). prose, avoid-ai-writing, humanizer and avoid-ai-design all ran via the Skill tool; no changes needed.

Mutation: live-site fallback as an anchor plus media early-return restored. Failed: "See live site sits in the PageHeader bar", "the sidebar keeps Media and Site groups with plain text, no link", "no kc.site renders the live-site slot as text". Restored, green (521 pass, includes register tests).

Note: the runner ran the whole suite even with a file arg. tsc and eslint output is in the run, see below.
