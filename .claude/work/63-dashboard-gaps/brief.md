# 63. Dashboard: the four gaps left against the mockup (Normal)

## Objective
Board card dashboard-gaps. Card 60 shipped the dashboard, and the coordinator compared it live (bc6f090, BeSciWorks, 1280px) with the approved mockup `.claude/work/39-plan-dashboard/mockup/desktop-1280.png` (and its `index.html`, `mockup.css`). Four things still differ. Fix each to the mockup; nothing else.

1. **Visits panel.** Live, the chart sits in a second bordered box inside the panel, leaving a blank band under it; the plot draws vertical gridlines; there is no legend and no Insights link. Mockup: one panel, no inner border; the big number with its change against the period before beside it ("412 ▲ 24%", or nothing when there is no earlier data); a sentence "Last 30 days. 333 the 30 days before." under it, following the chosen range; horizontal gridlines only; the period-before series as a dashed line when it exists; a legend "This period" / "Period before" (the second only when drawn); an "Open Insights" text link to the Insights page. Reuse `rangeChange` and the existing series; do not add a fetch.
2. **Recent changes.** Live: "hello changed papers" (staff also see the email address and file path). Mockup: "David updated the Home page", initials, relative time. Use the author's display name when the history has one; for the KC hello inbox account use "Kingsbury Creative"; never show an email address to a client. Name the thing changed by its label from `.pages.yml` (the page or collection label, and the entry title when the history gives a single entry file) instead of the collection key; verb from the change as card 60's plan says (added, updated, uploaded, else changed). Staff may keep the path as secondary text.
3. **Most viewed pages.** Live shows bare paths ("/", "/pathways-connect/"). Mockup: "Home /", "Pathways Connect /pathways-connect/": page name, then the path muted. Take names from the site's own page list where the CMS knows it (file-type page labels and collection entries), else fall back to the path. Same in the Insights page's Top pages if it shares the component.
4. **Staff strip.** Signed in with GitHub, the dashboard shows no "Staff only" strip. Check the gate (`hasGithubIdentity`) against what a GitHub session's user object actually holds, find why it renders nothing, and fix it so a GitHub-signed-in staff user sees version, repository link, GA property, Cloudflare site tag and Pages project; a client payload still holds none of it.

Copy rules as in card 60's plan (`.claude/work/41-plan-dashboard-fix/plan.md` item 10). Mobile first; check 375 and 1280 for sideways scroll.

## Read first
- `D:\Dev\htdocs\kc-cms-app\.claude\project.md`
- `.claude/work/41-plan-dashboard-fix/plan.md` (card 60 spec), the mockup files above
- `kc/dashboard.tsx`, `kc/dashboard-server.tsx`, `kc/dashboard.ts`, `kc/dashboard-visits.ts`, `kc/insights/chart.tsx`, `lib/authz-shared.ts`

## Files you may touch
- `kc/dashboard.tsx`, `kc/dashboard-server.tsx`, `kc/dashboard.ts`, `kc/dashboard-visits.ts`, `kc/dashboard-skeleton.tsx`, `kc/insights/chart.tsx`, and the Insights top-pages component if shared
- `lib/authz-shared.ts` only if the staff gate itself is wrong (say why in result.md)
- tests under `kc/tests/` for these
- `.claude/work/63-dashboard-gaps/result.md` and `progress.md` (new)

## Done-test
`node C:\Users\roban\.claude\bin\project-test.cjs` on the dashboard, insights-chart and dashboard-sections tests passes, then `npx tsc --noEmit && npx eslint kc` exit 0. New asserts: the visits panel has no nested bordered box and renders the legend and an Insights link; the change figure and "the 30 days before" sentence come from `rangeChange`; activity sentences use a display name, map the hello account to "Kingsbury Creative", never contain "@" in the client branch, and use the schema label; top pages render a name before the path when one is known and the bare path otherwise; the staff strip renders for a fixture user shaped like a real GitHub session and not for an email session.

Mutation check, through the runner: (1) put the email address back into the client sentence; (2) drop the label lookup so the collection key shows; (3) make the staff gate always false. Name the failing tests for each, restore, run green.

## Boundaries
No commit, no push, no install, no network. No `package.json`, lock file or `db/migrations/`. Never read or print a secret or `.env`. Keep `progress.md` beside this brief, updated after each step that changes a file: done so far, files touched, next step, anything half-written.

## Report
`result.md` beside this file, under 250 words: files changed, each string added, tests added, the cause of the missing staff strip, the mutation results naming the failing tests, anything left undone.
