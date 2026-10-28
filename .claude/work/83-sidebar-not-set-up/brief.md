# 83. Sidebar and live-site "Not set up yet" states (Normal)

## Objective
When a site lacks the config, the sidebar's Media and Insights sections and the dashboard's "See live site" link vanish (Rob, 2026-10-27). Keep each in the layout and show a plain, non-link "Not set up yet" state instead: muted text, no fake link, no empty space. With config present, behaviour is unchanged.

## Read first
- .claude/project.md (upstream rule: `components/repo/repo-sidebar.tsx` and `app/(main)/[owner]/[repo]/[branch]/layout.tsx` are upstream files; smallest hook into `kc/`; the Copy rule)
- The sidebar-not-set-up entry in kc/BOARD.md (the spec)
- components/repo/repo-sidebar.tsx: `renderNavigationGroup` returns null for no nodes (Media), and the Site/Insights group only renders when `hasInsights`
- app/(main)/[owner]/[repo]/[branch]/layout.tsx line ~101 and page.tsx line ~23: `hasInsights` is false both when no insights entry exists AND when the user lacks insights access. Only the first case shows "Not set up yet"; a user without access still sees no Insights section. Pass a second, separate flag (e.g. `insightsConfigured`) rather than overloading `hasInsights`.
- kc/dashboard.tsx `LiveSiteLink` (returns null without a site) and where `liveSite` is built
- kc/tests/sidebar-dashboard.test.ts, kc/tests/sidebar-groups.test.ts, kc/tests/dashboard.test.ts (test style)
- kc/register/customizations.json (entries claiming the upstream files you touch; update descriptions, add an entry for any newly touched upstream file)

## Build
- Media group: when the config has no `media`, render the "Media" group label with a single muted, non-interactive line of not-set-up text (not a SidebarMenuButton, not a link).
- Site/Insights group: when insights is not configured for the site (and only then), render the "Site" group with the same muted not-set-up line in place of the Insights link. Configured but no access: hidden, as now.
- Live site: with no site URL, the top-bar slot shows the not-set-up text as plain muted text, no anchor.
- Put the shared text and any decision logic in a small helper under `kc/` (relative imports with `.ts`) and test it. Mobile first; the text wraps at 375px and leaves no blank gap.
- Copy: write the not-set-up wording with the `prose` skill, then run it through `avoid-ai-writing` and `humanizer` (Skill tool). Run `avoid-ai-design` on the UI. If the Skill tool refuses any of these, stop and say so in result.md. List each piece of copy in result.md.

## Files you may touch
- `components/repo/repo-sidebar.tsx`
- `components/repo/repo-layout.tsx`
- `app/(main)/[owner]/[repo]/[branch]/layout.tsx`
- `kc/dashboard.tsx`
- `kc/not-set-up.ts` (new helper; .tsx if it must hold JSX)
- `kc/tests/not-set-up.test.ts` (new), `kc/tests/sidebar-groups.test.ts`, `kc/tests/dashboard.test.ts`
- `kc/register/customizations.json`
- `.claude/work/83-sidebar-not-set-up/result.md`, `progress.md`

## Done-test
Tests that a config with no `media` and no insights entry still renders both the Media and Site sidebar sections with the not-set-up text (and no link in either), that a configured-but-no-access insights stays hidden, and that a site with no `kc.site` renders the live-site slot as text, not an anchor. Source-read tests are fine where rendering is not possible under node --test, as the existing sidebar tests do.

Mutation check through the runner: restore the early return for missing media config (a test fails); render the live-site fallback as an `<a>` (a test fails); restore.

At the end, each exit 0 on the final tree:
- `node C:\Users\roban\.claude\bin\project-test.cjs kc/tests/not-set-up.test.ts` and each test file you changed
- the register test through the same runner
- `npx tsc --noEmit`, `npx eslint kc`

## Boundaries
No commit, no push, no npm install, no package.json edits, no network in tests, no .env.

## Progress
Keep `progress.md` beside this file from your first step, one line per step that changes a file or finishes a unit of work: done, files, next, anything half-written. Already there? You are resuming: read it and check the disk against it first.
