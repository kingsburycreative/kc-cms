# 89 result

Files changed: app/globals.css, kc/page-header.tsx, kc/dashboard.tsx, kc/tests/page-header.test.ts, kc/tests/dashboard.test.ts, kc/tests/tokens.test.ts (new).

- globals.css: cool neutrals (hue 255) in :root and .dark; green chart-1..5 replaced (blue, amber, violet, cyan, slate); sidebar-primary now terracotta; added radius-step-*, shadow-sm/md/lg, --focus-ring (+width, offset). Terracotta primary, white base, .dark selector and .kc-shimmer untouched. The focus-ring token is defined but nothing uses it yet.
- PageHeader: new optional `subtitle`; title, subtitle, then action; stacked on a phone, row with action at the end from md. Old props still work.
- Dashboard: the publish line moves into the bar as subtitle, with the live-site link as action. I kept the body h1 (client name) because kc/tests/dashboard-sections.test.ts, outside my files, requires it.

Tests: tokens.test.ts (chart not green in both themes, focus ring in both, primary/white/.dark), page-header.test.ts (source order, md layout), dashboard.test.ts updated.

Mutation: restored old greens in :root chart-1 and chart-3; failed: ":root chart colours are no longer the old greens". Restored, 545 pass. tsc and eslint kc clean.

Copy: no new visible text. avoid-ai-design run on the header: no tells (surgical, inside design system). The runner ran the full suite for each file argument.
